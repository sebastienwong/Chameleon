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


const { addPlayer, removePlayer, setName, setWord, castVote, tallyVotes, getPlayers, getChameleon, startGame, restart, endWordPhase,
        isStarted, getOrder, getTurn, getTopic, getWord, getVotes } = createGame(topics);


io.on('connection', (sock) => {
    
    sock.emit('message', 'You are connected');

    sock.on('message', (text) => io.emit('message', text));

    sock.on('join', (name) => {
        if(isStarted()) {
            sock.emit('error', 'Game has started!');
        } else if(addPlayer(sock.id, name)) {
            io.emit('message', getPlayers());
            sock.emit('joined', name);
            io.emit('add-player', getPlayers());
        } else {
            sock.emit('error', 'Game is full!');
        }
    });

    sock.on('start', () => {
        startGame();
        io.emit('started', getPlayers()[sock.id].name);
        io.emit('message', getPlayers());
        io.emit('update-topic', getTopic());
        io.emit('update-word', getWord());
        io.emit('update-players', getPlayers());
        io.emit('update-order', getOrder());
        io.emit('new-turn', getOrder()[getTurn()]);
    });

    sock.on('restart', () => {
        restart();
        io.emit('reset-state', getPlayers()[sock.id].name);
        io.emit('update-topic', getTopic());
        io.emit('update-word', getWord());
        io.emit('update-players', getPlayers());
        io.emit('update-order', getOrder());
        io.emit('new-turn', getOrder()[getTurn()]);
    });

    sock.on('word', (word) => {
        setWord(sock.id, word);
        console.log("got word " + word)
        io.emit('update-players', getPlayers());
        if(getTurn() == Object.keys(getPlayers()).length) {
            io.emit('vote-phase', getPlayers());
            endWordPhase();
        } else {
            io.emit('new-turn', getOrder()[getTurn()]);
        }
    });

    sock.on('vote', (id) => {
        castVote(sock.id, id);
        io.emit('update-players', getPlayers());
        if(getVotes() == Object.keys(getPlayers()).length) {
            let ids = tallyVotes();
            io.emit('end-phase');
            if(ids.length > 1) {
                io.emit('tie', ids, getOrder());
            } else {
                if(getChameleon() == ids[0]) {
                    io.emit('p-win', getPlayers()[ids[0]].name);
                } else {
                    io.emit('c-win', getPlayers()[ids[0]].name, getPlayers()[getChameleon()].name);
                }
            }
        }
    });

    sock.on('tiebreak', (id) => {
        console.log("caught tiebreak")
        if(getChameleon() == id) {
            io.emit('p-win', getPlayers()[id].name);
        } else {
            io.emit('c-win', getPlayers()[id].name, getPlayers()[getChameleon()].name);
        }
    });

    sock.on('cham-word', (index) => {
        console.log("caught chamword");
        if(getTopic().words[index] == getWord()) {
            io.emit('is-correct', 1, index);
        } else {
            io.emit('is-correct', 0, index);
        }
    })

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