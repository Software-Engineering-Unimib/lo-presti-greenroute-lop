import { RouteServer } from './RouteServer';


// vero solo se questo file è stato eseguito direttamente
if(import.meta.url === `file://${process.argv[1]}`){
  (async () => {
    const server = new RouteServer();
    await server.start();
  })();
}
