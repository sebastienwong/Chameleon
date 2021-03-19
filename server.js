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


/*
const { addPlayer, removePlayer, setName, setWord, castVote, tallyVotes, getPlayers, getChameleon, startGame, restart, endWordPhase,
        isStarted, getOrder, getTurn, getTopic, getWord, getVotes } = createGame(topics);
*/

let games = {};
let rooms = {};
let usedCodes = [];


io.on('connection', (sock) => {
    
    sock.emit('message', 'You are connected');

    sock.on('message', (text) => io.emit('message', text));

    sock.on('create-game', (name) => {
        console.log('caught create game')

        let newCode = generateRoomCode().toString();
        games[newCode] = createGame(topics);
        
        rooms[sock.id] = newCode;
        usedCodes.push(newCode);

        sock.emit('created-game', newCode);

        sock.join(newCode);

        games[newCode].addPlayer(sock.id, name);

        io.to(newCode).emit('add-player', games[newCode].getPlayers());
    });

    sock.on('join-game', (code, name) => {
        console.log('caught join game');
        if(usedCodes.includes(code)) {
            if(games[code].isStarted()) {
                sock.emit('error', 'Game has started!');
            } else if(games[code].addPlayer(sock.id, name)) {
                sock.emit('joined-game', code);
                
                rooms[sock.id] = code;
                sock.join(code);
                console.log(rooms);

                io.to(code).emit('message', games[code].getPlayers());
                io.to(code).emit('add-player', games[code].getPlayers());
            } else {
                sock.emit('error', 'Game is full!');
            }
        } else {
            sock.emit('error', 'Game could not be found');
        }
    })

    /*
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
    */

    sock.on('start', () => {
        code = rooms[sock.id];

        games[code].startGame();
        io.to(code).emit('started', games[code].getPlayers()[sock.id].name);
        io.to(code).emit('message', games[code].getPlayers());
        io.to(code).emit('update-topic', games[code].getTopic());
        io.to(code).emit('update-word', games[code].getWord());
        io.to(code).emit('update-players', games[code].getPlayers());
        io.to(code).emit('update-order', games[code].getOrder());
        io.to(code).emit('new-turn', games[code].getOrder()[games[code].getTurn()]);
    });

    sock.on('restart', () => {
        code = rooms[sock.id];
        
        games[code].restart();
        io.to(code).emit('reset-state', games[code].getPlayers()[sock.id].name);
        io.to(code).emit('update-topic', games[code].getTopic());
        io.to(code).emit('update-word', games[code].getWord());
        io.to(code).emit('update-players', games[code].getPlayers());
        io.to(code).emit('update-order', games[code].getOrder());
        io.to(code).emit('new-turn', games[code].getOrder()[games[code].getTurn()]);
    });

    sock.on('word', (word) => {
        code = rooms[sock.id];

        games[code].setWord(sock.id, word);
        console.log("got word " + word)
        io.to(code).emit('update-players', games[code].getPlayers());
        if(games[code].getTurn() == Object.keys(games[code].getPlayers()).length) {
            io.to(code).emit('vote-phase', games[code].getPlayers());
            games[code].endWordPhase();
        } else {
            io.to(code).emit('new-turn', games[code].getOrder()[games[code].getTurn()]);
        }
    });

    sock.on('vote', (id) => {
        code = rooms[sock.id];

        games[code].castVote(sock.id, id);
        io.to(code).emit('update-players', games[code].getPlayers());
        if(games[code].getVotes() == Object.keys(games[code].getPlayers()).length) {
            let ids = games[code].tallyVotes();
            io.to(code).emit('end-phase');
            if(ids.length > 1) {
                io.to(code).emit('tie', ids, games[code].getOrder());
            } else {
                if(games[code].getChameleon() == ids[0]) {
                    io.to(code).emit('p-win', games[code].getPlayers()[ids[0]].name);
                } else {
                    io.to(code).emit('c-win', games[code].getPlayers()[ids[0]].name, games[code].getPlayers()[games[code].getChameleon()].name);
                }
            }
        }
    });

    sock.on('tiebreak', (id) => {
        code = rooms[sock.id];

        console.log("caught tiebreak")
        if(games[code].getChameleon() == id) {
            io.to(code).emit('p-win', games[code].getPlayers()[id].name);
        } else {
            io.to(code).emit('c-win', games[code].getPlayers()[id].name, games[code].getPlayers()[games[code].getChameleon()].name);
        }
    });

    sock.on('cham-word', (index) => {
        code = rooms[sock.id];

        console.log("caught chamword");
        if(games[code].getTopic().words[index] == games[code].getWord()) {
            io.to(code).emit('is-correct', 1, index);
        } else {
            io.to(code).emit('is-correct', 0, index);
        }
    })

    sock.on('disconnect', () => {
        console.log('caught disconnect')
        code = rooms[sock.id];

        if(code) {
            if(!games[code].isStarted()) {
                games[code].removePlayer(sock.id);
                io.to(code).emit('remove-player', games[code].getPlayers());
            } else {
                games[code].removePlayer(sock.id);
                io.to(code).emit('remove-player', games[code].getPlayers());

                if(Object.keys(games[code].getPlayers()).length < 3) {
                    io.to(code).emit('back-to-lobby');
                    io.to(code).emit('error', "You need 3 or more players to play.");
                } else if(sock.id == games[code].getChameleon()) {
                    io.to(code).emit('back-to-lobby');
                    io.to(code).emit('error', "The chameleon left.");
                }

                games[code].end();
            }
        }

        //io.to(code).emit('message', games[code].getPlayers());
    });
});

function generateRoomCode() {
    min = Math.ceil(1000);
    max = Math.floor(9999);
    let code = Math.floor(Math.random() * (max - min) + min);
    while(usedCodes.includes(code)) {
        code = Math.floor(Math.random() * (max - min) + min);
    }
    return code;
}

/*
server.on('error', (err) => {
    console.error(err);
});

server.listen(PORT, () => {
    console.log('server is ready');
});
*/