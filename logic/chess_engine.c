#include <stdio.h>
#include <stdlib.h>
#include <math.h>

// Fungsi pembantu untuk ambil bidak dari string papan 1D
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
        currX += stepX;
        currY += stepY;
    }
    return 1;
}

int is_move_valid(char piece, int x1, int y1, int x2, int y2, char target, const char* board) {
    int dx = abs(x2 - x1);
    int dy = abs(y2 - y1);
    
    // Tidak boleh makan teman sendiri
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
        case 'K': // Raja
            return (dx <= 1 && dy <= 1);
        case 'P': // Pion
            if (piece == 'P') { // Putih
                if (x1 - x2 == 1 && y1 == y2 && target == ' ') return 1; // Maju
                if (x1 - x2 == 1 && dx == 1 && dy == 1 && target != ' ') return 1; // Makan miring
            } else { // Hitam
                if (x2 - x1 == 1 && y1 == y2 && target == ' ') return 1; // Maju
                if (x2 - x1 == 1 && dx == 1 && dy == 1 && target != ' ') return 1; // Makan miring
            }
            return 0;
        default: return 0;
    }
}