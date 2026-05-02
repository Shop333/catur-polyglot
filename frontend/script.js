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
    // Update warna indikator giliran di bawah papan
    infoBox.style.borderBottom = `4px solid ${turn === 'W' ? '#f0d9b5' : '#b58863'}`;
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            
            // PERBAIKAN PAPAN: Logika (r + c) % 2 memastikan pola checkered (selang-seling)
            // r=0, c=0 (0) -> white
            // r=0, c=1 (1) -> black
            const isWhite = (r + c) % 2 === 0;
            square.className = `square ${isWhite ? 'white' : 'black'}`;
            
            const piece = pieces[r][c];
            if (piece) square.innerText = pieceIcons[piece];
            
            // Highlight bidak yang sedang dipilih
            if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                square.classList.add('selected');
            }

            square.onclick = () => handleSquareClick(r, c);
            boardElement.appendChild(square);
        }
    }
}

async function handleSquareClick(r, c) {
    const targetPiece = pieces[r][c];

    // 1. MEMILIH BIDAK
    if (!selectedSquare) {
        if (targetPiece) {
            const isWhite = targetPiece === targetPiece.toUpperCase();
            if ((turn === 'W' && !isWhite) || (turn === 'B' && isWhite)) {
                statusElement.innerText = `Bukan giliranmu! (${turn === 'W' ? 'Putih' : 'Hitam'})`;
                statusElement.style.color = "#ffbb33";
                return;
            }
            selectedSquare = { r, c, piece: targetPiece };
            statusElement.innerText = `Pilih tujuan untuk ${pieceIcons[targetPiece]}`;
            statusElement.style.color = "white";
            renderBoard();
        }
    } 
    // 2. MENGEKSEKUSI GERAKAN
    else {
        // Klik kotak yang sama untuk membatalkan pilihan
        if (selectedSquare.r === r && selectedSquare.c === c) {
            selectedSquare = null;
            statusElement.innerText = `Giliran: ${turn === 'W' ? 'PUTIH' : 'HITAM'}`;
            statusElement.style.color = "white";
            renderBoard();
            return;
        }

        try {
            // Gabungkan papan jadi string 64 karakter untuk dikirim ke Python
            const boardString = pieces.flat().map(p => p === '' ? ' ' : p).join('');
            
            const url = `http://localhost:5000/validate?piece=${selectedSquare.piece}&x1=${selectedSquare.r}&y1=${selectedSquare.c}&x2=${r}&y2=${c}&target=${targetPiece || ' '}&board=${encodeURIComponent(boardString)}`;
            
            const res = await fetch(url);
            const data = await res.json();

            if (data.valid) {
                // Update array pieces (pindah bidak)
                pieces[r][c] = selectedSquare.piece;
                pieces[selectedSquare.r][selectedSquare.c] = '';
                
                // Siapkan data papan baru untuk cek status skak
                const newBoardString = pieces.flat().map(p => p === '' ? ' ' : p).join('');
                
                // Ganti giliran
                turn = turn === 'W' ? 'B' : 'W';

                // Cek apakah posisi Raja pemain berikutnya sedang Skak
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
                // Jika is_move_safe mengembalikan false
                statusElement.innerText = `Gerakan Ilegal! Raja terancam!`;
                statusElement.style.color = "#ff4444";
            }
        } catch (err) {
            statusElement.innerText = "Gagal terhubung ke server Python!";
            statusElement.style.color = "red";
        }

        selectedSquare = null;
        renderBoard();
    }
}

// Inisialisasi awal
renderBoard();
