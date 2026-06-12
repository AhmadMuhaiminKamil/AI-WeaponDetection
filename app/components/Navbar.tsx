"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LogOut, LayoutDashboard, Home, Crosshair } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import supabase from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    // Ambil sesi awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Subscribe perubahan auth (login/logout/refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const links = [
    { href: "/", label: "Home", icon: <Home size={14} /> },
    { href: "/predict", label: "Detection", icon: <Crosshair size={14} /> },
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050508]/95 backdrop-blur-xl border-b border-gray-800/50 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div className="relative" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
              <motion.div
                className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Shield className="relative text-red-500" size={22} />
              </motion.div>
            </motion.div>
            <motion.span
              className="font-bold text-lg text-white tracking-tight"
              whileHover={{ letterSpacing: "0.05em" }}
            >
              Weapon<span className="text-red-500">Detect</span>
            </motion.span>
          </Link>
        </motion.div>

        {/* Right side */}
        {mounted && (
          <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {user ? (
                /* ── LOGGED IN ── */
                <motion.div
                  key="logged-in"
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {links.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.07 }}
                    >
                      <Link
                        href={link.href}
                        className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          pathname === link.href
                            ? "text-white bg-red-500/10 border border-red-500/30"
                            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <span className={pathname === link.href ? "text-red-400" : "text-gray-600"}>
                          {link.icon}
                        </span>
                        {link.label}
                        {pathname === link.href && (
                          <motion.span
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"
                            layoutId="navIndicator"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}

                  <div className="w-px h-6 bg-gray-800 mx-3" />

                  {/* User email + logout */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 max-w-[120px] truncate hidden md:block">
                      {user.email}
                    </span>
                    <motion.button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                /* ── NOT LOGGED IN ── */
                <motion.div
                  key="logged-out"
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  <Link
                    href="/auth/login"
                    className="relative px-5 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-all duration-200 hover:bg-white/5"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/register"
                    className="relative flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                      border: "1px solid rgba(239,68,68,0.4)",
                    }}
                  >
                    <motion.span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    <Shield size={14} className="relative z-10" />
                    <span className="relative z-10">Daftar Gratis</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </nav>
  );
}