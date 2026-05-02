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
    
    # 1. Update ke is_move_safe (Fungsi simulasi untuk cek keamanan Raja)
    chess_lib.is_move_safe.argtypes = [
        ctypes.c_char, ctypes.c_int, ctypes.c_int, 
        ctypes.c_int, ctypes.c_int, ctypes.c_char, ctypes.c_char_p
    ]
    chess_lib.is_move_safe.restype = ctypes.c_int

    # 2. Logika deteksi Skak (tetap ada untuk notifikasi UI)
    chess_lib.is_in_check.argtypes = [ctypes.c_char, ctypes.c_char_p]
    chess_lib.is_in_check.restype = ctypes.c_int

    print("Alhamdulillah, Library C Berhasil Dimuat dengan Proteksi Skak!")
except OSError as e:
    print(f"Gagal memuat library. Pesan error: {e}")

@app.route('/validate', methods=['GET'])
def validate_move():
    try:
        piece = request.args.get('piece', 'P')
        x1, y1 = int(request.args.get('x1')), int(request.args.get('y1'))
        x2, y2 = int(request.args.get('x2')), int(request.args.get('y2'))
        target = request.args.get('target', ' ')
        if not target or target == '': target = ' '
        
        board_str = request.args.get('board', ' ' * 64)
        
        # Panggil is_move_safe, bukan is_move_valid
        # Ini akan otomatis menolak gerakan yang membiarkan Raja kena skak
        is_valid = chess_lib.is_move_safe(
            piece.encode('utf-8'), 
            x1, y1, x2, y2, 
            target.encode('utf-8'),
            board_str.encode('utf-8')
        )
        
        return jsonify({
            "status": "success",
            "valid": bool(is_valid)
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/check_check', methods=['GET'])
def check_status():
    try:
        side = request.args.get('side', 'W') 
        board_str = request.args.get('board', ' ' * 64)
        
        in_check = chess_lib.is_in_check(
            side.encode('utf-8'), 
            board_str.encode('utf-8')
        )
        
        return jsonify({
            "in_check": bool(in_check)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
