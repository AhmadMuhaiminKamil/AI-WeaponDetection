# Weapon Detection API

Backend FastAPI untuk aplikasi Weapon Detection berbasis YOLOv8.

## Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Cek API berjalan |
| GET | `/health` | Cek status model |
| POST | `/predict` | Upload gambar → deteksi senjata |
| GET | `/stats` | Ambil statistik deteksi |
| POST | `/stats/reset` | Reset statistik |

## Cara Menjalankan Lokal

1. Letakkan model `best.pt` di folder `model/`
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Jalankan server:
```bash
python main.py
```
4. Buka docs di: http://localhost:8000/docs

## Struktur Folder

```
backend/
├── main.py
├── requirements.txt
├── render.yaml
└── model/
    └── best.pt   ← taruh model YOLOv8 kamu di sini
```

## Deploy ke Render

1. Push ke GitHub
2. Buat akun di render.com
3. New → Web Service → Connect repo
4. Render otomatis baca `render.yaml`
