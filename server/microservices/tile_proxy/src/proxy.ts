import express, { Request, Response } from 'express';
import { createClient, RedisClientType } from 'redis';

const proxy = express();
const PORT = Number(3000);

const redis: RedisClientType = createClient({url: 'redis://redis:6379'});

redis.on('error', (err: Error) => { console.error('Redis error:', err); });

(async () => {
  try {
    await redis.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    process.exit(1)
  }
})();

proxy.get('/:z/:x/:y.png', async (req: Request, res: Response) => {
  const { z, x, y } = req.params;
  const cacheKey = `tile:${z}:${x}:${y}`;

  try {
    const cachedTile = await redis.get(redis.commandOptions({ returnBuffers: true }), cacheKey) as Buffer | null;

    if (cachedTile) {
      console.log('Cache HIT', cacheKey);

      res.set('Content-Type', 'image/png');
      return res.send(cachedTile);
    } else {
      console.log('Cache MISS', cacheKey);

      const osmUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
      const response = await fetch(osmUrl, {headers: {'User-Agent': 'tile-proxy/1.0'}});

      if (!response.ok) {
        return res.status(response.status).send('Tile not found');
      }

      const arrayBuffer = await response.arrayBuffer();
      const tileBuffer = Buffer.from(arrayBuffer);

      // EX: tempo di vita massimo in cache (in secondi)
      await redis.set(cacheKey, tileBuffer, { EX: 60 * 60 * 24 * 7 });

      res.set('Content-Type', 'image/png');
      return res.send(tileBuffer);
    }
  } catch (err) {
    console.error('Tile proxy error:', err);
    return res.status(500).send('Tile proxy error');
  }
});

proxy.listen(PORT, '0.0.0.0', () => {
  console.log(`Tile proxy listening on port ${PORT}`);
});
