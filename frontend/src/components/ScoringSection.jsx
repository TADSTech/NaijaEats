import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading.jsx'

const rows = [
  {
    name: 'Review Text Quality',
    body: 'Deep profiling + retrieval = accurate tone matching.'
  },
  {
    name: 'Rating Accuracy',
    body: 'Behavioral fingerprint predicts the exact star rating.'
  },
  {
    name: 'Behavioural Fidelity',
    body: 'Nigerian voice layer — verified by real human eval.'
  },
  {
    name: 'Solution Paper',
    body: 'Clear reasoning, ablation study, honest tradeoffs.'
  },
  {
    name: 'Nigerian Bonus',
    body: 'Cultural authenticity built into the core, not bolted on.'
  }
]

export default function ScoringSection() {
  return (
    <section className="relative overflow-hidden bg-navy py-24 sm:py-28">
      <div className="absolute inset-0 hero-glow opacity-60" />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="The Rubric"
          title="Built To Win The Rubric"
          subtitle="Every design choice maps to a scoring criterion. No fluff."
          tone="dark"
        />

        <div className="mx-auto mt-12 max-w-4xl space-y-3">
          {rows.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group flex flex-col gap-2 rounded-xl border border-white/10 border-l-4 border-l-gold bg-navy-soft/60 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
            >
              <div className="font-display text-base font-bold text-white sm:w-64 sm:flex-shrink-0">
                {r.name}
              </div>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <p className="text-sm text-muted">{r.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
