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
    
    # Update argtypes: Tambahkan satu char lagi untuk 'target'
    # Parameter: (piece, x1, y1, x2, y2, target)
    chess_lib.is_move_valid.argtypes = [
        ctypes.c_char, # piece yang gerak
        ctypes.c_int,  # x1
        ctypes.c_int,  # y1
        ctypes.c_int,  # x2
        ctypes.c_int,  # y2
        ctypes.c_char  # target (bidak di kotak tujuan)
    ]
    chess_lib.is_move_valid.restype = ctypes.c_int

    print("Alhamdulillah, Library C berhasil dimuat dengan logika Target!")
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
        # Ambil bidak target dari frontend, jika kosong beri spasi ' '
        target = request.args.get('target', ' ')
        if target == '': target = ' '
        
        # Panggil fungsi C dengan parameter tambahan 'target'
        is_valid = chess_lib.is_move_valid(
            piece.encode('utf-8'), 
            x1, y1, x2, y2, 
            target.encode('utf-8')
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
