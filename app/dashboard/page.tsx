"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import {
  BarChart3, Target, Clock, Shield,
  RefreshCw, TrendingUp, Activity, Crosshair
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Stats {
  total_detections: number;
  pistol_count: number;
  knife_count: number;
  no_weapon_count: number;
  avg_inference_time_ms: number;
  weapon_detection_rate: number;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchStats = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/stats`);
      setStats(res.data);
      setLastUpdated(new Date().toLocaleTimeString("id-ID"));
    } catch {
      console.error("Gagal mengambil statistik");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const resetStats = async () => {
    await axios.post(`${API_URL}/stats/reset`);
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const cards = stats
    ? [
        { label: "Total Gambar Diuji", value: stats.total_detections, icon: <Target size={18} />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { label: "Pistol Terdeteksi", value: stats.pistol_count, icon: <Crosshair size={18} />, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
        { label: "Pisau Terdeteksi", value: stats.knife_count, icon: <Shield size={18} />, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
        { label: "Rata-rata Inferensi", value: `${stats.avg_inference_time_ms}ms`, icon: <Clock size={18} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
        { label: "Detection Rate", value: `${stats.weapon_detection_rate}%`, icon: <TrendingUp size={18} />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { label: "Tidak Ada Senjata", value: stats.no_weapon_count, icon: <BarChart3 size={18} />, color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-700" },
      ]
    : [];

  const bars = stats
    ? [
        { label: "Pistol", value: stats.pistol_count, color: "bg-red-500", glow: "#ef4444", total: stats.total_detections },
        { label: "Pisau", value: stats.knife_count, color: "bg-orange-500", glow: "#f97316", total: stats.total_detections },
        { label: "Tidak Ada Senjata", value: stats.no_weapon_count, color: "bg-gray-600", glow: "#4b5563", total: stats.total_detections },
      ]
    : [];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-30" />

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div 
                className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: -10 }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <BarChart3 size={18} className="text-blue-400" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            </div>
            <p className="text-gray-500 text-sm ml-12">
              Statistik real-time sistem deteksi senjata
              {lastUpdated && <span className="ml-2 text-gray-600">· Update: {lastUpdated}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              onClick={() => fetchStats(true)}
              className="border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}
              >
                <RefreshCw size={14} />
              </motion.div>
              Refresh
            </motion.button>
            <motion.button
              onClick={resetStats}
              className="border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl text-sm transition-all"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              Reset
            </motion.button>
          </div>
        </motion.div>

        {loading ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-32 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div className="relative w-12 h-12">
              <div className="absolute inset-0 border-2 border-gray-800 rounded-full" />
              <motion.div 
                className="absolute inset-0 border-2 border-red-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            <p className="text-gray-500 text-sm">Memuat statistik...</p>
          </motion.div>
        ) : (
          <>
            {/* Live indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mb-6"
            >
              <motion.div 
                className="relative w-2 h-2"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div 
                  className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"
                  animate={{ opacity: [0.75, 0.2, 0.75] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </motion.div>
              <span className="text-gray-500 text-xs">Live — auto refresh setiap 10 detik</span>
            </motion.div>

            {/* Stat Cards */}
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
            >
              {cards.map((c, i) => (
                <motion.div
                  key={c.label}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ 
                    y: -8,
                    boxShadow: `0 25px 50px rgba(0, 0, 0, 0.3)`
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`card p-5 border ${c.border} group cursor-pointer overflow-hidden relative`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <motion.div 
                    className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center mb-4 ${c.color}`}
                    whileHover={{ scale: 1.25, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {c.icon}
                  </motion.div>
                  <motion.p 
                    className={`text-2xl font-bold ${c.color} mb-1 relative z-10`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {c.value}
                  </motion.p>
                  <p className="text-gray-500 text-xs leading-snug group-hover:text-gray-400 transition-colors duration-300 relative z-10">{c.label}</p>
                  <motion.div 
                    className="mt-2 h-0.5 bg-gradient-to-r from-red-500 to-transparent rounded-full"
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileHover={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ originX: 0 }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Bar Chart */}
            {stats && stats.total_detections > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" }}
                className="card p-7 group"
              >
                <div className="flex items-center gap-2 mb-7">
                  <Activity size={16} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                  <h3 className="text-white font-semibold text-sm group-hover:text-red-300 transition-colors duration-300">Distribusi Deteksi</h3>
                </div>
                <div className="space-y-5">
                  {bars.map((item, i) => (
                    <motion.div 
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <div className="flex justify-between text-xs mb-2">
                        <motion.span 
                          className="text-gray-400 font-medium"
                          whileHover={{ color: "rgb(229, 231, 235)" }}
                        >
                          {item.label}
                        </motion.span>
                        <span className="text-gray-300 font-mono">
                          {item.value} / {item.total}
                          <span className="text-gray-600 ml-2">
                            ({item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : 0}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden border border-gray-800 group-hover:border-gray-700 transition-colors duration-300">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                          transition={{ duration: 1, delay: 0.6 + i * 0.1, ease: "easeOut" }}
                          className={`${item.color} h-full rounded-full`}
                          style={{ boxShadow: `0 0 12px ${item.glow}60` }}
                          whileHover={{ boxShadow: `0 0 20px ${item.glow}` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="card p-16 text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BarChart3 size={44} className="mx-auto mb-4 text-gray-700" />
                </motion.div>
                <p className="text-gray-400 font-medium mb-1">Belum ada data</p>
                <p className="text-gray-600 text-sm">Coba deteksi beberapa gambar terlebih dahulu</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
