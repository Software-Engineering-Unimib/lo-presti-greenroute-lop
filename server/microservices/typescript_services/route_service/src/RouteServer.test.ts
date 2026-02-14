import request from 'supertest';
import { RouteServer } from './RouteServer.js';
import http from 'node:http';
import { EventEmitter } from 'node:events';


jest.mock('node:http', () => ({
  ...jest.requireActual('node:http'),
  request: jest.fn(),
}));

const mockGraphHopperResponse = {
  paths: [
    {
      distance: 12345,
      time: 543210,
      instructions: [{ text: 'Turn left' }],
      points: { type: 'LineString', coordinates: [[1, 1], [2, 2]] },
    },
  ],
};

const createMockRequest = (responseBody: any, statusCode: number = 200) => {
  return jest.fn((options, callback) => {
    const response = new EventEmitter();
    (response as any).statusCode = statusCode;
    process.nextTick(() => {
      callback(response);
        response.emit('data', JSON.stringify(responseBody));
        response.emit('end');
    });
    const req = new EventEmitter();
    (req as any).end = jest.fn();
    return req;
  });
};


describe('RouteServer', () => {
  let server: RouteServer;

  beforeEach(() => {
    jest.clearAllMocks();
    server = new RouteServer();
  });

  afterEach(async () => {
      await server.shutdown();
  });

  it('dovrebbe restituire 400 se mancano le coordinate', async () => {
    const res = await request(server['app']).get('/');
    expect(res.status).toBe(400);
  });

  it('dovrebbe restituire 200 se la richiesta è valida', async () => {
      (http.request as jest.Mock).mockImplementation(createMockRequest(mockGraphHopperResponse));

    const res = await request(server['app'])
      .get('/')
      .query({
        startLatitude: '10.0',
        startLongitude: '10.0',
        endLatitude: '11.0',
        endLongitude: '11.0',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].distance).toBe('12.345km');
    expect(res.body[0].time).toBe('9m 3s'); // 543210ms / 1000 = 543s = 9m 3s
    expect(res.body[0].geojson.features[0].geometry).toEqual(mockGraphHopperResponse.paths[0].points);
    expect(http.request).toHaveBeenCalled();
  });

  it('dobrebbe gestire gli errori di graphhopper correttamente', async () => {
     (http.request as jest.Mock).mockImplementation((options, callback) => {
         const req = new EventEmitter();
         (req as any).end = jest.fn();
         process.nextTick(() => {
             req.emit('error', new Error('Connection refused'));
         });
         return req;
     });

    const res = await request(server['app'])
      .get('/')
      .query({
        startLatitude: '10.0',
        startLongitude: '10.0',
        endLatitude: '11.0',
        endLongitude: '11.0',
      });

    expect(res.status).toBe(500);
  });

  it('dovrebbe ignorare parametri ulteriori nella query', async () => {
    (http.request as jest.Mock).mockImplementation(
      createMockRequest(mockGraphHopperResponse)
    );

    const res = await request(server['app'])
      .get('/')
      .query({
        startLatitude: '10.0',
        startLongitude: '10.0',
        endLatitude: '11.0',
        endLongitude: '11.0',
        maliciousParam: 'drop tables',
      });

    expect(res.status).toBe(200);
    expect(http.request).toHaveBeenCalledTimes(1);

    const requestArgs = (http.request as jest.Mock).mock.calls[0][0];

    expect(requestArgs.path).not.toContain('maliciousParam');
  });
});
