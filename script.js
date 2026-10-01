const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const COLUNAS = 10;
const LINHAS = 20;
const TAMANHO = 30;

ctx.scale(TAMANHO, TAMANHO);

let tabuleiro;
let jogador;

let pontuacao = 0;
let linhas = 0;

const cores = [
    null,
    "#00ffff", // I
    "#0000ff", // J
    "#ff7f00", // L
    "#ffff00", // O
    "#00ff00", // S
    "#8000ff", // T
    "#ff0000"  // Z
];

const pecas = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],

    J: [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],

    L: [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],

    O: [
        [4, 4],
        [4, 4]
    ],

    S: [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],

    T: [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],

    Z: [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
};


// Cria o tabuleiro
function criarTabuleiro() {

    return Array.from(
        { length: LINHAS },
        () => Array(COLUNAS).fill(0)
    );

}


// Desenha os blocos
function desenharMatriz(matriz, deslocamento) {

    matriz.forEach((linha, y) => {

        linha.forEach((valor, x) => {

            if (valor !== 0) {

                ctx.fillStyle = cores[valor];

                ctx.fillRect(
                    x + deslocamento.x,
                    y + deslocamento.y,
                    1,
                    1
                );

                ctx.strokeStyle = "#111";

                ctx.lineWidth = 0.05;

                ctx.strokeRect(
                    x + deslocamento.x,
                    y + deslocamento.y,
                    1,
                    1
                );
            }

        });

    });

}


// Desenha o jogo inteiro
function desenhar() {

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        COLUNAS,
        LINHAS
    );

    desenharMatriz(
        tabuleiro,
        { x: 0, y: 0 }
    );

    desenharMatriz(
        jogador.matriz,
        jogador.pos
    );

}


// Cria uma nova peça
function novaPeca() {

    const tipos = "ILJOTSZ";

    const tipo =
        tipos[Math.floor(Math.random() * tipos.length)];

    jogador.matriz =
        pecas[tipo].map(linha => [...linha]);

    jogador.pos.y = 0;

    jogador.pos.x =
        Math.floor(
            COLUNAS / 2 -
            jogador.matriz[0].length / 2
        );

    if (colisao()) {

        alert("Game Over!");

        reiniciar();
    }

}


// Verifica colisão
function colisao() {

    const m = jogador.matriz;
    const o = jogador.pos;

    for (let y = 0; y < m.length; y++) {

        for (let x = 0; x < m[y].length; x++) {

            if (
                m[y][x] !== 0 &&
                (
                    tabuleiro[y + o.y] === undefined ||
                    tabuleiro[y + o.y][x + o.x] === undefined ||
                    tabuleiro[y + o.y][x + o.x] !== 0
                )
            ) {

                return true;
            }
        }
    }

    return false;
}


// Junta a peça ao tabuleiro
function juntar() {

    jogador.matriz.forEach((linha, y) => {

        linha.forEach((valor, x) => {

            if (valor !== 0) {

                tabuleiro[
                    y + jogador.pos.y
                ][
                    x + jogador.pos.x
                ] = valor;

            }

        });

    });

}


// Remove linhas completas
function limparLinhas() {

    let quantidade = 0;

    for (
        let y = tabuleiro.length - 1;
        y >= 0;
        y--
    ) {

        if (
            tabuleiro[y].every(
                valor => valor !== 0
            )
        ) {

            tabuleiro.splice(y, 1);

            tabuleiro.unshift(
                Array(COLUNAS).fill(0)
            );

            quantidade++;

            y++;
        }
    }

    if (quantidade > 0) {

        pontuacao += quantidade * 100;

        linhas += quantidade;

        document.getElementById("score")
            .textContent = pontuacao;

        document.getElementById("lines")
            .textContent = linhas;
    }

}


// Faz a peça cair
function descer() {

    jogador.pos.y++;

    if (colisao()) {

        jogador.pos.y--;

        juntar();

        limparLinhas();

        novaPeca();
    }

    tempo = 0;
}


// Move para os lados
function mover(direcao) {

    jogador.pos.x += direcao;

    if (colisao()) {

        jogador.pos.x -= direcao;
    }

}


// Rotaciona a peça
function girar() {

    const matriz = jogador.matriz;

    for (
        let y = 0;
        y < matriz.length;
        y++
    ) {

        for (
            let x = 0;
            x < y;
            x++
        ) {

            [
                matriz[x][y],
                matriz[y][x]
            ] = [
                    matriz[y][x],
                    matriz[x][y]
                ];

        }

    }

    matriz.forEach(linha => linha.reverse());

    if (colisao()) {

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            girar();
        }

    }

}


// Queda instantânea
function quedaRapida() {

    while (!colisao()) {

        jogador.pos.y++;
    }

    jogador.pos.y--;

    juntar();

    limparLinhas();

    novaPeca();

    tempo = 0;
}


// Controles
document.addEventListener("keydown", evento => {

    if (
        evento.key === "ArrowLeft" ||
        evento.key.toLowerCase() === "a"
    ) {

        mover(-1);

    } else if (
        evento.key === "ArrowRight" ||
        evento.key.toLowerCase() === "d"
    ) {

        mover(1);

    } else if (
        evento.key === "ArrowDown" ||
        evento.key.toLowerCase() === "s"
    ) {

        descer();

    } else if (
        evento.key === "ArrowUp" ||
        evento.key.toLowerCase() === "w"
    ) {

        girar();

    } else if (evento.code === "Space") {

        quedaRapida();

    }

});


// Sistema de tempo
let tempo = 0;

let intervalo = 800;

let ultimoTempo = 0;

function atualizar(tempoAtual = 0) {

    const delta = tempoAtual - ultimoTempo;

    ultimoTempo = tempoAtual;

    tempo += delta;

    if (tempo > intervalo) {

        descer();
    }

    desenhar();

    requestAnimationFrame(atualizar);
}


// Reinicia o jogo
function reiniciar() {

    tabuleiro = criarTabuleiro();

    pontuacao = 0;

    linhas = 0;

    document.getElementById("score")
        .textContent = "0";

    document.getElementById("lines")
        .textContent = "0";

    jogador = {

        pos: {
            x: 0,
            y: 0
        },

        matriz: null
    };

    novaPeca();
}


// Inicia o jogo
reiniciar();

atualizar();