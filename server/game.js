const createGame = (topics) => {

    let players = {};
    let chameleon = "";
    let topic;
    let started = false;
    let order = [];
    let turn = 0;
    let votes = 0;

    const addPlayer = (id, name) => {
        if(Object.keys(players).length < 8) {
            players[id] = {
                name: name,
                cham: false,
                word: "",
                vote: 0
            }
            return true;
        } else {
            return false;
        }
    }

    const removePlayer = (id) => {
        delete players[id];
    }

    const setName = (id, name) => {
        players[players.findIndex((element) => {
            element.socket_id == id;
        })] = name;
    }

    const setWord = (id, word) => {
        players[id].word = word;
        turn++;
        console.log(players[id].word);
    }

    const castVote = (id) => {
        players[id].vote++;
        votes++;
        console.log(players[id].vote);
    }

    const tallyVotes = () => {
        let most = 0;
        let mostIDs = []

        for(var id in players) {
            if(players[id].vote > most) {
                most = players[id].vote;
                mostIDs = [];
                mostIDs.push(id);
            } else if(players[id] == most) {
                mostIDs.push(id);
            }
        }
        return mostIDs;
    }

    const getPlayers = () => {
        return players;
    }

    const randomID = () => {
        r = Math.floor(Math.random() * Object.keys(players).length);
        return Object.keys(players)[r];
    }

    const pickChameleon = () => {
        chameleon = randomID();
        players[chameleon].cham = true;
        console.log(chameleon);
    }

    const pickFirst = () => {
        players[randomID()].first = true;
    }

    const pickOrder = () => {
        let array = Object.keys(players);
        let currentIndex = array.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        order = array;
    }

    const getChameleon = () => {
        return chameleon;
    }

    const pickTopic = () => {
        let ts = topics.topics;
        r = Math.floor(Math.random() * ts.length);
        topic = ts[r];
    }

    const startGame = () => {
        pickTopic();
        pickChameleon();
        pickOrder();
        started = true;
    }

    const endWordPhase = () => {
        
    }

    const isStarted = () => {
        return started;
    }

    const getOrder = () => {
        return order;
    }

    const getTurn = () => {
        return turn;
    }

    const getTopic = () => {
        return topic;
    }

    const getVotes = () => {
        return votes;
    }

    return {
        addPlayer, removePlayer, setName, setWord, castVote, tallyVotes, getPlayers, getChameleon, startGame, endWordPhase, 
        isStarted, getOrder, getTurn, getTopic, getVotes
    };
};

module.exports = createGame;