import { Request, Response } from 'express';
import http from 'node:http';
import { ServiceServerOptions, ServiceServer } from '../../common/src/ServiceServer.js';


export class RouteServer extends ServiceServer {
  constructor(options: ServiceServerOptions = {}) {
    super(options);
    this.app.get('/', this.handleRouteRequest.bind(this));
  }

  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.round(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);

    const parts = [];
    if (hours > 0)
      parts.push(`${hours}h`);
    if (minutes > 0)
      parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
  }

  private async handleRouteRequest(req: Request, res: Response): Promise<void> {
    try {
      const {
        startLatitude,
        startLongitude,
        endLatitude,
        endLongitude
      } = req.query;

      const startLatitudeNumber = Number(startLatitude);
      const startLongitudeNumber = Number(startLongitude);
      const endLatitudeNumber = Number(endLatitude);
      const endLongitudeNumber = Number(endLongitude);

      if (!startLatitude || !startLongitude || !endLatitude || !endLongitude) {
        res.status(400).json({ error: 'Missing coordinates' });
      }
      else if ([startLatitudeNumber, startLongitudeNumber, endLatitudeNumber, endLongitudeNumber].some(Number.isNaN)) {
        res.status(400).json({ error: 'Invalid coordinates' });
      }
      else {
        const queryParams = new URLSearchParams();
        queryParams.append('point', `${startLatitudeNumber},${startLongitudeNumber}`);
        queryParams.append('point', `${endLatitudeNumber},${endLongitudeNumber}`);
        queryParams.append('profile', 'car');
        queryParams.append('algorithm', 'alternative_route');
        queryParams.append('alternative_route.max_weight_factor', '2.0');
        queryParams.append('alternative_route.max_share_factor', '0.8');
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
        
        const pathsList = data.paths.map((path: any) => ({
            distance: `${(path.distance / 1000).toFixed(3)}km`,
            time: this.formatTime(path.time),
            instructions: path.instructions,

            geojson: {
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
          }
        ));

        res.json(pathsList);
      }
    } catch (err: unknown) {
      const message = (err as any).message || '""';
      const status = (err as any).status || 500;
      console.error('Route service error:', `message:${message}, status:${status}`);
      res.status(500).send('Internal server error');
    }
  }
}