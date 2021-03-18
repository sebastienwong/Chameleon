class EndWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reveal: false
        }
    }

    componentDidMount() {
        this.startCount();
    }

    startCount = async () => {
        //await new Promise(res => setTimeout(res, 5000));
        this.setState({reveal: true});
    }

    playAgain = () => {
        console.log("play again");
        this.props.socket.emit('restart');
    }

    render() {
        if(!this.state.reveal) {
            return (
                <div className="end-wrapper">
                    <h2>The votes are in!</h2>
                    <h3>You all voted for...</h3>
                </div>
            )
        } else {
            if(this.props.tie) {
                if(this.props.order[0] == this.props.socket.id) {
                    return (
                        <div className="end-wrapper">
                            <h2>There's been a tie!</h2>
                            <h3>You get to break it.</h3>
                        </div>
                    )
                } else {
                    return (
                        <div className="end-wrapper">
                            <h2>There's been a tie!</h2>
                            <h3>The player who went first shall break it.</h3>
                        </div>
                    )
                }
                
            } else if(this.props.pWin) {
                return (
                    <div className="end-wrapper">
                        <h2>{this.props.chamName}</h2>
                        <h3 className="end-line">They we're the chameleon!</h3>
                        <h3>But can they guess the word?</h3>
                    </div>
                )
            } else if(this.props.cWin) {
                return (
                    <div className="end-wrapper">
                        <h2>{this.props.votedName}</h2>
                        <h3 className="end-line">They we're NOT the chameleon!</h3>
                        <h3>{this.props.chamName} blended in!  Now can they guess the word?</h3>
                    </div>
                )
            } else if(this.props.isCorrect == 1) {
                return (
                    <div className="end-wrapper">
                        <h2>The chameleon guessed: {this.props.topic.words[this.props.guess]}!</h2>
                        <h3 className="end-line">They got it!  Good job chameleon.</h3>
                        <button onClick={this.playAgain}>Play again?</button>
                    </div>
                )
            } else if(this.props.isCorrect == 0) {
                return (
                    <div className="end-wrapper">
                        <h2>The chameleon guessed: {this.props.topic.words[this.props.guess]}!</h2>
                        <h3 className="end-line">Nice try chameleon!  The word was {this.props.word}.</h3>
                        <button onClick={this.playAgain}>Play again?</button>
                    </div>
                )
            } else {
                return (
                    <div></div>
                )
            }
        }
    }
}

class OrderedPlayerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            votedId: ""
        }
    }

    setVote = (id) => {
        if(this.state.votedId == "" && id != this.props.socket.id) {
            this.setState({votedId: id});
            this.props.socket.emit("vote", id);
        }
    }

    tiebreak = (id) => {
        if(this.props.tiedIds.includes(id) && id != this.props.socket.id) {
            this.setState({votedId: id});
            this.props.socket.emit('tiebreak', id);
        }
    }
    
    render() {
        let player_items = [];

        if(this.props.votePhase) {
            for(let i = 0; i < this.props.order.length; i++) {
                if(this.props.socket.id == this.props.order[i]) {
                    player_items.push(
                        <li className="player-item" style={{boxShadow: this.state.votedId == this.props.order[i] ? "inset 0 0 0 2px rgb(3 117 154)" : "none"}} key={this.props.order[i]}>
                            {this.props.players[this.props.order[i]].name}
                            <span className="word-label">{this.props.players[this.props.order[i]].word}</span>
                            {this.props.players[this.props.order[i]].voted && <span className="vote-label">voted</span>}
                        </li>
                    )
                } else {
                    player_items.push(
                        <li className="player-item votable-item" onClick={() => this.setVote(this.props.order[i])} style={{boxShadow: this.state.votedId == this.props.order[i] ? "inset 0 0 0 2px rgb(3 117 154)" : "none"}} key={this.props.order[i]}>
                            {this.props.players[this.props.order[i]].name}
                            <span className="word-label">{this.props.players[this.props.order[i]].word}</span>
                            {this.props.players[this.props.order[i]].voted && <span className="vote-label">voted</span>}
                        </li>
                    )
                }
            }
        } else if(this.props.endPhase) {
            if(this.props.tie && this.props.socket.id == this.props.order[0]) {
                for(let i = 0; i < this.props.order.length; i++) {
                    if(this.props.tiedIds.includes(this.props.order[i])) {
                        if(this.props.socket.id == this.props.order[i]) {
                            player_items.push(
                                <li className="player-item" style={{boxShadow: this.state.votedId == this.props.order[i] ? "inset 0 0 0 2px rgb(3 117 154)" : "none"}} key={this.props.order[i]}>
                                    {this.props.players[this.props.order[i]].name}
                                    <span className="word-label">{this.props.players[this.props.order[i]].word}</span>
                                </li>
                            )
                        } else {
                            player_items.push(
                                <li className="player-item votable-item" onClick={() => this.tiebreak(this.props.order[i])} style={{boxShadow: this.state.votedId == this.props.order[i] ? "inset 0 0 0 2px rgb(3 117 154)" : "none"}} key={this.props.order[i]}>
                                    {this.props.players[this.props.order[i]].name}
                                    <span className="word-label">{this.props.players[this.props.order[i]].word}</span>
                                </li>
                            )
                        }
                    }
                }
            } else {
                for(let i = 0; i < this.props.order.length; i++) {
                    player_items.push(
                        <li className="player-item" style={{boxShadow: this.state.votedId == this.props.order[i] ? "inset 0 0 0 2px rgb(3 117 154)" : "none"}} key={this.props.order[i]}>
                            {this.props.players[this.props.order[i]].name}
                            <span className="word-label">{this.props.players[this.props.order[i]].word}</span>
                        </li>
                    )
                }
            }
        } else {
            for(let i = 0; i < this.props.order.length; i++) {
                player_items.push(
                    <li className="player-item" key={this.props.order[i]}>
                        {this.props.players[this.props.order[i]].name}
                        <span className="word-label">{this.props.players[this.props.order[i]].word}</span>
                        <span className="turn-label" style={{display: this.props.turnId==this.props.order[i] ? "inline-block" : "none"}}>thinking of a word...</span>
                    </li>
                )
            }
        }

        return (
            <div className="ordered-player-list-container">
                <ul className="ordered-player-list">
                    {player_items}
                </ul>
            </div>
        );
    }
}

class TopicTable extends React.Component {
    constructor(props) {
        super(props);
    }

    pickWord = (index) => {
        this.props.socket.emit('cham-word', index);
    }

    render() {
        let rows = [];
        let row = [];

        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                if(this.props.chamPick && this.props.players[this.props.socket.id].cham) {
                    row.push(
                        <p className="topic-word pickable-word" key={i*4 + j} onClick={() => this.pickWord(i*4 + j)}>{this.props.topic.words[i*4 + j]}</p>
                    )
                } else {
                    row.push(
                        <p className="topic-word" style={{boxShadow: this.props.guess == i*4 + j ? "inset 0 0 0 2px rgb(3 117 154)" : "none"}} key={i*4 + j}>{this.props.topic.words[i*4 + j]}</p>
                    )
                }
            }
            rows.push(row);
            row = []
        }

        return (
            <div className="topic-table">
                <h2 className="topic-header">{this.props.topic.name}</h2>
                <div className="topic-row">
                    {rows[0]}
                </div>
                <div className="topic-row">
                    {rows[1]}
                </div>
                <div className="topic-row">
                    {rows[2]}
                </div>
                <div className="topic-row">
                    {rows[3]}
                </div>
            </div>
        )
    }
}

function GameWord(props) {
    const cham = props.cham
    if(cham) {
        return (
            <div className="game-word-wrapper">
                <h3>You are the CHAMELEON!  Try to blend in.</h3>
            </div>
        )
    } else {
        return (
            <div className="game-word-wrapper">
                <h3>The secret word is <span className="game-word">{props.word}</span></h3>
            </div>
        )
    }
}

class WordForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            word: ""
        }
    }

    wordChange = (e) => {
        this.setState({word: e.target.value});
    }
  
    wordSubmit = (e) => {
        e.preventDefault();
        this.sendWord();
    }

    sendWord = () => {
        this.props.socket.emit('word', this.state.word);
    }

    render() {
        return (
            <div className="word-wrapper">
                <h2>Enter a word:</h2>
                <form className="word-form" onSubmit={this.wordSubmit}>
                    <input className="word-input" type="text" value={this.state.word} onChange={this.wordChange} autoFocus={true} onBlur={({ target }) => target.focus()} spellCheck="false"></input>
                    <input className="word-submit" type="submit" disabled={!this.state.word} value="" />
                </form>
            </div>
        )
    }
}

function GameLayout(props) {
    const myTurn = props.myTurn;
    const votePhase = props.votePhase;
    const endPhase = props.endPhase;
    const chamPick = (props.pWin || props.cWin);

    if(votePhase) {
        return (
            <div className="game-layout">
                <GameWord cham={props.players[props.socket.id].cham} word={props.word}/>
                <OrderedPlayerList 
                    players={props.players}
                    order={props.order} 
                    socket={props.socket}
                    turnId={props.turnId}
                    votePhase={props.votePhase}
                    endPhase={props.endPhase}
                />
                <TopicTable 
                    topic={props.topic}
                    players={props.players}
                    chamPick={chamPick}
                    socket={props.socket}
                    isCorrect={props.isCorrect}
                    guess={props.guess}
                />
                <div className="vote-wrapper">
                    <h2>Discuss!</h2>
                    <h3>Then vote for the chameleon...</h3>
                </div>
            </div>
        )
    } else if(endPhase) {
        return (
            <div className="game-layout">
                <GameWord cham={props.players[props.socket.id].cham} word={props.word}/>
                <OrderedPlayerList 
                    players={props.players}
                    order={props.order} 
                    socket={props.socket}
                    turnId={props.turnId}
                    votePhase={props.votePhase}
                    endPhase={props.endPhase}
                    tie={props.tie}
                    tiedIds={props.tiedIds}
                />
                <TopicTable
                    topic={props.topic}
                    players={props.players}
                    chamPick={chamPick}
                    socket={props.socket}
                    isCorrect={props.isCorrect}
                    guess={props.guess}
                />
                <EndWrapper
                    socket={props.socket}
                    topic={props.topic}
                    order={props.order}
                    tie={props.tie}
                    pWin={props.pWin}
                    cWin={props.cWin}
                    votedName={props.votedName}
                    chamName={props.chamName}
                    isCorrect={props.isCorrect}
                    guess={props.guess}
                    word={props.word}
                />
            </div>
        )
    } else if(myTurn) {
        return (
            <div className="game-layout">
                <GameWord cham={props.players[props.socket.id].cham} word={props.word}/>
                <OrderedPlayerList 
                    players={props.players}
                    order={props.order} 
                    socket={props.socket}
                    turnId={props.turnId}
                    votePhase={props.votePhase}
                    endPhase={props.endPhase}
                />
                <TopicTable 
                    topic={props.topic}
                    players={props.players}
                    chamPick={chamPick}
                    socket={props.socket}
                    isCorrect={props.isCorrect}
                    guess={props.guess}
                />
                <WordForm socket={props.socket}/>
            </div>
        )
    } else {
        return (
            <div className="game-layout">
                <GameWord cham={props.players[props.socket.id].cham} word={props.word}/>
                <OrderedPlayerList 
                    players={props.players}
                    order={props.order} 
                    socket={props.socket}
                    turnId={props.turnId}
                    votePhase={props.votePhase}
                    endPhase={props.endPhase}
                />
                <TopicTable 
                    topic={props.topic}
                    players={props.players}
                    chamPick={chamPick}
                    socket={props.socket}
                    isCorrect={props.isCorrect}
                    guess={props.guess}
                />
            </div>
        )
    }
}


