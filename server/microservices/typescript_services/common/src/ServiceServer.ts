import express, { Request, Response, Express } from 'express';
import http from 'http';


export interface ServiceServerOptions {
  port?: number;
  host?: string;
}


export class ServiceServer {
  protected app: Express;
  private server?: http.Server;
  private port: number;
  private host: string;

  constructor(options: ServiceServerOptions = {}) {
    this.app = express();
    this.port = options.port ?? 3000;
    this.host = options.host ?? '0.0.0.0';

    // health check
    this.app.get('/health', (req: Request, res: express.Response) => this.checkHealth(req, res));
  }

  protected checkHealth(_req: Request, res: Response) {
    res.send('ok');
  }

  // Di default non fanno niente, sono hook sovrascrivibili da classi figlie
  protected async onStart(): Promise<void> {}
  protected async onShutdown(): Promise<void> {}

  async start(): Promise<void> {
    try {
      await this.onStart();

      /*
        ATTENZIONE: app.listen restituisce un oggetto prima che il server sia creato, quindi await app.listen(...) non basta per
        attendere il suo completamento. Per questo motivo vengono utilizzati l'oggetto Promise<void> e la callback
      */
      await new Promise<void>((resolve, reject) => {
        this.server = this.app.listen(this.port, this.host, () => {
          console.log(`Service listening on ${this.host}:${this.port}`);
          resolve();
        });

        this.server.on('error', (err) => {
          reject(err);
        });
      });

      process.once('SIGINT', () => this.shutdown('SIGINT'));
      process.once('SIGTERM', () => this.shutdown('SIGTERM'));

    } catch (error) {
      console.error('Failed to start service:', error);
      process.exit(1);
    }
  }

  async shutdown(signal?: string): Promise<void> {
    if (signal)
      console.log(`Received ${signal}, shutting down...`);

    if (this.server) {
      try {
        await new Promise<void>((resolve, reject) => {
          this.server!.close((err) => (err ? reject(err) : resolve()));
        });
        this.server = undefined;
        console.log('HTTP server closed');
        
        await this.onShutdown();
      } catch (err) {
        console.error('Error closing HTTP server:', err);
      }
    }

    // se lo shutdown è stato richiesto con un segnale di arresto, termina il processo
    if (signal) {
      process.exit(0);
    }
  }
}