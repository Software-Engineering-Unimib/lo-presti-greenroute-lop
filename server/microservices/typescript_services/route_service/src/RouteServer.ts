import { Request, Response } from 'express';
import http from 'node:http';
import { ServiceServerOptions, ServiceServer } from '../../common/src/ServiceServer.js';


export class RouteServer extends ServiceServer {
  constructor(options: ServiceServerOptions = {}) {
    super(options);
    this.app.get('/', this.handleRouteRequest.bind(this));
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
    } catch (err: unknown) {
      const message = (err as any).message || '""';
      const status = (err as any).status || 500;
      console.error('Route service error:', `message:${message}, status:${status}`);
      res.status(500).send('Internal server error');
    }
  }
}