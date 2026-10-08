"use client";

import { motion } from "framer-motion";

interface AnimatedTitleProps {
  open?: boolean;
}

export function AnimatedTitleFM({ open = true }: AnimatedTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 mb-6 backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-xs font-mono text-zinc-400 tracking-wide uppercase">
          AI-Refereed Coding Duels
        </span>
      </div>

      <h1 className="text-5xl sm:text-7xl font-bold font-mono tracking-tight text-white mb-6">
        Let the code{" "}
        <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-rose-400 bg-clip-text text-transparent">
          fight.
        </span>
      </h1>

      <p className="text-base sm:text-lg text-zinc-400 max-w-lg mx-auto mb-8 font-sans leading-relaxed">
        Two coders. One problem. Ten minutes on the clock.
        An AI judge calls the winner.
      </p>
    </motion.div>
  );
}
