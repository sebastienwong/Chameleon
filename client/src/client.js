const log = (text) => {
    const parent = document.querySelector('#main');
    const el = document.createElement('p');
    el.innerHTML = text;

    parent.appendChild(el);
}

const joinGame = (sock) => (e) => {
    e.preventDefault();
    if($("#name_set").val() != "") {
        sock.emit("join", $("#name_set").val());
        $("#name_set").val("");
    }
}

const startGame = (sock) => (e) => {
    e.preventDefault();

    sock.emit('start');
}

(() => {
    const sock = io();
    let id;

    sock.on('message', (text) => {
        log(text);
    });

    sock.on('joined', () => {
        $("name_form").css("display", "none");
        $("main").css("display", "block");
    })

    $("#start_game").click(startGame(sock));
    $("#cham").click(function() {
        sock.emit('see_cham')
    });

    $("#name_form").submit(joinGame(sock));
})();
