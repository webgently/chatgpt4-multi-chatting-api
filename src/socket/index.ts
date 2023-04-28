require('dotenv').config();
import { Server } from 'socket.io';

export const initSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('new connected:' + socket.id);
    socket.on('disconnect', () => {
      console.log('socket disconnected ' + socket.id);
    });
  });
};
