const express = require('express');
const bodyParser = require('body-parser');

const EXPRESS_PORT = 3000;

const app = express();
const http = require('http').createServer(app);

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const io = require('socket.io')(http, {
  cors: {
    origin: `http://localhost:${EXPRESS_PORT}`,
    methods: ['GET', 'POST'],
  },
});

// require('./sockets/chat')(io);

io.on('connection', ((socket) => {
  console.log(`Usuário ${socket.id} conectado.`);
}));

app.get('/', (_req, res) => {
  res.render('webchat');
});

http.listen(EXPRESS_PORT, () => {
  console.log(`Servidor ouvindo na porta ${EXPRESS_PORT}`);
});
