#include <stdio.h>
#include <stdlib.h>
#include <math.h>

// Helper untuk mengambil bidak
char get_at(const char* board, int r, int c) {
    if (r < 0 || r > 7 || c < 0 || c > 7) return ' '; // Boundary check
    return board[r * 8 + c];
}

// Cek apakah jalur kosong (untuk Benteng, Gajah, Ratu)
int is_path_clear(const char* board, int x1, int y1, int x2, int y2) {
    int stepX = (x2 > x1) ? 1 : (x2 < x1) ? -1 : 0;
    int stepY = (y2 > y1) ? 1 : (y2 < y1) ? -1 : 0;
    int currX = x1 + stepX;
    int currY = y1 + stepY;
    
    while (currX != x2 || currY != y2) {
        if (get_at(board, currX, currY) != ' ') return 0; 
        currX += stepX; 
        currY += stepY;
    }
    return 1;
}

// Fungsi utama validasi langkah fisik
int is_move_valid(char piece, int x1, int y1, int x2, int y2, char target, const char* board) {
    int dx = abs(x2 - x1);
    int dy = abs(y2 - y1);

    // Aturan dasar: Tidak bisa makan bidak kawan sendiri
    if (target != ' ') {
        if ((piece >= 'A' && piece <= 'Z') && (target >= 'A' && target <= 'Z')) return 0;
        if ((piece >= 'a' && piece <= 'z') && (target >= 'a' && target <= 'z')) return 0;
    }

    // Normalisasi karakter ke uppercase untuk logika bidak
    char p = (piece >= 'a' && piece <= 'z') ? piece - 32 : piece;

    switch(p) {
        case 'R': // Rook (Benteng)
            if (x1 == x2 || y1 == y2) return is_path_clear(board, x1, y1, x2, y2); 
            return 0;
        case 'B': // Bishop (Kerucut/Gajah)
            if (dx == dy) return is_path_clear(board, x1, y1, x2, y2); 
            return 0;
        case 'N': // Knight (Kuda)
            return (dx * dy == 2);
        case 'Q': // Queen (Menteri)
            if (x1 == x2 || y1 == y2 || dx == dy) return is_path_clear(board, x1, y1, x2, y2); 
            return 0;
        case 'K': // King (Raja)
            return (dx <= 1 && dy <= 1);
        case 'P': // Pawn (Anak/Pion)
            if (piece == 'P') { // Pion Putih (Naik ke atas/index berkurang)
                if (x1 - x2 == 1 && y1 == y2 && target == ' ') return 1; // Maju 1
                if (x1 == 6 && x1 - x2 == 2 && y1 == y2 && target == ' ' && get_at(board, 5, y1) == ' ') return 1; // Maju 2
                if (x1 - x2 == 1 && dy == 1 && target != ' ') return 1; // Makan diagonal
            } else { // Pion Hitam (Turun ke bawah/index bertambah)
                if (x2 - x1 == 1 && y1 == y2 && target == ' ') return 1;
                if (x1 == 1 && x2 - x1 == 2 && y1 == y2 && target == ' ' && get_at(board, 2, y1) == ' ') return 1;
                if (x2 - x1 == 1 && dy == 1 && target != ' ') return 1;
            }
            return 0;
        default: return 0;
    }
}

// Cek apakah Raja sedang terancam
int is_in_check(char side, const char* board) {
    int kx = -1, ky = -1;
    char king = (side == 'W') ? 'K' : 'k';

    // Cari lokasi Raja
    for (int r = 0; r < 8; r++) {
        for (int c = 0; c < 8; c++) {
            if (get_at(board, r, c) == king) { kx = r; ky = c; break; }
        }
        if (kx != -1) break;
    }

    if (kx == -1) return 0; // Raja tidak ditemukan (Harusnya tidak mungkin)

    // Cek semua bidak lawan, apakah ada yang bisa makan Raja
    for (int r = 0; r < 8; r++) {
        for (int c = 0; c < 8; c++) {
            char p = get_at(board, r, c);
            if (p == ' ') continue;
            int is_enemy = (side == 'W') ? (p >= 'a' && p <= 'z') : (p >= 'A' && p <= 'Z');
            if (is_enemy && is_move_valid(p, r, c, kx, ky, king, board)) return 1;
        }
    }
    return 0;
}

// Simulasi gerakan untuk mencegah langkah bunuh diri
int is_move_safe(char piece, int x1, int y1, int x2, int y2, char target, const char* board) {
    // Validasi fisik dasar
    if (!is_move_valid(piece, x1, y1, x2, y2, target, board)) return 0;

    // Duplikasi papan untuk simulasi
    char temp_board[64];
    for (int i = 0; i < 64; i++) temp_board[i] = board[i];

    // Eksekusi langkah di papan simulasi
    temp_board[x2 * 8 + y2] = piece;
    temp_board[x1 * 8 + y1] = ' ';

    // Tentukan sisi mana yang sedang bergerak
    char side = (piece >= 'A' && piece <= 'Z') ? 'W' : 'B';

    // Jika setelah gerak, Raja sendiri malah kena skak, maka gerakan tidak sah
    if (is_in_check(side, temp_board)) return 0;

    return 1;
}
