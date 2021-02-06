//const http = require('http');

const express = require('express');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 5000;
const INDEX = '/client/index.html';

const topics = require('./topics.json');
const createGame = require('./game');

//app.use(express.static(__dirname + "/../client"));
const server = express()
    .use(express.static(__dirname + '/client'))
    .get('/', (req, res) => {
        res.sendFile(__dirname + '/client/index.html');
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

/*
server.on('error', (err) => {
    console.error(err);
});
*/

//const server = http.createServer(app);
const io = socketIO(server);


const { addPlayer, removePlayer, setName, setWord, castVote, tallyVotes, getPlayers, getChameleon, startGame, endWordPhase,
        isStarted, getOrder, getTurn, getTopic, getVotes } = createGame(topics);


io.on('connection', (sock) => {
    
    sock.emit('message', 'You are connected');

    sock.on('message', (text) => io.emit('message', text));

    sock.on('join', (name) => {
        if(isStarted()) {
            io.to(sock.id).emit('error', 'Game has started!');
        } else if(addPlayer(sock.id, name)) {
            io.emit('message', getPlayers());
            sock.emit('joined', name);
            io.emit('updatePlayers', getPlayers());
        } else {
            sock.emit('error', 'Game is full!');
        }
    });

    sock.on('start', () => {
        startGame();
        io.emit('started', getPlayers()[sock.id].name);
        io.emit('message', getPlayers());
        io.emit('updateTopic', getTopic());
        io.emit('updatePlayers', getPlayers(), getOrder());
        io.emit('newTurn', getOrder()[getTurn()]);
    });

    sock.on('word', (word) => {
        setWord(sock.id, word);
        if(getTurn() == Object.keys(getPlayers()).length) {
            io.emit('votePhase', getPlayers());
            endWordPhase();
        } else {
            io.emit('newTurn', getOrder()[getTurn()]);
        }
    });

    sock.on('vote', (id) => {
        castVote(id);
        if(getVotes() == Object.keys(getPlayers()).length) {
            let ids = tallyVotes();
            io.emit('endPhase');
            if(ids.length > 1) {
                io.emit('tie', ids);
            } else {
                if(getChameleon() == ids[0]) {
                    io.emit('pWin', getPlayers()[ids[0]].name);
                } else {
                    io.emit('cWin', getPlayers()[getChameleon()].name);
                }
            }
        }
    });

    sock.on('disconnect', (sock) => {
        removePlayer(sock.id);
        io.emit('message', getPlayers());
    });
});

/*
server.on('error', (err) => {
    console.error(err);
});

server.listen(PORT, () => {
    console.log('server is ready');
});
*/