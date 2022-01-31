const express = require('express');
// const bodyParser = require('body-parser');

const EXPRESS_PORT = 3000;

const app = express();
const http = require('http').createServer(app);

app.set('view engine', 'ejs');
app.set('views', './views');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const io = require('socket.io')(http, {
  cors: {
    origin: `http://localhost:${EXPRESS_PORT}`,
    methods: ['GET', 'POST'],
  },
});

const { 
  createMessage, 
  // listMessage,
} = require('./models/message/message');

io.on('connection', async (socket) => {
  console.log(`Usuário ${socket.id} conectou.`);
  
  const defaultNick = socket.id.slice(0, 16);
  socket.emit('defaultNickname', defaultNick);
  
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
  });
});

app.get('/', (_req, res) => {
  res.render('webchat');
});

http.listen(EXPRESS_PORT, () => {
  console.log(`Servidor ouvindo na porta ${EXPRESS_PORT}`);
});
