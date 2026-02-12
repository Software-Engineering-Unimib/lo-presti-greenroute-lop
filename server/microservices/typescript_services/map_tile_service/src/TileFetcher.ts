export class TileFetcher {
  constructor(private readonly userAgent = 'green-route/1.0') {}

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