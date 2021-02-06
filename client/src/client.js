const log = (text) => {
    console.log(text);
}

const joinGame = (sock) => (e) => {
    e.preventDefault();
    if($("#name_set").val() != "") {
        sock.emit("join", $("#name_set").val());
        $("#name_set").val("");
    }
}

const sendWord = (sock) => (e) => {
    e.preventDefault();
    if($("#word_set").val() != "") {
        sock.emit("word", $("#word_set").val());
        $("#word_set").val("");
    }
}

const updatePlayers = (players, order) => {
    $("#players").empty();
    
    if(order == null) {
        for(var id in players) {
            let content = players[id].name;
            if(players[id].cham) { content = content + " - Chameleon"; }

            $("#players").append("<h3>"+content+"</h3>");
        }
    } else {
        for(i = 0; i < order.length; i++) {
            let content = players[order[i]].name;
            if(players[order[i]].cham) { content = content + " - Chameleon"; }

            $("#players").append("<h3>"+content+"</h3>");
        }
    }
}

const startGame = (sock) => (e) => {
    e.preventDefault();

    sock.emit('start');
}

(() => {
    const sock = io();

    let turn = 0;
    let started = false;

    sock.on('message', (text) => {
        log(text);
    });

    sock.on('joined', (name) => {
        console.log('ive joined!');
        joined = true;
        $("#name").text(name);
        $("#name_form").css("display", "none");
        $("#buttons").css("display", "block");
        $("#players").css("display", "block");
    });

    sock.on('updatePlayers', (players, order=null) => {
        updatePlayers(players, order);
    });

    sock.on('updateTopic', (topic) => {
        $("#topic").css("display", "block");
        $("#topic").append("<h2>Topic: "+topic.name+"</h2>");
        for(i = 0; i < topic.words.length; i++) {
            $("#topic").append("<p>"+topic.words[i]+"</p>");
        }
    });

    sock.on('started', (name) => {
        console.log(name + ' started the game!');
        $("#buttons").css("display", "none");
    });

    sock.on('newTurn', (id) => {
        if(sock.id == id) {
            $("#word_form").css("display", "block");
        } else {
            $("#word_form").css("display", "none");
        }
    });

    sock.on('votePhase', (players) => {
        $("#word_form").css("display", "none");
        $("#vote_buttons").css("display", "block");
        for(var id in players) {
            if(sock.id != id) {
                $("#vote_buttons").append("<button class='vote' data-id='"+id+"'>"+players[id].name+"</button>");
            }
        }
        $(document).on("click", ".vote", function() {
            console.log($(this).attr("data-id"))
            sock.emit('vote', $(this).attr("data-id"));
            $("#vote_buttons").empty();
        });
    });

    sock.on('endPhase', () => {
        $("#vote_buttons").css("display", "none");
        $("#topic").css("display", "none");
    });

    sock.on('pWin', (name) => {
        $('#win').css("display", "block");
        $('#win').text("Players win!  The chameleon was " + name + ".");
    })

    sock.on('cWin', (name) => {
        $('#win').css("display", "block");
        $('#win').text(name + " wins!  They were the chameleon.");
    })

    sock.on('error', (err) => {
        console.log(err);
    });

    $("#start_game").click(startGame(sock));

    $("#name_form").submit(joinGame(sock));

    $("#word_form").submit(sendWord(sock));
})();
