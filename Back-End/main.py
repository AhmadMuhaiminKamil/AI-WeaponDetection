from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import numpy as np
import cv2
import base64
import time
import io
from PIL import Image
from ultralytics import YOLO
import os

app = FastAPI(title="Weapon Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "best.pt")
model = None

def load_model():
    global model
    if model is None:
        model = YOLO(MODEL_PATH)
    return model

detection_stats = {
    "total_detections": 0,
    "pistol_count": 0,
    "knife_count": 0,
    "no_weapon_count": 0,
    "total_inference_time": 0.0,
}

CLASS_NAMES = {
    0: "pistol",
    1: "knife",
}

@app.on_event("startup")
async def startup_event():
    load_model()
    print("Model loaded successfully!")

@app.get("/")
def root():
    return {"message": "Weapon Detection API is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        img_array = np.array(image)
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

        m = load_model()
        start_time = time.time()
        results = m(img_bgr)
        inference_time = round((time.time() - start_time) * 1000, 2)

        detections = []
        img_result = img_bgr.copy()

        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                confidence = round(float(box.conf[0]), 4)
                class_id = int(box.cls[0])
                class_name = CLASS_NAMES.get(class_id, "unknown")

                color = (0, 0, 255) if class_name == "pistol" else (0, 165, 255)
                cv2.rectangle(img_result, (x1, y1), (x2, y2), color, 2)

                label = f"{class_name} {confidence:.0%}"
                label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(img_result, (x1, y1 - label_size[1] - 10), (x1 + label_size[0] + 8, y1), color, -1)
                cv2.putText(img_result, label, (x1 + 4, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

                detections.append({
                    "class": class_name,
                    "confidence": confidence,
                    "bbox": [x1, y1, x2, y2],
                })

                if class_name == "pistol":
                    detection_stats["pistol_count"] += 1
                elif class_name == "knife":
                    detection_stats["knife_count"] += 1

        if len(detections) == 0:
            detection_stats["no_weapon_count"] += 1

        detection_stats["total_detections"] += 1
        detection_stats["total_inference_time"] += inference_time

        _, buffer = cv2.imencode(".jpg", img_result)
        result_base64 = base64.b64encode(buffer).decode("utf-8")

        _, orig_buffer = cv2.imencode(".jpg", img_bgr)
        original_base64 = base64.b64encode(orig_buffer).decode("utf-8")

        return JSONResponse({
            "success": True,
            "detections": detections,
            "detection_count": len(detections),
            "inference_time_ms": inference_time,
            "result_image": f"data:image/jpeg;base64,{result_base64}",
            "original_image": f"data:image/jpeg;base64,{original_base64}",
            "weapon_detected": len(detections) > 0,
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_stats():
    avg_inference = 0.0
    if detection_stats["total_detections"] > 0:
        avg_inference = round(
            detection_stats["total_inference_time"] / detection_stats["total_detections"], 2
        )

    return {
        "total_detections": detection_stats["total_detections"],
        "pistol_count": detection_stats["pistol_count"],
        "knife_count": detection_stats["knife_count"],
        "no_weapon_count": detection_stats["no_weapon_count"],
        "avg_inference_time_ms": avg_inference,
        "weapon_detection_rate": round(
            (detection_stats["pistol_count"] + detection_stats["knife_count"])
            / max(detection_stats["total_detections"], 1)
            * 100, 2
        ),
    }

@app.post("/stats/reset")
def reset_stats():
    for key in detection_stats:
        detection_stats[key] = 0
    return {"message": "Stats reset successfully"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)
