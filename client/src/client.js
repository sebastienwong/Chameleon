const log = (text) => {
    const parent = document.querySelector('#main');
    const el = document.createElement('p');
    el.innerHTML = text;

    parent.appendChild(el);
}

const onButtonClick = (sock) => (e) => {
    e.preventDefault();

    sock.emit('message', 'client button was clicked!');
}

(() => {
    const sock = io();

    sock.on('message', (text) => {
        log(text);
    });

    document
        .querySelector('#hello')
        .addEventListener('click', onButtonClick(sock));
})();
