import { createClient, RedisClientType, RESP_TYPES } from 'redis';

export class TileCache {
  private readonly client: RedisClientType<any, any, any, any, any>;
  private readonly tileTtlSeconds: number;

  constructor(redisUrl?: string, tileTtlSeconds?: number) {
    redisUrl = redisUrl ?? 'redis://redis:6379';
    this.tileTtlSeconds = tileTtlSeconds ?? 60 * 60 * 24 * 7; 

    this.client = createClient({ url: redisUrl, RESP: 3 }).withTypeMapping({ [RESP_TYPES.BLOB_STRING]: Buffer });
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
       console.log(`Exception while disconnecting from redis: ${err}`);
      // se quit fallisce, prova disconnect
      this.client.destroy();
    }
  }

  async get(x: string, y: string, z: string): Promise<Buffer | null> {
    const result = await this.client.get(this.getTileKey(x, y, z)) as Buffer | null;;
    return result;
  }

  async set(x: string, y: string, z: string, tileBuffer: Buffer): Promise<void> {
    await this.client.set(this.getTileKey(x, y, z), tileBuffer, { EX: this.tileTtlSeconds });
  }
}