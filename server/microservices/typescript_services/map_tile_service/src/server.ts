import { Request, Response } from 'express';
import { createClient, RedisClientType } from 'redis';
import { ServiceServerOptions, ServiceServer } from './ServiceServer';


export interface MapTileServiceOptions extends ServiceServerOptions {
  redisUrl?: string;
  tileTtlSeconds?: number;
  userAgent?: string;
}


export class TileCache {
  private client: RedisClientType;
  private tileTtlSeconds: number;

  constructor(redisUrl?: string, tileTtlSeconds?: number) {
    redisUrl = redisUrl ?? 'redis://redis:6379';
    this.tileTtlSeconds = tileTtlSeconds ?? 60 * 60 * 24 * 7; 

    this.client = createClient({ url: redisUrl });
  }

  private getTileKey(x: string, y: string, z: string): string {
    return `tile:${z}:${x}:${y}`;
  }

  async connect(): Promise<void> {
    this.client.on('error', (err: Error) => {
      console.error('Redis error:', err);
    });
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (err) {
      // se quit fallisce, prova disconnect
      await this.client.disconnect();
    }
  }

  async get(x: string, y: string, z: string): Promise<Buffer | null> {
    const result = (await this.client.get(
      this.client.commandOptions({ returnBuffers: true }),
      this.getTileKey(x, y, z)
    )) as Buffer | null;
    return result;
  }

  async set(x: string, y: string, z: string, tileBuffer: Buffer): Promise<void> {
    await this.client.set(this.getTileKey(x, y, z), tileBuffer, { EX: this.tileTtlSeconds });
  }
}


export class TileFetcher {
  constructor(private userAgent = 'green-route/1.0') {}

  async fetchTile(z: string, x: string, y: string): Promise<Buffer> {
    const osmUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    const response = await fetch(osmUrl, {headers: { 'User-Agent': this.userAgent }});

    if (!response.ok) {
      const err = new Error(`OSM fetch failed with status ${response.status}`);
      (err as any).status = response.status;
      throw err;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}


export class MapTileServiceServer extends ServiceServer {
  private cache: TileCache;
  private fetcher: TileFetcher;

  constructor(options: MapTileServiceOptions = {}) {
    super(options);

    this.cache = new TileCache(options.redisUrl, options.tileTtlSeconds);
    this.fetcher = new TileFetcher(options.userAgent);

    this.app.get('/:z/:x/:y.png', this.handleTileRequest.bind(this));
  }

  private async handleTileRequest(req: Request, res: Response): Promise<void> {
    const { z, x, y } = req.params;
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


// vero solo se questo file è stato eseguito direttamente
if(require.main === module) {
  (async () => {
    const server = new MapTileServiceServer();
    await server.start();
  })();
}
