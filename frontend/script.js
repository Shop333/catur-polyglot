const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const infoBox = document.getElementById('info');

let selectedSquare = null;
let turn = 'W';

// Inisialisasi posisi awal papan
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
    // Indikator giliran pada border bawah box info
    infoBox.style.borderBottom = `6px solid ${turn === 'W' ? '#f0d9b5' : '#b58863'}`;
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            
            // Logika (r + c) % 2 menjamin pola selang-seling yang benar
            const isWhite = (r + c) % 2 === 0;
            square.className = `square ${isWhite ? 'white' : 'black'}`;
            
            const piece = pieces[r][c];
            if (piece) square.innerText = pieceIcons[piece];
            
            // Highlight kotak yang sedang dipilih
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

    // --- 1. PROSES MEMILIH BIDAK ---
    if (!selectedSquare) {
        if (targetPiece) {
            const isWhite = targetPiece === targetPiece.toUpperCase();
            if ((turn === 'W' && !isWhite) || (turn === 'B' && isWhite)) {
                statusElement.innerText = `Bukan giliranmu! (${turn === 'W' ? 'Putih' : 'Hitam'})`;
                statusElement.style.color = "#ffbb33";
                return;
            }
            selectedSquare = { r, c, piece: targetPiece };
            statusElement.innerText = `Gerakkan ${pieceIcons[targetPiece]} ke...`;
            statusElement.style.color = "white";
            renderBoard();
        }
    } 
    // --- 2. PROSES MENGGERAKKAN BIDAK ---
    else {
        // Batal pilih jika klik kotak yang sama
        if (selectedSquare.r === r && selectedSquare.c === c) {
            selectedSquare = null;
            statusElement.innerText = `Giliran: ${turn === 'W' ? 'PUTIH' : 'HITAM'}`;
            statusElement.style.color = "white";
            renderBoard();
            return;
        }

        try {
            // Konversi papan ke string 64 karakter untuk backend
            const boardString = pieces.flat().map(p => p === '' ? ' ' : p).join('');
            const url = `http://localhost:5000/validate?piece=${selectedSquare.piece}&x1=${selectedSquare.r}&y1=${selectedSquare.c}&x2=${r}&y2=${c}&target=${targetPiece || ' '}&board=${encodeURIComponent(boardString)}`;
            
            const res = await fetch(url);
            const data = await res.json();

            if (data.valid) {
                let movingPiece = selectedSquare.piece;

                // --- FITUR PROMOSI PION ---
                if ((movingPiece === 'P' && r === 0) || (movingPiece === 'p' && r === 7)) {
                    const choice = prompt("Pion Promosi! Ketik: Q (Menteri), R (Benteng), B (Gajah), N (Kuda)", "Q");
                    const pChar = (choice || "Q").toUpperCase()[0];
                    
                    const validPromotions = ['Q', 'R', 'B', 'N'];
                    const finalChar = validPromotions.includes(pChar) ? pChar : 'Q';
                    
                    // Putih pakai Uppercase, Hitam pakai Lowercase
                    movingPiece = (movingPiece === 'P') ? finalChar : finalChar.toLowerCase();
                }

                // Update array pieces (pindah posisi)
                pieces[r][c] = movingPiece;
                pieces[selectedSquare.r][selectedSquare.c] = '';
                
                // Ganti giliran
                turn = turn === 'W' ? 'B' : 'W';

                // Cek apakah pemain setelahnya terkena SKAK
                const newBoardString = pieces.flat().map(p => p === '' ? ' ' : p).join('');
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
                // Pesan jika gerakan ilegal atau membiarkan Raja terancam
                statusElement.innerText = `Ilegal! Raja terancam!`;
                statusElement.style.color = "#ff4444";
            }
        } catch (err) {
            statusElement.innerText = "Koneksi ke Server Terputus!";
            statusElement.style.color = "red";
        }

        // Reset pilihan dan gambar ulang papan
        selectedSquare = null;
        renderBoard();
    }
}

// Jalankan fungsi awal
renderBoard();
