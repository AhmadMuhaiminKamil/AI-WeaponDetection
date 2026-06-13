"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Camera, AlertTriangle, CheckCircle,
  Loader2, X, Shield, Zap
} from "lucide-react";
import { saveDetection } from "@/lib/detectionService";
import type { WeaponClass } from "@/lib/detectionService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Detection {
  class: string;
  confidence: number;
  bbox: number[];
}

interface PredictResult {
  success: boolean;
  detections: Detection[];
  detection_count: number;
  inference_time_ms: number;
  result_image: string;
  original_image: string;
  weapon_detected: boolean;
}

export default function PredictPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setSaved(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API_URL}/predict`, formData);
      const data: PredictResult = res.data;
      setResult(data);

      // Tentukan class utama yang terdeteksi
      const topClass: WeaponClass = data.weapon_detected
        ? (data.detections[0]?.class as WeaponClass) ?? 'no_weapon'
        : 'no_weapon';

      // Simpan ke Supabase
      const topConfidence = data.weapon_detected
        ? (data.detections[0]?.confidence ?? 0)
        : 0;

      await saveDetection({
        class:             topClass,
        confidence:        topConfidence,
        inference_time_ms: data.inference_time_ms,
        weapon_detected:   data.weapon_detected,
        detection_count:   data.detection_count,
      });

      setSaved(true);
    } catch {
      setError("Gagal menghubungi server. Pastikan backend sudah berjalan.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setSaved(false);
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-30" />

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Shield size={18} className="text-red-500" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white">Weapon Detection</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">Upload gambar untuk mendeteksi senjata menggunakan YOLOv11</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Upload Zone */}
              <motion.div
                animate={{
                  borderColor: dragging
                    ? "rgba(239, 68, 68, 0.5)"
                    : "rgba(31, 41, 55, 1)",
                  boxShadow: dragging
                    ? "0 0 30px rgba(239, 68, 68, 0.2)"
                    : "0 0 0 rgba(0, 0, 0, 0)"
                }}
                className={`card relative overflow-hidden cursor-pointer transition-all duration-300 mb-5 group ${
                  dragging
                    ? "border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/10"
                    : "border-gray-800 hover:border-gray-600 hover:shadow-lg hover:shadow-red-500/5"
                }`}
                style={{ borderStyle: "dashed", borderWidth: "2px" }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => !preview && fileRef.current?.click()}
                whileHover={{ scale: 1.01 }}
              >
                {dragging && <div className="scan-line" />}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {preview ? (
                  <motion.div
                    className="relative p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.img
                      src={preview}
                      alt="preview"
                      className="max-h-80 mx-auto rounded-xl object-contain shadow-lg shadow-red-500/10"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); handleReset(); }}
                      className="absolute top-6 right-6 w-8 h-8 bg-gray-900/80 hover:bg-red-500/80 border border-gray-700 rounded-full flex items-center justify-center transition-all"
                      whileHover={{ scale: 1.15, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={14} className="text-white" />
                    </motion.button>
                    <motion.div
                      className="text-center mt-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-gray-400 text-sm">{file?.name}</p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="py-20 text-center">
                    <motion.div
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Upload size={44} className="mx-auto mb-5 text-gray-600 group-hover:text-red-500/50 transition-colors duration-300" />
                    </motion.div>
                    <p className="text-gray-400 font-medium mb-1">Drop gambar di sini</p>
                    <p className="text-gray-600 text-sm">atau klik untuk memilih file</p>
                    <p className="text-gray-700 text-xs mt-3">PNG, JPG, WEBP</p>
                  </div>
                )}
              </motion.div>

              {/* Detect Button */}
              <AnimatePresence>
                {preview && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={!loading ? { scale: 1.03 } : {}}
                    whileTap={!loading ? { scale: 0.97 } : {}}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Menganalisis...
                      </>
                    ) : (
                      <>
                        <Camera size={16} />
                        Deteksi Sekarang
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Loading card */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 card p-6 flex items-center gap-4 border-red-500/20 bg-red-500/5"
                  >
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <div className="absolute inset-0 border-2 border-red-500/20 rounded-full" />
                      <div className="absolute inset-0 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Menganalisis gambar...</p>
                      <p className="text-gray-500 text-xs mt-0.5">Model YOLOv11 sedang memproses</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-4 card p-4 border-red-500/30 bg-red-500/10 flex items-center gap-3"
                  >
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Saved indicator */}
              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl w-fit"
                  >
                    <CheckCircle size={13} />
                    Hasil tersimpan ke database
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Banner */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                whileHover={{
                  boxShadow: result.weapon_detected
                    ? "0 20px 40px rgba(239, 68, 68, 0.2)"
                    : "0 20px 40px rgba(34, 197, 94, 0.2)"
                }}
                className={`card p-5 mb-6 flex items-center gap-4 ${
                  result.weapon_detected
                    ? "border-red-500/30 bg-red-500/10"
                    : "border-green-500/30 bg-green-500/10"
                }`}
              >
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    result.weapon_detected ? "bg-red-500/20" : "bg-green-500/20"
                  }`}
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {result.weapon_detected ? (
                    <AlertTriangle size={22} className="text-red-400" />
                  ) : (
                    <CheckCircle size={22} className="text-green-400" />
                  )}
                </motion.div>
                <div className="flex-1">
                  <p className={`font-semibold text-base ${result.weapon_detected ? "text-red-300" : "text-green-300"}`}>
                    {result.weapon_detected ? "Senjata Terdeteksi!" : "Tidak Ada Senjata"}
                  </p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {result.detection_count} objek · {result.inference_time_ms}ms inferensi
                  </p>
                </div>
                <motion.div
                  className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Zap size={12} className="text-yellow-400" />
                  <span className="text-gray-300 text-xs font-mono">{result.inference_time_ms}ms</span>
                </motion.div>
              </motion.div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {[
                  { label: "Gambar Asli", src: result.original_image },
                  { label: "Hasil Deteksi", src: result.result_image },
                ].map((img, i) => (
                  <motion.div
                    key={img.label}
                    initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.15, type: "spring", stiffness: 200 }}
                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" }}
                    className="card p-4 group cursor-default"
                  >
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium group-hover:text-gray-400 transition-colors duration-300">
                      {img.label}
                    </p>
                    <motion.img
                      src={img.src}
                      alt={img.label}
                      className="w-full rounded-lg object-contain max-h-60"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Detections */}
              {result.detections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card p-6 mb-5"
                >
                  <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Detail Deteksi</h3>
                  <div className="space-y-3">
                    {result.detections.map((d, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        whileHover={{ x: 4, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
                        className="flex items-center gap-4 bg-gray-900/50 rounded-xl px-4 py-3 border border-gray-800 group cursor-default transition-all"
                      >
                        <motion.div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${d.class === "pistol" ? "bg-red-500" : "bg-orange-500"}`}
                          style={{ boxShadow: `0 0 8px ${d.class === "pistol" ? "#ef4444" : "#f97316"}` }}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                        />
                        <span className="text-white capitalize font-medium text-sm w-16 group-hover:text-red-300 transition-colors duration-300">{d.class}</span>
                        <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${d.confidence * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                            className={`h-full rounded-full ${d.class === "pistol" ? "bg-red-500" : "bg-orange-500"}`}
                          />
                        </div>
                        <span className="text-gray-300 text-sm font-mono w-12 text-right group-hover:text-white transition-colors duration-300">
                          {(d.confidence * 100).toFixed(1)}%
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.button
                onClick={handleReset}
                className="btn-primary flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera size={16} />
                Deteksi Gambar Lain
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}