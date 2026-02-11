import { RouteServer } from './RouteServer';


// vero solo se questo file è stato eseguito direttamente
if(require.main === module) {
  (async () => {
    const server = new RouteServer();
    await server.start();
  })();
}
