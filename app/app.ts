import * as cors from 'cors';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Sequelize } from 'sequelize-typescript';
import Routes from './routes/Routes';

class App {
  public app: express.Application = express();

  constructor() {
    this.init();
  }

  private async init() {
    this.config();
    await App.setupDb();
    Routes.routes(this.app);
  }

  private config(): void {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(express.static('public'));
  }

  private static setupDb() {
    return new Sequelize({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      database: process.env.DB_NAME,
      dialect: 'mysql',
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      models: [`${__dirname}/models`],
    }).sync();
  }
}

export default new App().app;
