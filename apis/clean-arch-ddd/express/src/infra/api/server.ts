import { createServer } from 'http';
import { createExpressApp } from './app';

process.on("uncaughtException", (e) => {
    console.log('uncaughtException', e)
});

(async () => {
const app = await createExpressApp({})
const server = createServer(app)


server.listen(3333, () => {
    console.info(`Worker ${process.pid} started`);
    console.info(`SERVER LISTENING ON PORT ${3333}`);
});

})()