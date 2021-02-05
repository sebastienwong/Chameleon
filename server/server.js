const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const createGame = require('./game');

const app = express();

app.use(express.static(__dirname + "/../client"));

const server = http.createServer(app);
const io = socketio(server);
const { addPlayer, setName, getPlayers, pickChameleon, getChameleon, pickTopic } = createGame(1);

io.on('connection', (sock) => {
    sock.emit('message', 'You are connected');

    sock.on('message', (text) => io.emit('message', text));

    sock.on('start', () => {
        pickChameleon();
        io.emit('message', getPlayers());
    })
    sock.on('see_cham', () => {
        io.emit('message', getChameleon());
    })
    sock.on('join', (name) => {
        setName(sock.id, name);
        io.emit('message', getPlayers());
        io.to(sock.id).emit('joined');
    })
});

server.on('error', (err) => {
    console.error(err);
});

server.listen(5000, () => {
    console.log('server is ready');
});