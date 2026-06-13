"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Camera,
  BarChart3,
  Zap,
  Eye,
  AlertTriangle,
  ChevronRight,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Typewriter from "./components/Typewriter";
import supabase from "@/lib/supabase";


const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const router = useRouter();  // ← tambah

  // ← tambah: handler yang cek session sebelum redirect
  const handleProtectedNav = async (href: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push(href)
    } else {
      router.push(`/auth/login?next=${href}`)
    }
  }
  const features = [
    {
      icon: <Camera size={22} />,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      title: "Upload & Detect",
      desc: "Upload gambar dan deteksi senjata secara otomatis menggunakan model YOLOv8.",
    },
    {
      icon: <Zap size={22} />,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      title: "Real-time Result",
      desc: "Hasil deteksi instan dengan bounding box dan confidence score yang akurat.",
    },
    {
      icon: <BarChart3 size={22} />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      title: "Analytics Dashboard",
      desc: "Monitor statistik deteksi secara lengkap dan real-time di dashboard.",
    },
  ];

  const stats = [
    { value: "YOLOv8", label: "Model AI" },
    { value: "2", label: "Kelas Senjata" },
    { value: "~6ms", label: "Inferensi" },
    { value: "95%+", label: "Akurasi" },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-40" />

      {/* Radial glow center */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
       {/* Hero */}
<section className="pt-28 pb-20 text-center">
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="show"
    custom={0}
  >
    <span className="badge mb-8 inline-flex">
      <Activity size={12} />
      Powered by YOLOv11 Deep Learning
    </span>
  </motion.div>

  <motion.h1
    variants={fadeUp}
    initial="hidden"
    animate="show"
    custom={1}
    className="text-6xl md:text-7xl font-black text-white mb-4 leading-[1.1] tracking-tight"
  >
    AI Weapon
    <br />
    <span className="gradient-text">Detection</span>
    <span className="text-white"> System</span>
  </motion.h1>

  <motion.p
  variants={fadeUp}
  initial="hidden"
  animate="show"
  custom={1.5}
  className="text-gray-400 text-base mb-6 tracking-[0.2em] uppercase font-light"
>
  By{" "}
  <Typewriter
    text="Ahmad Muhaimin Kamil"
    speed={80}
    className="text-red-400 font-semibold tracking-[0.15em]"
  />
</motion.p>

  <motion.p
    variants={fadeUp}
    initial="hidden"
    animate="show"
    custom={2}
    className="text-gray-400 text-lg max-w-lg mx-auto mb-10 leading-relaxed"
  >
    Sistem deteksi senjata berbasis Deep Learning yang mampu mendeteksi
    pistol dan pisau secara otomatis dari gambar.
  </motion.p>

  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="show"
    custom={3}
    className="flex gap-4 justify-center flex-wrap"
  >
    <button
      onClick={() => handleProtectedNav('/predict')}
      className="btn-primary flex items-center gap-2"
    >
      <Camera size={16} />
      Coba Deteksi
      <ChevronRight size={16} />
    </button>
    <button
      onClick={() => handleProtectedNav('/dashboard')}
      className="flex items-center gap-2 border border-gray-700 ..."
    >
      <BarChart3 size={16} />
      Lihat Dashboard
    </button>
  </motion.div>
</section>

        {/* Animated Shield Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex justify-center mb-20"
        >
          <div className="relative w-48 h-48 flex items-center justify-center float-anim">
            <div
              className="absolute inset-0 rounded-full border border-red-500/10 animate-ping"
              style={{ animationDuration: "3s" }}
            />
            <div
              className="absolute inset-4 rounded-full border border-red-500/15 animate-ping"
              style={{ animationDuration: "3s", animationDelay: "0.5s" }}
            />
            <div className="absolute inset-8 rounded-full border border-red-500/20" />
            <div className="relative w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center glow-red">
              <Shield size={40} className="text-red-500" />
            </div>

            {/* Orbit badges */}
            <div className="absolute top-4 right-2 bg-[#0d0d14] border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Eye size={12} className="text-red-400" />
              <span className="text-xs text-gray-300">Pistol</span>
            </div>
            <div className="absolute bottom-4 left-2 bg-[#0d0d14] border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <AlertTriangle size={12} className="text-orange-400" />
              <span className="text-xs text-gray-300">Knife</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              custom={i}
              whileHover={{ 
                scale: 1.05,
                y: -4,
                boxShadow: `0 20px 40px rgba(239, 68, 68, 0.15)`
              }}
              className="stat-card card text-center py-6 px-4 group cursor-default overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.p 
                className="text-2xl font-bold text-white mb-1 relative z-10"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {s.value}
              </motion.p>
              <p className="text-gray-500 text-xs uppercase tracking-wider relative z-10 group-hover:text-gray-400 transition-colors duration-300">
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              whileHover={{ 
                y: -8,
                boxShadow: `0 30px 50px rgba(0, 0, 0, 0.3)`
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="card card-hover feature-card p-7 group cursor-pointer"
            >
              <motion.div
                className={`w-11 h-11 ${f.bg} border ${f.border} rounded-xl flex items-center justify-center mb-5 ${f.color}`}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {f.icon}
              </motion.div>
              <h3 className="font-semibold text-white text-base mb-2 group-hover:text-red-300 transition-colors duration-300">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors duration-300">{f.desc}</p>
              <motion.div 
                className="mt-4 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full origin-left"
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          whileHover={{ 
            boxShadow: `0 40px 80px rgba(239, 68, 68, 0.2)`
          }}
          className="card p-10 mb-24 text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-500/5 pointer-events-none group-hover:from-red-500/10 group-hover:to-orange-500/10 transition-all duration-500" />
          <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-red-500/5 group-hover:bg-red-500/10 blur-3xl transition-all duration-500 pointer-events-none" />
          <motion.h2 
            className="text-2xl font-bold text-white mb-3 relative z-10"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Tentang Proyek
          </motion.h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed relative z-10 group-hover:text-gray-300 transition-colors duration-300">
            Dikembangkan sebagai Tugas Besar mata kuliah DIF60202 – Image
            Processing. Menggunakan YOLOv11 untuk mendeteksi senjata berbahaya
            guna mendukung keamanan publik.
          </p>
          <button
      onClick={() => handleProtectedNav('/predict')}
      className="btn-primary inline-flex items-center gap-2 relative z-10"
    >
      <Camera size={16} />
      Mulai Sekarang
    </button>
        </motion.div>
      </div>
    </div>
  );
}
