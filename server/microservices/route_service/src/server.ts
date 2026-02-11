import express, { Request, Response, Express } from 'express';
import http from 'http';

export interface RouteServerOptions {
  port?: number;
  host?: string;
}

export class RouteServer {
  private app: Express;
  private server?: http.Server;
  private port: number;
  private host: string;

  constructor(private options: RouteServerOptions = {}) {
    this.app = express();
    this.port = options.port ?? 3000;
    this.host = options.host ?? '0.0.0.0';

    this.app.get('/', this.handleRouteRequest.bind(this));
    // health check
    this.app.get('/health', (_req, res) => res.send('ok'));
  }

  private async handleRouteRequest(req: Request, res: Response): Promise<void> {
    try {
      const { startLatitude, startLongitude, endLatitude, endLongitude } = req.query;

      if (!startLatitude || !startLongitude || !endLatitude || !endLongitude) {
        res.status(400).json({ error: 'Missing coordinates' });
      }
      else {
        const queryParams = new URLSearchParams();
        queryParams.append('point', `${startLatitude},${startLongitude}`);
        queryParams.append('point', `${endLatitude},${endLongitude}`);
        queryParams.append('profile', 'car');
        queryParams.append('alternative_route.max_paths', '5');
        queryParams.append('locale', 'it');
        queryParams.append('points_encoded', 'false');


        const options = {
          hostname: 'graphhopper',
          port: 8989,
          path: `/route?${queryParams.toString()}`,
          method: 'GET',
        };

        const data: any = await new Promise((resolve, reject) => {
          const reqHttp =
          http.request(options,
            (response) => {
              let body = '';
              response.on('data', (chunk) => (body += chunk));
              response.on('end', () => {
                try {
                  resolve(JSON.parse(body));
                } catch (err) {
                  reject(err);
                }
            });
          });

          reqHttp.on('error', reject);
          reqHttp.end();
        });

        console.log('GraphHopper response:', JSON.stringify(data, null, 2));
        const geojsonList = data.paths.map((path: any) => (
          {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: path.points,
                properties: {
                  distance: path.distance,
                  time: path.time,
                },
              },
            ],
          }
        ));

        res.json(geojsonList);
      }
    } catch (err: any) {
      console.error('Error fetching route:', err.message || err);
      res.status(500).json({ error: 'Failed to get route' });
    }
  }


  async start(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.server = this.app.listen(this.port, this.host, () => {
        console.log(`Route service listening on ${this.host}:${this.port}`);
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

    if (signal) {
      process.exit(0);
    }
  }
}

// vero solo se questo file è stato eseguito direttamente
if (require.main === module) {
  (async () => {
    const server = new RouteServer();
    try {
      await server.start();
    } catch (err) {
      console.error('Startup failed:', err);
      process.exit(1);
    }
  })();
}