class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            topic: null,
            word: "",
            players: null,
            order: [],
            turnId: "",
            myTurn: false,
            votePhase: false,
            endPhase: false,
            isLoaded: false,
            tie: false,
            tiedIds: [],
            pWin: false,
            cWin: false,
            votedName: "",
            chamName: "",
            isCorrect: -1,
            guess: -1
        }

        this.props.socket.on('update-topic', (topic) => {
            console.log(topic);
            this.setState({topic});
            this.checkLoaded();
        });

        this.props.socket.on('update-word', (word) => {
            this.setState({word});
            this.checkLoaded();
        })

        this.props.socket.on('update-players', (players) => {
            this.setState({players});
            console.log(players);
            this.checkLoaded();
        });

        this.props.socket.on('update-order', (order) => {
            this.setState({order});
            this.checkLoaded();
        });

        this.props.socket.on('new-turn', (id) => {
            if(this.props.socket.id == id) {
                this.setState({myTurn: true});
            } else {
                this.setState({myTurn: false});
            }
            this.setState({turnId: id});
        });

        this.props.socket.on('vote-phase', (players) => {
            this.setState({turnId: "", myTurn: false, votePhase: true})
        });

        this.props.socket.on('end-phase', (players) => {
            console.log("caught endphase")
            this.setState({votePhase: false, endPhase: true})
        });

        this.props.socket.on('tie', (ids, order) => {
            this.setState({tie: true, tiedIds: ids});
        });

        this.props.socket.on('p-win', (name) => {
            console.log("caught pwin")
            this.setState({tie: false, pWin: true, chamName: name})
        });

        this.props.socket.on('c-win', (votedName, name) => {
            console.log("caught cwin")
            this.setState({tie: false, cWin: true, votedName: votedName, chamName: name})
        });

        this.props.socket.on('is-correct', (i, index) => {
            console.log("caught correct");
            this.setState({isCorrect: i, guess: index, pWin: false, cWin: false});
        });

        this.props.socket.on('reset-state', (name) => {
            console.log(name + " restarted the game");
            this.setState({
                topic: null,
                word: "",
                players: null,
                order: [],
                turnId: "",
                myTurn: false,
                votePhase: false,
                endPhase: false,
                isLoaded: false,
                tie: false,
                tiedIds: [],
                pWin: false,
                cWin: false,
                votedName: "",
                chamName: "",
                isCorrect: -1,
                guess: -1
            });
        });
    }

    checkLoaded = () => {
        if(this.state.topic != null && this.state.word != "" && this.state.players != null && this.state.order != []) {
            this.setState({isLoaded: true});
        }
    }

    render() {
        if(this.state.isLoaded) {
            return (
                <GameLayout 
                    players={this.state.players} 
                    order={this.state.order} 
                    topic={this.state.topic}
                    word={this.state.word}
                    turnId={this.state.turnId}
                    myTurn={this.state.myTurn} 
                    socket={this.props.socket}
                    votePhase={this.state.votePhase}
                    endPhase={this.state.endPhase}
                    tie={this.state.tie}
                    tiedIds={this.state.tiedIds}
                    pWin={this.state.pWin}
                    cWin={this.state.cWin}
                    votedName={this.state.votedName}
                    chamName={this.state.chamName}
                    isCorrect={this.state.isCorrect}
                    guess={this.state.guess}
                />
            )
        }

        return (
            <div></div>
        )
    } 
}









function PlayerList(props) {
    const players = props.players;

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
            players: {},
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
            this.nextScreen();
        })

        socket.on("add-player", (players) => {
            this.addPlayer(players);
        })

        socket.on("started", (name) => {
            console.log(name + " started the game.");
            this.setState({gameStart: true});
        })

        socket.on('error', (e) => {
            console.error(e);
            this.setState({error: e});
        })
    }

    addPlayer = (players) => {
        this.setState({players});
    }

    startGame = () => {
        this.state.socket.emit("start");
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

