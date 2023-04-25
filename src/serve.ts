import express, { Express } from 'express';
import cors from 'cors';

// External Modules
import config from './config';
import ConnectDatabase from './config/database';

const app: Express = express();
const port: Number = Number(process.env.HTTP_PORT || 2083);

app.use(
  cors({
    origin: '*',
    methods: ['POST', 'GET']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

ConnectDatabase(config.mongoURI);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
