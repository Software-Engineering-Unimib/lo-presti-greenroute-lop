import { RouteServer } from './RouteServer.js';


// vero solo se questo file è stato eseguito direttamente
if(import.meta.url === `file://${process.argv[1]}`){
    const server = new RouteServer();
    await server.start();
}
