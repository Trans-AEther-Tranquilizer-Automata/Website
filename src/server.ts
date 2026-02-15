import { resolve } from "node:path";
import { Echo, echo } from "@atums/echo";
import {
	type BunFile,
	FileSystemRouter,
	type MatchedRoute,
	type ServerWebSocket,
} from "bun";
import { environment } from "#environment";
import { reqLoggerIgnores } from "#environment/constants";
import { serveView } from "#utils/view";

async function parseRequestBody(
	request: Request,
	bodyType: BodyType | undefined,
	contentType: string | null,
): Promise<RequestBody> {
	if (!bodyType) return null;

	const parsers: Record<
		BodyType,
		{
			expectedType: string | null;
			parse: () => Promise<RequestBody>;
			fallback: RequestBody;
		}
	> = {
		json: {
			expectedType: "application/json",
			parse: async () => (await request.json()) as Record<string, unknown>,
			fallback: {},
		},
		multipart: {
			expectedType: "multipart/form-data",
			parse: async () => await request.formData(),
			fallback: new FormData(),
		},
		urlencoded: {
			expectedType: "application/x-www-form-urlencoded",
			parse: async () => {
				const formData = await request.formData();
				return Object.fromEntries(formData.entries()) as Record<string, string>;
			},
			fallback: {},
		},
		text: {
			expectedType: null,
			parse: async () => await request.text(),
			fallback: "",
		},
		raw: {
			expectedType: null,
			parse: async () => await request.arrayBuffer(),
			fallback: new ArrayBuffer(0),
		},
		buffer: {
			expectedType: null,
			parse: async () => await request.arrayBuffer(),
			fallback: new ArrayBuffer(0),
		},
		blob: {
			expectedType: null,
			parse: async () => await request.blob(),
			fallback: new Blob(),
		},
	};

	const parser = parsers[bodyType];

	if (
		parser.expectedType &&
		contentType !== parser.expectedType &&
		!(bodyType === "text" && contentType?.startsWith("text/"))
	) {
		return parser.fallback;
	}

	try {
		return await parser.parse();
	} catch (error) {
		echo.warn({ message: `Failed to parse ${bodyType} body`, error });
		return parser.fallback;
	}
}

class ServerHandler {
	private router: FileSystemRouter;

	constructor(
		private port: number,
		private host: string,
	) {
		this.router = new FileSystemRouter({
			style: "nextjs",
			dir: resolve("src", "routes"),
			fileExtensions: [".ts"],
			origin: `http://${this.host}:${this.port}`,
		});
	}

	public initialize(): void {
		const server = Bun.serve({
			port: this.port,
			hostname: this.host,
			fetch: this.handleRequest.bind(this),
			websocket: {
				message: this.handleWebSocketMessage.bind(this),
				open: this.handleWebSocketOpen.bind(this),
				close: this.handleWebSocketClose.bind(this),
			},
		});

		const echoChild = new Echo({ disableFile: true });

		echoChild.info(
			`Server running at http://${server.hostname}:${server.port}`,
		);
		this.logRoutes(echoChild);
	}

	private logRoutes(echo: Echo): void {
		echo.info("Available routes:");

		const sortedRoutes: [string, string][] = Object.entries(
			this.router.routes,
		).sort(([pathA]: [string, string], [pathB]: [string, string]) =>
			pathA.localeCompare(pathB),
		);

		for (const [path, filePath] of sortedRoutes) {
			echo.info(`Route: ${path}, File: ${filePath}`);
		}
	}

	private async serveStaticFile(
		request: ExtendedRequest,
		pathname: string,
		ip: string,
	): Promise<Response> {
		let filePath: string;
		let response: Response;

		try {
			const publicDir = resolve("public");

			filePath = resolve(`.${pathname}`);

			if (!filePath.startsWith(publicDir)) {
				response = new Response("Forbidden", { status: 403 });
				this.logRequest(request, response, ip);
				return response;
			}

			const file: BunFile = Bun.file(filePath);

			if (await file.exists()) {
				response = new Response(file, {
					headers: {
						"Cache-Control":
							"public, max-age=86400, stale-while-revalidate=43200",
					},
				});
			} else {
				echo.warn(`File not found: ${filePath}`);
				response = new Response("Not Found", { status: 404 });
			}
		} catch (error) {
			echo.error({
				message: `Error serving static file: ${pathname}`,
				error: error as Error,
			});
			response = new Response("Internal Server Error", { status: 500 });
		}

		this.logRequest(request, response, ip);
		return response;
	}

	private logRequest(
		request: ExtendedRequest,
		response: Response,
		ip: string | undefined,
	): void {
		const pathname = new URL(request.url).pathname;

		if (
			reqLoggerIgnores.ignoredStartsWith.some((prefix) =>
				pathname.startsWith(prefix),
			) ||
			reqLoggerIgnores.ignoredPaths.includes(pathname)
		) {
			return;
		}

		echo.custom(`${request.method}`, `${response.status}`, [
			request.url,
			`${(performance.now() - request.startPerf).toFixed(2)}ms`,
			ip || "unknown",
		]);
	}

	private handleWebSocketMessage(
		ws: ServerWebSocket<{ routeModule?: RouteModule }>,
		message: string,
	): void {
		const data = ws.data;
		if (data?.routeModule?.websocket?.message) {
			data.routeModule.websocket.message(ws, message);
		}
	}

