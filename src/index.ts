import express, { Express } from "express";
import routes from './routes';
import ConfigManager from './classes/ConfigManager';
import cors from 'cors';

const app: Express = express();
app.use(cors());
new ConfigManager();

app.use('/api/v1', routes);
const port = 3000;
app.listen(port, () => {
    console.log(`hello on ${port}`);
})
