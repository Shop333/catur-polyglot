const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const infoBox = document.getElementById('info');

let selectedSquare = null;
let turn = 'W';

const pieces = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
];

const pieceIcons = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

function renderBoard() {
    boardElement.innerHTML = '';
    infoBox.style.borderBottom = `4px solid ${turn === 'W' ? '#f0d9b5' : '#b58863'}`;
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.className = `square ${(r + c) % 2 === 0 ? 'white' : 'black'}`;
            
            const piece = pieces[r][c];
            if (piece) square.innerText = pieceIcons[piece];
            if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) square.classList.add('selected');

            square.onclick = () => handleSquareClick(r, c);
            boardElement.appendChild(square);
        }
    }
}

async function handleSquareClick(r, c) {
    const targetPiece = pieces[r][c];

    if (!selectedSquare) {
        if (targetPiece) {
            const isWhite = targetPiece === targetPiece.toUpperCase();
            if ((turn === 'W' && !isWhite) || (turn === 'B' && isWhite)) {
                statusElement.innerText = `Bukan giliranmu!`;
                return;
            }
            selectedSquare = { r, c, piece: targetPiece };
            statusElement.innerText = `Gerak ke mana?`;
            renderBoard();
        }
    } else {
        if (selectedSquare.r === r && selectedSquare.c === c) {
            selectedSquare = null;
            renderBoard();
            return;
        }

        try {
            const boardString = pieces.flat().map(p => p === '' ? ' ' : p).join('');
            const url = `http://localhost:5000/validate?piece=${selectedSquare.piece}&x1=${selectedSquare.r}&y1=${selectedSquare.c}&x2=${r}&y2=${c}&target=${targetPiece || ' '}&board=${encodeURIComponent(boardString)}`;
            
            const res = await fetch(url);
            const data = await res.json();

            if (data.valid) {
                pieces[r][c] = selectedSquare.piece;
                pieces[selectedSquare.r][selectedSquare.c] = '';
                
                const newBoardString = pieces.flat().map(p => p === '' ? ' ' : p).join('');
                turn = turn === 'W' ? 'B' : 'W';

                // Cek Skak
                const checkRes = await fetch(`http://localhost:5000/check_check?side=${turn}&board=${encodeURIComponent(newBoardString)}`);
                const checkData = await checkRes.json();

                if (checkData.in_check) {
                    statusElement.innerText = `⚠️ SKAK! Giliran: ${turn === 'W' ? 'PUTIH' : 'HITAM'}`;
                    statusElement.style.color = "#ff4444";
                } else {
                    statusElement.innerText = `Giliran: ${turn === 'W' ? 'PUTIH' : 'HITAM'}`;
                    statusElement.style.color = "white";
                }
            } else {
                statusElement.innerText = `Ilegal!`;
            }
        } catch (err) {
            statusElement.innerText = "Error Backend!";
        }

        selectedSquare = null;
        renderBoard();
    }
}

renderBoard();
