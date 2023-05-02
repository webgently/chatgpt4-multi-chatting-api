require('dotenv').config();
import http from 'http';
import express, { Express } from 'express';
import cors from 'cors';
import { Server } from 'socket.io';

// External Modules
import API from './apis';
import config from './config';
import ConnectDatabase from './config/database';
import { initSocket } from './socket';

// Get router
const router = express.Router();

const app: Express = express();
const port: Number = Number(process.env.HTTP_PORT || 5000);
const server = http.createServer(app);

app.use(cors({ origin: '*', methods: ['POST', 'GET'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend Load
app.use(express.static(__dirname + '/build'));
app.get('/*', function (req: any, res: any) {
  res.sendFile(__dirname + '/build/index.html', function (err: any) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// API Router
API(router);
app.use('/api', router);

// Socket Connect
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
initSocket(io);
app.set('io', io);

ConnectDatabase(config.mongoURI);
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