	private handleWebSocketOpen(
		ws: ServerWebSocket<{ routeModule?: RouteModule }>,
	): void {
		const data = ws.data;
		if (data?.routeModule?.websocket?.open) {
			data.routeModule.websocket.open(ws);
		}
	}

	private handleWebSocketClose(
		ws: ServerWebSocket<{ routeModule?: RouteModule }>,
		code: number,
		reason: string,
	): void {
		const data = ws.data;
		if (data?.routeModule?.websocket?.close) {
			data.routeModule.websocket.close(ws, code, reason);
		}
	}

	private async handleRequest(
		request: Request,
		server: ReturnType<typeof Bun.serve>,
	): Promise<Response> {
		const extendedRequest: ExtendedRequest = request as ExtendedRequest;
		extendedRequest.startPerf = performance.now();

		const headers = request.headers;
		let ip = server.requestIP(request)?.address;
		let response: Response;

		if (!ip || ip.startsWith("172.") || ip === "127.0.0.1") {
			ip =
				headers.get("CF-Connecting-IP")?.trim() ||
				headers.get("X-Real-IP")?.trim() ||
				headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
				"unknown";
		}

		const pathname: string = new URL(request.url).pathname;

		const baseDir = resolve("public", "custom");
		const customPath = resolve(baseDir, pathname.slice(1));

		if (!customPath.startsWith(baseDir)) {
			response = new Response("Forbidden", { status: 403 });
			this.logRequest(extendedRequest, response, ip);
			return response;
		}

		const customFile = Bun.file(customPath);
		if (await customFile.exists()) {
			response = new Response(customFile, {
				headers: {
					"Cache-Control":
						"public, max-age=86400, stale-while-revalidate=43200",
				},
			});
			this.logRequest(extendedRequest, response, ip);
			return response;
		}

		if (pathname.startsWith("/public")) {
			return await this.serveStaticFile(extendedRequest, pathname, ip);
		}

		const match: MatchedRoute | null = this.router.match(request);
		let requestBody: RequestBody = null;

		if (match) {
			const { filePath, params, query } = match;

			try {
				const routeModule: RouteModule = await import(filePath);

				if (routeModule.routeDef.method === "websocket") {
					if (
						server.upgrade(request, { data: { routeModule, params, query } })
					) {
						return new Response("", { status: 101 });
					}
					response = new Response("WebSocket upgrade failed", { status: 400 });
					this.logRequest(extendedRequest, response, ip);
					return response;
				}
				const contentType: string | null = request.headers.get("Content-Type");
				const actualContentType: string | null = contentType
					? (contentType.split(";")[0]?.trim() ?? null)
					: null;

				requestBody = await parseRequestBody(
					request,
					routeModule.routeDef.needsBody,
					actualContentType,
				);

				const requestMethod = request.method as HttpMethod;
				if (
					(Array.isArray(routeModule.routeDef.method) &&
						!routeModule.routeDef.method.includes(requestMethod)) ||
					(!Array.isArray(routeModule.routeDef.method) &&
						routeModule.routeDef.method !== requestMethod)
				) {
					response = Response.json(
						{
							success: false,
							code: 405,
							error: `Method ${request.method} Not Allowed, expected ${
								Array.isArray(routeModule.routeDef.method)
									? routeModule.routeDef.method.join(", ")
									: routeModule.routeDef.method
							}`,
						},
						{ status: 405 },
					);
				} else {
					const expectedContentType: string | string[] | null =
						routeModule.routeDef.accepts;

					let matchesAccepts: boolean;

					if (Array.isArray(expectedContentType)) {
						matchesAccepts =
							expectedContentType.includes("*/*") ||
							expectedContentType.includes(actualContentType || "");
					} else {
						matchesAccepts =
							expectedContentType === "*/*" ||
							actualContentType === expectedContentType;
					}

					if (!matchesAccepts) {
						response = Response.json(
							{
								success: false,
								code: 406,
								error: `Content-Type ${actualContentType} Not Acceptable, expected ${
									Array.isArray(expectedContentType)
										? expectedContentType.join(", ")
										: expectedContentType
								}`,
							},
							{ status: 406 },
						);
					} else {
						extendedRequest.params = params;
						extendedRequest.query = query;
						extendedRequest.requestBody = requestBody;

						response = await routeModule.handler(extendedRequest, server);

						if (routeModule.routeDef.returns !== "*/*") {
							response.headers.set(
								"Content-Type",
								routeModule.routeDef.returns,
							);
						}
					}
				}
			} catch (error: unknown) {
				const errorObj =
					error instanceof Error ? error : new Error(String(error));
				echo.error({
					message: `Error handling route ${request.url}`,
					error: errorObj,
				});

				response = Response.json(
					{
						success: false,
						code: 500,
						error: "Internal Server Error",
					},
					{ status: 500 },
				);
			}
		} else {
			response = await serveView(
				"404",
				{ BOT_INVITE: environment.botInvite },
				404,
			);
		}

		this.logRequest(extendedRequest, response, ip);
		return response;
	}
}

const serverHandler: ServerHandler = new ServerHandler(
	environment.port,
	environment.host,
);

export { serverHandler };
