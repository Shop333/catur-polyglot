from flask import Flask, jsonify, request
from flask_cors import CORS
import ctypes
import os

app = Flask(__name__)
CORS(app)

# --- KONFIGURASI PATH ---
dulu = os.path.dirname(os.path.abspath(__file__))
lib_path = os.path.join(dulu, "..", "logic", "chess_engine.so")

print(f"Mencoba meload file di: {lib_path}")

try:
    chess_lib = ctypes.CDLL(lib_path)
    
    # Update argtypes: Sekarang menerima 7 parameter
    # (piece, x1, y1, x2, y2, target, board_string)
    chess_lib.is_move_valid.argtypes = [
        ctypes.c_char,   # piece
        ctypes.c_int,    # x1
        ctypes.c_int,    # y1
        ctypes.c_int,    # x2
        ctypes.c_int,    # y2
        ctypes.c_char,   # target
        ctypes.c_char_p  # board (string 64 karakter)
    ]
    chess_lib.is_move_valid.restype = ctypes.c_int

    print("Alhamdulillah, Library C Berhasil Dimuat dengan Logika Pathfinding!")
except OSError as e:
    print(f"Gagal memuat library. Pesan error: {e}")

@app.route('/validate', methods=['GET'])
def validate_move():
    try:
        piece = request.args.get('piece', 'P')
        x1 = int(request.args.get('x1'))
        y1 = int(request.args.get('y1'))
        x2 = int(request.args.get('x2'))
        y2 = int(request.args.get('y2'))
        target = request.args.get('target', ' ')
        if not target or target == '': target = ' '
        
        # Ambil data papan (string 64 karakter dari JS)
        board_str = request.args.get('board', ' ' * 64)
        
        # Panggil fungsi C dengan data papan utuh
        is_valid = chess_lib.is_move_valid(
            piece.encode('utf-8'), 
            x1, y1, x2, y2, 
            target.encode('utf-8'),
            board_str.encode('utf-8')
        )
        
        return jsonify({
            "status": "success",
            "valid": bool(is_valid),
            "piece": piece,
            "target": target
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)