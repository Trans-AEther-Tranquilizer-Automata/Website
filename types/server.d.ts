import type { Server, ServerWebSocket } from "bun";

declare global {
	type QueryParams = Record<string, string>;

	type HttpMethod =
		| "GET"
		| "POST"
		| "PUT"
		| "DELETE"
		| "PATCH"
		| "HEAD"
		| "OPTIONS";

	type BodyType =
		| "json"
		| "multipart"
		| "urlencoded"
		| "text"
		| "raw"
		| "buffer"
		| "blob";

	type RequestBody =
		| Record<string, unknown>
		| FormData
		| string
		| ArrayBuffer
		| Blob
		| null;

	interface ExtendedRequest extends Request {
		startPerf: number;
		query: Query;
		params: Params;
		requestBody: RequestBody;
	}

	type RouteDef = {
		method: HttpMethod | HttpMethod[] | "websocket";
		accepts: string | null | string[];
		returns: string;
		needsBody?: BodyType;
	};

	type Handler = (
		request: ExtendedRequest,
		server: Server,
	) => Promise<Response> | Response;

	type WebSocketHandler<T = unknown> = {
		message?: (ws: ServerWebSocket<T>, message: string) => void;
		open?: (ws: ServerWebSocket<T>) => void;
		close?: (ws: ServerWebSocket<T>, code: number, reason: string) => void;
		drain?: (ws: ServerWebSocket<T>) => void;
	};

	type RouteModule = {
		handler: Handler;
		routeDef: RouteDef;
		websocket?: WebSocketHandler;
	};
}

export {};
