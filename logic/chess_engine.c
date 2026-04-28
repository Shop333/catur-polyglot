#include <stdio.h>
#include <stdlib.h>
#include <math.h>

// Cek apakah ada bidak di antara jalan (untuk Benteng/Gajah/Ratu)
int is_path_clear(char board[8][8], int x1, int y1, int x2, int y2) {
    int stepX = (x2 > x1) ? 1 : (x2 < x1) ? -1 : 0;
    int stepY = (y2 > y1) ? 1 : (y2 < x1) ? -1 : 0; // Maaf, typo di sini y2 > y1
    stepY = (y2 > y1) ? 1 : (y2 < y1) ? -1 : 0;

    int currX = x1 + stepX;
    int currY = y1 + stepY;

    while (currX != x2 || currY != y2) {
        if (board[currX][currY] != ' ') return 0; // Jalan terhalang
        currX += stepX;
        currY += stepY;
    }
    return 1; // Jalan bersih
}

int is_move_valid(char piece, int x1, int y1, int x2, int y2, char target, char board[8][8]) {
    int dx = abs(x2 - x1);
    int dy = abs(y2 - y1);
    
    // 1. Cek tidak boleh makan teman sendiri
    // Bidak putih (A-Z), bidak hitam (a-z)
    if (target != ' ') {
        if ((piece >= 'A' && piece <= 'Z') && (target >= 'A' && target <= 'Z')) return 0;
        if ((piece >= 'a' && piece <= 'z') && (target >= 'a' && target <= 'z')) return 0;
    }

    char p = (piece >= 'a' && piece <= 'z') ? piece - 32 : piece;

    switch(p) {
        case 'R': // Benteng
            if (x1 == x2 || y1 == y2) return is_path_clear(board, x1, y1, x2, y2);
            return 0;
        case 'B': // Gajah
            if (dx == dy) return is_path_clear(board, x1, y1, x2, y2);
            return 0;
        case 'N': // Kuda
            return (dx * dy == 2);
        case 'Q': // Ratu
            if (x1 == x2 || y1 == y2 || dx == dy) return is_path_clear(board, x1, y1, x2, y2);
            return 0;
        case 'P': // Pion (Maju)
            if (piece == 'P') return (x1 - x2 == 1 && y1 == y2 && target == ' ');
            if (piece == 'p') return (x2 - x1 == 1 && y1 == y2 && target == ' ');
            return 0;
        case 'K': // Raja
            return (dx <= 1 && dy <= 1);
        default: return 0;
    }
}
