"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  Mail,
  Lock,
  User,
} from "lucide-react";
import supabase from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 10 },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "Email ini sudah terdaftar. Silakan masuk."
          : signUpError.message,
      );
      setIsLoading(false);
      return;
    }

    // Langsung login setelah register
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Register berhasil tapi login gagal, arahkan ke login manual
      router.push("/auth/login");
      return;
    }

    router.push("/");
    router.refresh();
  };

  // ── Form register ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -right-40 w-80 h-80 rounded-full bg-red-500/5 blur-3xl"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 -left-40 w-80 h-80 rounded-full bg-orange-500/5 blur-3xl"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 mb-4"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Shield className="w-8 h-8 text-red-500" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">Buat Akun</h1>
            <p className="text-gray-400">Daftar ke Weapon Detection AI</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={itemVariants}
            className="card p-8 backdrop-blur-sm border border-gray-800"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl"
                >
                  <span className="text-red-500">⚠</span>
                  {error}
                </motion.div>
              )}

              {/* Nama */}
              <motion.div variants={itemVariants} className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2.5">
                  Nama Lengkap
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors duration-300" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ahmad Muhaimin"
                    required
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-300"
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants} className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2.5">
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors duration-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-300"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors duration-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-500 hover:text-red-400 transition-colors duration-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Konfirmasi Password */}
              <motion.div variants={itemVariants} className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2.5">
                  Konfirmasi Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors duration-300" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Ulangi password"
                    required
                    className={`w-full bg-gray-900/50 border rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all duration-300 ${
                      confirm && confirm !== password
                        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                        : confirm && confirm === password
                          ? "border-green-500/50 focus:border-green-500/70 focus:ring-green-500/20"
                          : "border-gray-800 focus:border-red-500/50 focus:ring-red-500/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 text-gray-500 hover:text-red-400 transition-colors duration-300"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {confirm && confirm === password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400 text-xs mt-1.5 flex items-center gap-1"
                  >
                    ✓ Password cocok
                  </motion.p>
                )}
              </motion.div>

              {/* Submit */}
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary mt-2 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <span>Mendaftar...</span>
                  </>
                ) : (
                  <>
                    <span>Buat Akun</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="text-center mt-8">
            <p className="text-gray-400">
              Sudah punya akun?{" "}
              <Link
                href="/auth/login"
                className="text-red-500 hover:text-red-400 font-semibold transition-colors duration-300"
              >
                Masuk sekarang
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
