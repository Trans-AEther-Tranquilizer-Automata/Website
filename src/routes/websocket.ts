import { echo } from "@atums/echo";
import type { ServerWebSocket } from "bun";

const routeDef: RouteDef = {
	method: "websocket",
	accepts: "*/*",
	returns: "text/plain",
};

async function handler(): Promise<Response> {
	return new Response("WebSocket endpoint", { status: 426 });
}

function safeSend<T>(ws: ServerWebSocket<T>, data: string): void {
	try {
		ws.send(data);
	} catch (error) {
		echo.error({ message: "WebSocket send error", error });
	}
}

const websocket: WebSocketHandler = {
	message(ws, message) {
		echo.info(`WebSocket received: ${message}`);
		safeSend(ws, `You said: ${message}`);
	},

	open(ws) {
		echo.info("WebSocket connection opened.");
		safeSend(ws, "Welcome to the WebSocket server!");
	},

	close(_ws, code, reason) {
		echo.warn(`WebSocket closed with code ${code}, reason: ${reason}`);
	},
};

export { handler, routeDef, websocket };
