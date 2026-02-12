import { Request, Response } from 'express';
import { ServiceServerOptions, ServiceServer } from '../../common/src/ServiceServer';
import { TileCache } from './TileCache';
import { TileFetcher } from './TileFetcher';

export interface MapTileServiceOptions extends ServiceServerOptions {
  redisUrl?: string;
  tileTtlSeconds?: number;
  userAgent?: string;
}


export class MapTileServiceServer extends ServiceServer {
  private readonly cache: TileCache;
  private readonly fetcher: TileFetcher;

  constructor(options: MapTileServiceOptions = {}) {
    super(options);

    this.cache = new TileCache(options.redisUrl, options.tileTtlSeconds);
    this.fetcher = new TileFetcher(options.userAgent);

    this.app.get('/:zParam/:xParam/:yParam.png', this.handleTileRequest.bind(this));
  }

  private async handleTileRequest(req: Request, res: Response): Promise<void> {
    const { zParam, xParam, yParam } = req.params;
    const z = String(zParam);
    const x = String(xParam);
    const y = String(yParam);


    const tileValuesString = `z:${z}, x:${x}, y:${y}`;

    try {
      const cachedTile = await this.cache.get(z, x, y);
      if (cachedTile) {
        console.log('Cache HIT', tileValuesString);
        res.set('Content-Type', 'image/png');
        res.send(cachedTile);
      }
      else {
        console.log('Cache MISS', tileValuesString);
        const tileBuffer = await this.fetcher.fetchTile(z, x, y);
        
        await this.cache.set(z, x, y, tileBuffer);
        
        res.set('Content-Type', 'image/png');
        res.send(tileBuffer);
      }
    }
    catch (err: unknown) {
      const message = (err as any).message || '""';
      const status = (err as any).status || 500;
      console.error('Map tile service error:', `message:${message}, status:${status}`);
      res.status(500).send('Internal server error');
    }
  }

  async onStart(): Promise<void> {
    await this.cache.connect();
    console.log('Connected to Redis');
  }

  async onShutdown(): Promise<void> {
    await this.cache.disconnect();
    console.log('Redis disconnected');
  }
}