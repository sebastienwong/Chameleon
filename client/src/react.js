class PlayerButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {word: ""};
    }

    render() {
        return <button>{this.props.name}</button>;
    }
}

class Player extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            word: ""
        }
    }

    render() {
        
    }
}

function PlayerHolder(props) {
    let players;

    for(i = 0; i < props.player_num; i++) {
        players.push_back(
            <Player></Player>
        )
    }
}

let screen = 1;









class StartScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="start-wrapper">
                <h1 className="title">Chameleon</h1>
                <button className="players-button">Start Game</button>
            </div>
        )
    }
}


class NameScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: ""
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {
        this.setState({name: event.target.value});
    }
  
    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.name);
        nextScreen();
        event.preventDefault();
    }

    render() {
        return (
            <div className="name-wrapper">
                <h1 className="name-prompt">Enter a name:</h1>
                <form className="name-form" onSubmit={this.handleSubmit}>
                    <input className="name-input" type="text" value={this.state.name} onChange={this.handleChange} autoFocus={true} onBlur={({ target }) => target.focus()} maxLength={12}></input>
                    <input className="name-submit" type="submit" disabled={!this.state.name} value="" />
                </form>
            </div>
            
        )
    }
}


class PlayersScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            player_num: 0
        }
    }

    render () {
        return (
            <div className="players-wrapper">
                <h1 className="title">Chameleon</h1>
                <h3 className="players-prompt">How many players?</h3>
                <div className="players-button-wrapper">
                    <button className="players-button">3</button>
                    <button className="players-button">4</button>
                    <button className="players-button">5</button>
                    <button className="players-button">6</button>
                    <button className="players-button">7</button>
                    <button className="players-button">8</button>
                </div>
            </div>
        );
    }
}

function nextScreen() {
    screen++;
}








function TopicTable(props) {
    return (
        <div className="topic-table">
            <h2 className="topic-header">{props.topic.name}</h2>
            <div className="topic-row">
                <p className="topic-word">{props.topic.words[0]}</p>
                <p className="topic-word">{props.topic.words[1]}</p>
                <p className="topic-word">{props.topic.words[2]}</p>
                <p className="topic-word">{props.topic.words[3]}</p>
            </div>
            <div className="topic-row">
                <p className="topic-word">{props.topic.words[4]}</p>
                <p className="topic-word">{props.topic.words[5]}</p>
                <p className="topic-word">{props.topic.words[6]}</p>
                <p className="topic-word">{props.topic.words[7]}</p>
            </div>
            <div className="topic-row">
                <p className="topic-word">{props.topic.words[8]}</p>
                <p className="topic-word">{props.topic.words[9]}</p>
                <p className="topic-word">{props.topic.words[10]}</p>
                <p className="topic-word">{props.topic.words[11]}</p>
            </div>
            <div className="topic-row">
                <p className="topic-word">{props.topic.words[12]}</p>
                <p className="topic-word">{props.topic.words[13]}</p>
                <p className="topic-word">{props.topic.words[14]}</p>
                <p className="topic-word">{props.topic.words[15]}</p>
            </div>
        </div>
    )
}


class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            topic: null
        }

        this.props.socket.on('update-topic', (topic) => {
            console.log(topic);
            this.setState({topic});
        })

        this.props.socket.on('update-players-ordered', (players, order) => {
            
        })
    }

    render() {
        if(this.state.topic != null) {
            return (
                <TopicTable topic={this.state.topic}/>
            )
        }

        return (
            <div></div>
        )
    } 
}









function PlayerList(props) {
    const players = props.players;
    console.log(players);

    const player_items = [];
    for(var id in players) {
        player_items.push(
            <li className="player-item" key={id}>
                {players[id].name}
            </li>
        )
    }

    return (
        <ul className="player-list">
            {player_items}
        </ul>
    );
}

class Setup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            socket: null,
            players: [],
            screen: 1,
            gameStart: false,
            error: ""
        }
    }
  
    nameChange = (e) => {
        this.setState({name: e.target.value});
    }
  
    nameSubmit = (e) => {
        this.joinGame();
        e.preventDefault();
    }

    nextScreen = () => {
        if(this.state.error == "") {
            this.setState({screen: this.state.screen+1});
        }
    }

    joinGame = () => {
        const socket = io();
        this.setState({socket});

        socket.emit("join", this.state.name);

        socket.on("message", (message) => {
            //console.log(message);
        })

        socket.on("joined", () => {
            //console.log("i've joined!");
        })

        socket.on("update-players", (players, order=null) => {
            console.log("hehe");
            this.nextScreen();
            this.updatePlayers(players, order);
        })

        socket.on('error', (e) => {
            this.setState({error: e});
        })
    }

    updatePlayers = (players, order) => {
        this.setState({players});
    }

    startGame = () => {
        this.state.socket.emit("start");

        this.state.socket.on("started", (name) => {
            console.log(name + " started the game.");
            this.setState({gameStart: true});
        })
    }

    render() {
        if(this.state.gameStart) {
            return <Game socket={this.state.socket}/>
        }

        if(this.state.screen == 1) {
            return (
                <div className="start-wrapper">
                    <h1 className="title">Chameleon</h1>
                    <button onClick={this.nextScreen}>Join Game</button>
                </div>
            );
        } else if(this.state.screen == 2) {
            return (
                <div className="name-wrapper">
                    <h2>Enter a name:</h2>
                    <form className="name-form" onSubmit={this.nameSubmit}>
                        <input className="name-input" type="text" value={this.state.name} onChange={this.nameChange} autoFocus={true} onBlur={({ target }) => target.focus()} maxLength={12} spellCheck="false"></input>
                        <input className="name-submit" type="submit" disabled={!this.state.name} value="" />
                    </form>
                    <p className="error">{this.state.error}</p>
                </div>
            );
        } else if(this.state.screen == 3) {
            return (
                <div className="lobby-wrapper">
                    <h2>Lobby</h2>
                    <PlayerList players={this.state.players}/>
                    <button onClick={this.startGame}>Everybody's In</button>
                </div>
            );
        }
    }
}


function App() {
    return (
        <Setup/>
    )
}


ReactDOM.render(
    <App/>,
    document.getElementById('root')
);

