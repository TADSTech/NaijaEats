import { motion } from 'framer-motion'
import { Boxes, Cpu, Database, FlaskConical, Languages, Server } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'

const items = [
  { icon: Cpu, name: 'Claude Sonnet', desc: 'Reasoning + generation' },
  { icon: Boxes, name: 'Sentence Transformers', desc: 'Behavioral embeddings' },
  { icon: Database, name: 'ChromaDB', desc: 'Vector similarity search' },
  { icon: Server, name: 'FastAPI', desc: 'Containerized REST API' },
  { icon: Languages, name: 'Nigerian Layer', desc: 'Pidgin & cultural adaptation' },
  { icon: FlaskConical, name: 'Evaluation Suite', desc: 'RMSE · BERTScore · Human eval' }
]

export default function TechStack() {
  return (
    <section className="relative overflow-hidden bg-navy py-24 sm:py-28">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Tech Stack"
          title="Built With Production-Grade Tools"
          subtitle="Every component is chosen to be deployable, observable, and honest about its limits."
          tone="dark"
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-navy-soft/60 p-6 transition hover:border-gold/50"
            >
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <t.icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-white">{t.name}</h3>
                <p className="mt-1 text-sm text-muted">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
