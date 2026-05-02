#include <stdio.h>
#include <stdlib.h>
#include <math.h>

// --- Fungsi yang sudah kamu buat ---

char get_at(const char* board, int r, int c) {
    return board[r * 8 + c];
}

int is_path_clear(const char* board, int x1, int y1, int x2, int y2) {
    int stepX = (x2 > x1) ? 1 : (x2 < x1) ? -1 : 0;
    int stepY = (y2 > y1) ? 1 : (y2 < y1) ? -1 : 0;
    int currX = x1 + stepX;
    int currY = y1 + stepY;
    while (currX != x2 || currY != y2) {
        if (get_at(board, currX, currY) != ' ') return 0; 
        currX += stepX; currY += stepY;
    }
    return 1;
}

int is_move_valid(char piece, int x1, int y1, int x2, int y2, char target, const char* board) {
    int dx = abs(x2 - x1);
    int dy = abs(y2 - y1);
    if (target != ' ') {
        if ((piece >= 'A' && piece <= 'Z') && (target >= 'A' && target <= 'Z')) return 0;
        if ((piece >= 'a' && piece <= 'z') && (target >= 'a' && target <= 'z')) return 0;
    }
    char p = (piece >= 'a' && piece <= 'z') ? piece - 32 : piece;
    switch(p) {
        case 'R': if (x1 == x2 || y1 == y2) return is_path_clear(board, x1, y1, x2, y2); return 0;
        case 'B': if (dx == dy) return is_path_clear(board, x1, y1, x2, y2); return 0;
        case 'N': return (dx * dy == 2);
        case 'Q': if (x1 == x2 || y1 == y2 || dx == dy) return is_path_clear(board, x1, y1, x2, y2); return 0;
        case 'K': return (dx <= 1 && dy <= 1);
        case 'P':
            if (piece == 'P') {
                if (x1 - x2 == 1 && y1 == y2 && target == ' ') return 1;
                if (x1 == 6 && x1 - x2 == 2 && y1 == y2 && target == ' ' && get_at(board, 5, y1) == ' ') return 1;
                if (x1 - x2 == 1 && dy == 1 && target != ' ') return 1;
            } else {
                if (x2 - x1 == 1 && y1 == y2 && target == ' ') return 1;
                if (x1 == 1 && x2 - x1 == 2 && y1 == y2 && target == ' ' && get_at(board, 2, y1) == ' ') return 1;
                if (x2 - x1 == 1 && dy == 1 && target != ' ') return 1;
            }
            return 0;
        default: return 0;
    }
}

int is_in_check(char side, const char* board) {
    int kx = -1, ky = -1;
    char king = (side == 'W') ? 'K' : 'k';
    for (int r = 0; r < 8; r++) {
        for (int c = 0; c < 8; c++) {
            if (get_at(board, r, c) == king) { kx = r; ky = c; break; }
        }
        if (kx != -1) break;
    }
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

// --- FUNGSI BARU: Simulasi Gerakan ---

int is_move_safe(char piece, int x1, int y1, int x2, int y2, char target, const char* board) {
    // 1. Cek dulu apakah gerakan bidaknya sendiri valid (Langkah benteng, kuda, dll)
    if (!is_move_valid(piece, x1, y1, x2, y2, target, board)) return 0;

    // 2. Simulasi: Buat papan sementara
    char temp_board[64];
    for (int i = 0; i < 64; i++) temp_board[i] = board[i];

    // Lakukan gerakan di papan simulasi
    temp_board[x2 * 8 + y2] = piece;
    temp_board[x1 * 8 + y1] = ' ';

    // 3. Cek apakah setelah gerakan ini, Raja sendiri masih diskak
    char side = (piece >= 'A' && piece <= 'Z') ? 'W' : 'B';
    if (is_in_check(side, temp_board)) return 0; // Tidak aman (masih skak)

    return 1; // Aman
}
