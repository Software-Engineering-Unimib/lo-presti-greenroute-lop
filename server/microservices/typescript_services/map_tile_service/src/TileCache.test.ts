import { TileCache } from './TileCache.js';
import { createClient } from 'redis';

jest.mock('redis', () => ({
  createClient: jest.fn(),
  RESP_TYPES: {
    BLOB_STRING: 'BLOB_STRING'
  }
}));

describe('TileCache', () => {
  let tileCache: TileCache;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      set: jest.fn(),
      on: jest.fn(),
      withTypeMapping: jest.fn().mockReturnThis()
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);

    tileCache = new TileCache('redis://localhost:6379', 3600);
  });

  describe('connect', () => {
    it('dovrebbe connettersi a redis', async () => {
      await tileCache.connect();
      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('disconnect', () => {
    it('dovrebbe chiamare quit alla disconnessione', async () => {
      await tileCache.disconnect();
      expect(mockClient.quit).toHaveBeenCalled();
    });

    it('dovrebbe chiamare disconnect se quit fallisce', async () => {
      mockClient.quit.mockRejectedValue(new Error('Quit failed'));
      await tileCache.disconnect();
      expect(mockClient.quit).toHaveBeenCalled();
      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('dovrebbe restituire un buffer in caso di cache hit', async () => {
      const mockData = Buffer.from('tile-data');
      mockClient.get.mockResolvedValue(mockData);

      const result = await tileCache.get('1', '2', '3');

      expect(result).toEqual(mockData);
      expect(mockClient.get).toHaveBeenCalledWith('tile:3:1:2');
    });

    it('dovrebbe restituire null in caso di cache miss', async () => {
      mockClient.get.mockResolvedValue(null);

      const result = await tileCache.get('1', '2', '3');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('dovrebbe impostare il valore con la key e il TTL corretti', async () => {
      const mockData = Buffer.from('tile-data');
      await tileCache.set('1', '2', '3', mockData);

      expect(mockClient.set).toHaveBeenCalledWith('tile:3:1:2', mockData, { EX: 3600 });
    });
  });
});
