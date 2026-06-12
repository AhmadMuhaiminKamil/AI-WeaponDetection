'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Shield, ArrowRight, Mail, Lock } from 'lucide-react';
import supabase from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 10 },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email atau password salah.'
          : error.message
      );
      setIsLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Background decorations */}
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
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Shield className="w-8 h-8 text-red-500" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">Selamat Datang</h1>
            <p className="text-gray-400">Masuk ke Weapon Detection AI</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={itemVariants}
            className="card p-8 backdrop-blur-sm border border-gray-800"
          >
            <form onSubmit={handleSubmit} className="space-y-5">

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

              {/* Email Field */}
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

              {/* Password Field */}
              <motion.div variants={itemVariants} className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors duration-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-500 hover:text-red-400 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Forgot password */}
              <motion.div variants={itemVariants} className="flex justify-end text-sm">
                <Link href="/auth/forgot-password" className="text-red-500 hover:text-red-400 transition-colors duration-300 font-medium">
                  Lupa password?
                </Link>
              </motion.div>

              {/* Submit Button */}
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
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>


          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="text-center mt-8">
            <p className="text-gray-400">
              Belum punya akun?{' '}
              <Link
                href="/auth/register"
                className="text-red-500 hover:text-red-400 font-semibold transition-colors duration-300"
              >
                Daftar sekarang
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}