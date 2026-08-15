import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center gradient-mesh p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            SmartLog
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Your AI-powered learning journal</p>
        </div>

        <div className="glass glow rounded-2xl p-8">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
