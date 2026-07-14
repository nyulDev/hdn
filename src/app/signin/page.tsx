"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          x: [0, -150, 0],
          y: [0, 100, 0],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-400/20 blur-[130px] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, 50, 0],
          y: [0, -150, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-indigo-400/10 blur-[140px] rounded-full"
      />
    </div>
  );
};

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const admins = {
    "admin1@haluan.id": "admin1",
    "admin2@haluan.id": "admin2",
    "admin3@haluan.id": "admin3",
    "admin4@haluan.id": "admin4",
    "admin5@haluan.id": "admin5",
    "nyulmac93@gmail.com": "Passwordapa",
    "adminhdn@gmail.com": "zxcvbnm",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate authentication
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validate credentials - trim whitespace and check
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (admins[trimmedEmail] === trimmedPassword) {
      setIsSuccess(true);
      // Wait for animation to play
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } else {
      setError("Email atau password tidak valid. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
      transition: { duration: 0.4 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="login-card"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="w-full max-w-md"
          >
            {/* Logo Container */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-10"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-800/50"
              >
                <img
                  src="/haluandayaniga.png"
                  alt="HALUAN DAYA NIAGA"
                  className="h-14 w-auto object-contain"
                />
              </motion.div>
            </motion.div>

            <Card className="border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg overflow-hidden relative">
              <motion.div
                className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />

              <CardHeader className="space-y-2 text-center pb-8 pt-10">
                <motion.div variants={itemVariants}>
                  <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                    Sign In
                  </CardTitle>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <CardDescription className="text-base text-slate-500 dark:text-slate-400 font-medium">
                    Enter your professional credentials
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5">
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="p-4 flex items-start gap-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-xl"
                      >
                        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div variants={itemVariants} className="space-y-2.5">
                    <Label htmlFor="email" className="font-semibold ml-1">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Mail className="w-4.5 h-4.5" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@haluan.id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-11 h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all rounded-xl focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2.5">
                    <Label htmlFor="password" className="font-semibold ml-1">
                      Secure Password
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock className="w-4.5 h-4.5" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-11 pr-11 h-12 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all rounded-xl focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5" />
                        ) : (
                          <Eye className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                </CardContent>

                <CardFooter className="flex flex-col gap-5 pb-10">
                  <motion.div variants={itemVariants} className="w-full">
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2.5">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Authenticating...</span>
                        </div>
                      ) : (
                        "Authorize Session"
                      )}
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-center gap-1.5 text-sm text-slate-400 font-medium"
                  >
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>Enterprise Security Enabled</span>
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                  </motion.div>
                </CardFooter>
              </form>
            </Card>

            <motion.div
              variants={itemVariants}
              className="text-center mt-10 space-y-1"
            >
              <p className="text-sm font-semibold text-slate-500">
                © {new Date().getFullYear()} HALUAN DAYA NIAGA
              </p>
              <p className="text-xs text-slate-400 font-mono tracking-tighter uppercase">
                Quotation System • TSC491
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-6 text-center"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2,
                }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10"
              >
                <ShieldCheck className="w-12 h-12 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-400 rounded-full blur-xl"
              />
            </div>

            <div className="space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-black tracking-tight dark:text-white"
              >
                Access Granted
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-slate-500 dark:text-slate-400 font-medium"
              >
                Redirecting to secure dashboard...
              </motion.p>
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
              className="h-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
