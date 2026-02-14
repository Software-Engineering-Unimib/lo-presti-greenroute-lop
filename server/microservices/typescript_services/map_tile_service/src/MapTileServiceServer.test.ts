import request from 'supertest';
import { MapTileServiceServer } from './MapTileServiceServer.js';
import { TileCache } from './TileCache.js';
import { TileFetcher } from './TileFetcher.js';


jest.mock('./TileCache.js');
jest.mock('./TileFetcher.js');


describe('MapTileServiceServer', () => {
  let server: MapTileServiceServer;
  let mockCache: jest.Mocked<TileCache>;
  let mockFetcher: jest.Mocked<TileFetcher>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCache = new TileCache() as jest.Mocked<TileCache>;
    mockFetcher = new TileFetcher() as jest.Mocked<TileFetcher>;

    (TileCache as jest.Mock).mockImplementation(() => mockCache);
    (TileFetcher as jest.Mock).mockImplementation(() => mockFetcher);

    server = new MapTileServiceServer();
  });

  afterEach(async () => {
    await server.shutdown();
  });

  it('dovrebbe restituire 200 e l\'imagine se avviene una cache hit', async () => {
    const mockTile = Buffer.from('mock-tile-data');
    mockCache.get.mockResolvedValue(mockTile);

    const res = await request(server['app']).get('/1/2/3.png');

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('image/png');
    expect(res.body).toEqual(mockTile);
    expect(mockCache.get).toHaveBeenCalledWith('1', '2', '3');
    expect(mockFetcher.fetchTile).not.toHaveBeenCalled();
  });

  it('dovrebbe ottenere l\'immagine e metterla in caches, poi restituire 200 e l\'imagine se avviene una cache miss', async () => {
    const mockTile = Buffer.from('fetched-tile-data');
    mockCache.get.mockResolvedValue(null);
    mockFetcher.fetchTile.mockResolvedValue(mockTile);

    const res = await request(server['app']).get('/1/2/3.png');

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('image/png');
    expect(res.body).toEqual(mockTile);
    expect(mockCache.get).toHaveBeenCalledWith('1', '2', '3');
    expect(mockFetcher.fetchTile).toHaveBeenCalledWith('1', '2', '3');
    expect(mockCache.set).toHaveBeenCalledWith('1', '2', '3', mockTile);
  });

  it('dovrebbe gestire errori e restituire 500', async () => {
    mockCache.get.mockResolvedValue(null);
    mockFetcher.fetchTile.mockRejectedValue(new Error('Fetch failed'));

    const res = await request(server['app']).get('/1/2/3.png');

    expect(res.status).toBe(500);
  });

  it('dovrebbe gestire errori di redis e restituire 500', async () => {
    mockCache.get.mockRejectedValue(new Error('Redis connection failed'));

    const res = await request(server['app']).get('/1/2/3.png');

    expect(res.status).toBe(500);
  });

    it('dovrebbe gestire parametri arbitrari senza crash', async () => {
        mockCache.get.mockResolvedValue(null);
        mockFetcher.fetchTile.mockResolvedValue(Buffer.from('ok'));
        
        const res = await request(server['app']).get('/input/molto/strano.png');
        
        expect(res.status).toBe(200);
        expect(mockCache.get).toHaveBeenCalledWith('input', 'molto', 'strano');
    });
});
