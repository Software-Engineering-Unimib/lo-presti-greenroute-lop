import { MapTileServiceServer } from "./MapTileServiceServer";


// vero solo se questo file è stato eseguito direttamente
if(import.meta.url === `file://${process.argv[1]}`){
  const server = new MapTileServiceServer();
  await server.start();
}
