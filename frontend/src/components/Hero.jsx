import { motion } from 'framer-motion'
import { ArrowRight, FileText, Sparkles, Star, Utensils } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy pb-24 pt-32 md:pt-40">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 hero-glow" />

      <div className="container-x relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="eyebrow"
            >
              <Sparkles size={14} /> Behavioral AI · Built in Nigeria
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[64px]"
            >
              AI That Understands How <span className="text-gold">Nigerians Eat</span>, <span className="text-ngreen-soft">Talk</span>, and Rate.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            >
              NaijaEats studies your review history, learns your taste and personality, then writes reviews in your exact voice for restaurants you've never visited.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <a href="#demo" className="btn-gold">
                Try The Demo <ArrowRight size={16} />
              </a>
              <a href="#how" className="btn-outline-dark">
                <FileText size={16} /> Read The Paper
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.18em] text-muted"
            >
              <span>★ Voice-matched reviews</span>
              <span className="hidden h-1 w-1 rounded-full bg-muted/40 sm:inline-block" />
              <span>★ Nigerian cultural layer</span>
              <span className="hidden h-1 w-1 rounded-full bg-muted/40 sm:inline-block" />
              <span>★ Production-ready API</span>
            </motion.div>
          </div>

          <HeroMock />
        </div>
      </div>
    </section>
  )
}

function HeroMock() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-tr from-gold/20 via-transparent to-ngreen/20 blur-2xl" />

      <div className="rounded-2xl border border-white/10 bg-navy-soft/90 p-5 shadow-card backdrop-blur">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted">
          <span className="h-2 w-2 rounded-full bg-gold" /> Input · Restaurant
        </div>
        <div className="rounded-xl border border-white/10 bg-navy/60 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Utensils size={18} />
            </span>
            <div>
              <div className="font-semibold text-white">Mama Titi's Kitchen</div>
              <div className="text-xs text-muted">Surulere · Nigerian · ₦₦</div>
            </div>
          </div>
        </div>

        <div className="my-3 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-navy shadow-gold"
          >
            <ArrowRight size={16} className="rotate-90" />
          </motion.div>
        </div>

        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-ngreen-soft">
          <span className="h-2 w-2 rounded-full bg-ngreen" /> Output · Bayo · 3/5
        </div>
        <div className="rounded-xl border border-ngreen/30 bg-ngreen/10 p-4">
          <div className="mb-2 flex items-center gap-1 text-gold">
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} className="text-white/20" fill="currentColor" />
            <Star size={14} className="text-white/20" fill="currentColor" />
          </div>
          <p className="text-sm leading-relaxed text-white">
            "Mama Titi's amala? E dey slap die. But the service? Na to wait small wait. Worth am sha — but no come hungry-hungry."
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
            <span>Confidence · 87%</span>
            <span>2.4s · Sonnet</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
