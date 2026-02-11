import { MapTileServiceServer } from "./MapTileServiceServer";


// vero solo se questo file è stato eseguito direttamente
if(require.main === module) {
  (async () => {
    const server = new MapTileServiceServer();
    await server.start();
  })();
}
