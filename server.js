const express = require('express');

const EXPRESS_PORT = 3000;

const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
  cors: {
    origin: `http://localhost:${EXPRESS_PORT}`,
    methods: ['GET', 'POST'],
  },
});

const { createMessage, listMessage } = require('./models/message/message');

app.set('view engine', 'ejs');
app.set('views', './views');

const onlineUserList = {};

/* eslint-disable */
io.on('connection', async (socket) => {
  console.log(`Usuário ${socket.id} conectou.`);
  const defaultNick = socket.id.slice(0, 16);
  onlineUserList[socket.id] = defaultNick;

  // envia nickname default para client
  socket.emit('defaultNickname', defaultNick);
  io.emit('userConnect', onlineUserList);

  socket.on('setNewNickname', ({ currentUser, newNickname }) => {
    onlineUserList[currentUser] = newNickname;
    io.emit('setNickname', onlineUserList);
  });

  // envia chatHistory para client
  const sendHistory = async () => { 
    const result = await listMessage(); return result; 
  };
  socket.emit('chatHistory', await sendHistory());
  // função para escutar as mensagens
  socket.on('message', async ({ nickname, chatMessage }) => {
    // date format function consultada em https://dockyard.com/blog/2020/02/14/you-probably-don-t-need-moment-js-anymore.
    // cria timestamp e objeto menssagem
    const timestamp = (new Date()).toLocaleString('pt-BR').replace(/\//g, '-');
    const message = { message: chatMessage, nickname, timestamp };
    // salva no banco de dados a menssagem
    await createMessage(message);
    const newMessage = `${timestamp} - ${nickname}: ${chatMessage}`;
    // emite nova menssagem para tela
    io.emit('message', newMessage);
  });
  // mensagem desconectar
  socket.on('disconnect', () => {
    console.log(`Usuário ${socket.id} desconectou.`);
    delete onlineUserList[socket.id];
    io.emit('userDisconnect', onlineUserList);
  });
});
app.get('/', (_req, res) => {
  res.render('webchat');
});
http.listen(EXPRESS_PORT, () => {
  console.log(`Servidor ouvindo na porta ${EXPRESS_PORT}`);
});
