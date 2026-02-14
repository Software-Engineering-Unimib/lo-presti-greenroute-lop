import { TileFetcher } from './TileFetcher.js';

describe('TileFetcher', () => {
  let tileFetcher: TileFetcher;
  const originalFetch = global.fetch;

  beforeEach(() => {
    tileFetcher = new TileFetcher('test-agent');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('dovrebbe scaricare una tile con successo', async () => {
    const mockBuffer = Buffer.from('tile-data');
    const arrayBuffer = mockBuffer.buffer.slice(
      mockBuffer.byteOffset,
      mockBuffer.byteOffset + mockBuffer.byteLength
    );
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: jest.fn().mockResolvedValue(arrayBuffer),
    });

    const result = await tileFetcher.fetchTile('1', '2', '3');

    expect(result).toEqual(mockBuffer);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tile.openstreetmap.org/1/2/3.png',
      { headers: { 'User-Agent': 'test-agent' } }
    );
  });

  it('dovrebbe lanciare un errore se la fetch fallisce (status non ok)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(tileFetcher.fetchTile('1', '2', '3')).rejects.toThrow(
      'OSM fetch failed with status 404'
    );
  });

  it('dovrebbe lanciare un errore in caso di errore di rete', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(tileFetcher.fetchTile('1', '2', '3')).rejects.toThrow('Network error');
  });

  it('dovrebbe usare lo user-Agent di default se non fornito', async () => {
    const fetcherDefault = new TileFetcher();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
    });

    await fetcherDefault.fetchTile('1', '2', '3');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { headers: { 'User-Agent': 'green-route/1.0' } }
    );
  });
});
