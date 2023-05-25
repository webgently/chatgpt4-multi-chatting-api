require('dotenv').config();
import { Server, Socket } from 'socket.io';
import { Configuration, OpenAIApi } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import Nexus from '../controllers/nexus';
const configuration = new Configuration({ apiKey: process.env.CHATGPTKEY });
const openai = new OpenAIApi(configuration);
const fs = require('fs');

function similarity(A: Array<number>, B: Array<number>) {
  var dotproduct = 0;
  var mA = 0;
  var mB = 0;
  for (let i = 0; i < A.length; i++) { // here you missed the i++
    dotproduct += (A[i] * B[i]);
    mA += (A[i] * A[i]);
    mB += (B[i] * B[i]);
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  var similarity = (dotproduct) / ((mA) * (mB)) // here you needed extra brackets
  return similarity;
}

const openFile = (filename: string) => {
  let rawdata: string = fs.readFileSync(filename, "utf8");
  return rawdata;
}

const getEmbedding = async (content: any, engine: string = 'text-embedding-ada-002') => {
  const response = await openai.createEmbedding({ input: content, model: engine })
  const vector = response.data.data[0]['embedding'];
  return vector
}

const loadConvo = async () => {
  let result: Array<any> = [];
  const d = await Nexus.find({});
  d.map((data: any) => {
    result.push(data)
  })
  return result;
}

const fetchMemories = (vector: Array<any>, logs: Array<any>, count: number) => {
  let scores: Array<any> = [];
  for (let i of logs) {
    if (vector == i['vector'])
      continue
    let score = similarity(i['vector'], vector);
    i['score'] = score
    scores.push(i);
  }

  let ordered = scores.sort((a, b) => {
    if (a.score < b.score) {
      return -1;
    }
    if (a.score > b.score) {
      return 1;
    }
    return 0;
  })

  return ordered.slice(0, count)
}

const gpt4Completion = async (prompt: string) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    top_p: 1,
  })
  return completion.data.choices[0].message?.content;
}

const summarizeMemories = async (memories: Array<any>, recent: string, currentMessage: string) => {
  memories = memories.sort((a, b) => {
    if (a.time < b.time) {
      return -1;
    }
    if (a.time > b.time) {
      return 1;
    }
    return 0;
  })
  let block = '';
  let identifiers: Array<any> = [];
  let timestamps: Array<any> = [];
  memories.map((memory) => {
    block += memory['message'] + '\n\n'
    identifiers.push(memory['uuid'])
    timestamps.push(memory['time'])
  })
  block = block.trim();
  let prompt = openFile('./public/prompt_response.txt').replace('<<CONVERSATION>>', block).replace('<<RECENT>>', recent).replace("<<MESSAGE>>", currentMessage);
  let notes = await gpt4Completion(prompt);
  return notes || "I am sorry.Some error in communication."
}

const getLastMessages = (conversation: Array<any>, limit: number) => {
  if (conversation.length == 1) return "";
  const short = conversation.reverse().slice(1, limit).reverse();
  let output: string = '';
  short.map((conv) => {
    output += `${conv['message']}\n\n`;
  })
  output = output.trim();
  let username = '';
  for (var i in userNames) {
    if (userNames[i] !== undefined) {
      username += userNames[i];
    }
  }
  output += "Online users are " + username;
  console.log(output,username);
  return output || ""
}

let users = {} as { [key: string]: any }
let userNames = {} as { [key: string]: any }


export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('new connected:' + socket.id);
    socket.join('chatgpt');
    socket.on('disconnect', () => {
      console.log('socket disconnected ' + socket.id);
      delete users[socket.id];
      delete userNames[socket.id];
      io.emit("online users", users);
    });
    /* join room */
    socket.on('join room', async (e: any) => {
      console.log('join room =>', e.user_id);
      e.group.map((item: string) => {
        socket.join(item);
        socket.join(e.user_id);
        users[socket.id] = e.user_id;
        userNames[socket.id] = e.user_name;
      });
      io.emit("online users", users);
    });
    /* receive message from room */
    socket.on('sent message to server', async (e: any) => {
      let data = {
        from: e.to,
        to: e.from,
        message: e.message,
        first_name: e.first_name,
        last_name: e.last_name,
        email: e.email,
        user_name: e.user_name,
        avatar: e.avatar,
        date: e.date
      };
      socket.to(e.to).emit('group', data);
      let vector = await getEmbedding(e.message);
      const timestring = new Date().toLocaleString();
      var uid = uuidv4();
      const timestamp = new Date().getTime();
      let info = { 'speaker': e.email, 'time': timestamp, 'vector': vector, 'message': `[${e.user_name}]:${e.message.join(",")}`, 'uuid': uid, 'timestring': timestring };
      await Nexus.create(info);
      let conversation = await loadConvo();
      let memories = fetchMemories(vector, conversation, 30);
      let recent = getLastMessages(conversation, 30);
      console.log("Running BOT to", e.message);
      let notes = await summarizeMemories(memories, recent, `[${e.user_name}]:${e.message.join(",")}`)
      vector = await getEmbedding(notes);
      info = { 'speaker': 'ASSISTANT', 'time': timestamp, 'vector': vector, 'message': `${notes}`, 'uuid': uuidv4(), 'timestring': timestring }
      await Nexus.create(info);
      data = {
        from: e.to,
        to: e.from,
        message: [notes],
        first_name: e.first_name,
        last_name: e.last_name,
        email: e.email,
        user_name: 'GPT',
        avatar: e.avatar,
        date: new Date()
      };
      socket.to(e.to).emit('group', data);
      socket.emit('chatgpt', data);
    });
  });
};