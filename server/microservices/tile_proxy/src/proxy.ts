// src/server.ts
import express, { Request, Response, Express } from 'express';
import http from 'http';
import { createClient, RedisClientType } from 'redis';

export interface TileProxyOptions {
  port?: number;
  host?: string;
  redisUrl?: string;
  tileTtlSeconds?: number;
  userAgent?: string;
}

export class TileCache {
  constructor(private client: RedisClientType) {}

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
      // If quit fails, try disconnect
      await this.client.disconnect();
    }
  }

  /**
   * Return cached tile as Buffer or null if missing.
   */
  async get(key: string): Promise<Buffer | null> {
    // preserve returnBuffers behavior as in your original code
    const result = (await this.client.get(
      this.client.commandOptions({ returnBuffers: true }),
      key
    )) as Buffer | null;
    return result;
  }

  /**
   * Store a tile Buffer with TTL (seconds).
   */
  async set(key: string, value: Buffer, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, { EX: ttlSeconds });
  }
}

export class TileFetcher {
  constructor(private userAgent = 'green-route/1.0') {}

  async fetchTile(z: string, x: string, y: string): Promise<Buffer> {
    const osmUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    const response = await fetch(osmUrl, {
      headers: { 'User-Agent': this.userAgent },
    });

    if (!response.ok) {
      const err = new Error(`OSM fetch failed with status ${response.status}`);
      (err as any).status = response.status;
      throw err;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

export class TileProxyServer {
  private app: Express;
  private server?: http.Server;
  private cache: TileCache;
  private fetcher: TileFetcher;
  private port: number;
  private host: string;
  private tileTtlSeconds: number;

  constructor(private options: TileProxyOptions = {}) {
    this.app = express();
    this.port = options.port ?? 3000;
    this.host = options.host ?? '0.0.0.0';
    this.tileTtlSeconds = options.tileTtlSeconds ?? 60 * 60 * 24 * 7; // 1 week default

    const redisUrl = options.redisUrl ?? 'redis://redis:6379';
    const redisClient: RedisClientType = createClient({ url: redisUrl });

    this.cache = new TileCache(redisClient);
    this.fetcher = new TileFetcher(options.userAgent);

    this.app.get('/:z/:x/:y.png', this.handleTileRequest.bind(this));
    // health check
    this.app.get('/health', (_req, res) => res.send('ok'));
  }

  private async handleTileRequest(req: Request, res: Response): Promise<void> {
    const { z, x, y } = req.params;
    const cacheKey = `tile:${z}:${x}:${y}`;

    try {
      const cachedTile = await this.cache.get(cacheKey);
      if (cachedTile) {
        console.log('Cache HIT', cacheKey);
        res.set('Content-Type', 'image/png');
        res.send(cachedTile);
        return;
      }

      console.log('Cache MISS', cacheKey);
      const tileBuffer = await this.fetcher.fetchTile(z, x, y);

      // store in cache and respond
      await this.cache.set(cacheKey, tileBuffer, this.tileTtlSeconds);

      res.set('Content-Type', 'image/png');
      res.send(tileBuffer);
    } catch (err: any) {
      if (err && err.status && typeof err.status === 'number') {
        res.status(err.status).send('Tile not found');
        return;
      }

      console.error('Tile proxy error:', err);
      res.status(500).send('Tile proxy error');
    }
  }

  async start(): Promise<void> {
    try {
      await this.cache.connect();
      console.log('Connected to Redis');
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
      throw err;
    }

    await new Promise<void>((resolve) => {
      this.server = this.app.listen(this.port, this.host, () => {
        console.log(`Tile proxy listening on ${this.host}:${this.port}`);
        resolve();
      });
    });


    process.once('SIGINT', () => this.shutdown('SIGINT'));
    process.once('SIGTERM', () => this.shutdown('SIGTERM'));
  }

  async shutdown(signal?: string): Promise<void> {
    if (signal) console.log(`Received ${signal}, shutting down...`);

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.server = undefined;
    }

    try {
      await this.cache.disconnect();
      console.log('Redis disconnected');
    } catch (err) {
      console.warn('Error while disconnecting Redis:', err);
    }

    // If shutdown requested from signal, exit
    if (signal) {
      process.exit(0);
    }
  }
}

// vero solo se questo file è stato eseguito direttamente
if (require.main === module) {
  (async () => {
    const server = new TileProxyServer();
    try {
      await server.start();
    } catch (err) {
      console.error('Startup failed:', err);
      process.exit(1);
    }
  })();
}
