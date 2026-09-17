import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { SERVER_PORT } from "@ongaku/constants/server";

export function initServer() {
    const app = new Hono();

    app.get("/", (c) => {
        return c.text("Hello Hono!");
    });

    serve(
        {
            fetch: app.fetch,
            port: SERVER_PORT,
        },
        (info) => {
            console.log(`Server is running on http://localhost:${info.port}`);
        },
    );
}
