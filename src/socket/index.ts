require('dotenv').config();
import { Server, Socket } from 'socket.io';
import { Configuration, OpenAIApi } from 'openai';
import controllers from '../controllers';

const configuration = new Configuration({ apiKey: process.env.CHATGPTKEY });
const openai = new OpenAIApi(configuration);

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('new connected:' + socket.id);
    socket.join('chatgpt');

    socket.on('disconnect', () => {
      console.log('socket disconnected ' + socket.id);
    });

    /* join room */
    socket.on('join room', (e: any) => {
      console.log('join room =>', e.user_id);
      e.group.map((item: string) => {
        socket.join(item);
        socket.join(e.user_id);
      });
    });

    /* receive message from room */
    socket.on('sent message to server', async (e: any) => {
      const result1 = await saveMsg(e);
      if (result1) {
        const data = {
          from: result1.to,
          to: result1.from,
          message: result1.message,
          first_name: e.first_name,
          last_name: e.last_name,
          email: e.email,
          user_name: e.user_name,
          avatar: e.avatar,
          date: result1.date
        };
        socket.to(e.to).emit('group', data);
      }
      const result2: any = await saveAnswer(result1);
      if (result2) {
        const data = {
          from: result2.from,
          to: result2.to,
          message: result2.message,
          first_name: e.first_name,
          last_name: e.last_name,
          email: e.email,
          user_name: 'GPT',
          avatar: e.avatar,
          date: result2.date
        };
        console.log(data);
        socket.to(e.to).emit('group', data);
        socket.emit('chatgpt', data);
      }
    });
  });
};

const saveMsg = async (e: any) => {
  try {
    return await controllers.ChatHistory.create({
      from: e.from,
      to: e.to,
      message: e.message,
      date: new Date()
    });
  } catch (err: any) {
    console.log('chatHistory save error: ', err);
  }
};

const saveAnswer = async (e: any) => {
  try {
    // const history = await controllers.ChatHistory.find({
    //   filter: [{ from: e.from }, { to: e.from }]
    // });

    const history = await controllers.ChatHistory.find({
      filter: [{}]
    });

    let prompt = '';
    history.map((item1: any) => {
      item1.message.map((item2: any) => {
        prompt += item2 + ',';
      });
    });

    const props = {
      model: 'text-davinci-003',
      prompt: prompt,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 200,
      stream: false,
      n: 1
    };

    let data = await openai.createCompletion(props);
    return await controllers.ChatHistory.create({
      from: e.to,
      to: e.from,
      message: [data.data.choices[0].text],
      date: new Date()
    });
  } catch (err: any) {
    console.log('chatGPT error: ', err);
  }
};
