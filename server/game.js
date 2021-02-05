const createGame = (id) => {

    let players = [];
    let chameleon = 0;
    let topic;

    const addPlayer = (id, name) => {
        let player = {
            socket_id: id,
            n: name
        }
        if(players.length < 8) {
            players.push(player);
            return true;
        } else {
            return false;
        }
    }

    const setName = (id, name) => {
        players[players.findIndex(id => id == socket_id)] = name;
    }

    const getPlayers = () => {
        a = [];
        for(name in players) {
            a.push(name);
        }
        return a;
    }

    const pickChameleon = () => {
        chameleon = Math.floor(Math.random() * players.length);
        console.log(players[chameleon]);
    }

    const getChameleon = () => {
        return players[chameleon].name;
    }

    const pickTopic = () => {

    }

    return {
        addPlayer, setName, getPlayers, pickChameleon, getChameleon, pickTopic
    };
};

module.exports = createGame;