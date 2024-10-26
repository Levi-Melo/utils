import express, { Express } from "express";
import cors from 'cors'
import { createExpressRoutes } from "./routes";

export async function createExpressApp(props: any) {
    const app: Express = express();
    const routes = createExpressRoutes()


    const options: cors.CorsOptions = {
        origin: async function (origin, callback) {

            if (!origin) {
                callback(null, true);
                return
            }

            const whitelist = [
                "127.0.0.1",
                "http://127.0.0.1",
            ];

            if (whitelist.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
                return
            } else {
                console.info(`origin [${origin}] not allowed by cors`);
                callback(new Error("Not allowed Access to API by CORS"));
                return
            }

        },
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    };

    app.options("*", cors(options));
    app.use(cors(options));
    app.use(express.json({ limit: "60mb" }))
    app.use('/api', routes)

    return app
}