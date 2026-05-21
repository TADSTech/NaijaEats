import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'

const team = [
  { name: 'Olayinka Akanji', role: 'AI/ML Engineer', initials: 'OA', color: 'bg-gold text-navy' },
  { name: 'Micheal Tunwase', role: 'Data Engineer', initials: 'MT', color: 'bg-ngreen text-white' }
]

export default function TeamSection() {
  return (
    <section id="team" className="bg-cream py-24 sm:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Builders"
          title="The Team"
          subtitle="A small team building grounded, culturally-aware AI from Lagos."
          tone="light"
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="flex flex-col items-center rounded-2xl border border-navy/10 bg-white p-7 text-center shadow-card transition hover:-translate-y-1 hover:border-gold/60"
            >
              <div className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${m.color}`}>
                {m.initials}
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-navy">{m.name}</h3>
              <p className="mt-1 text-sm text-slate2">{m.role}</p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="flex flex-col items-center rounded-2xl border-2 border-dashed border-navy/20 bg-transparent p-7 text-center transition hover:border-gold"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream-soft text-navy">
              <Plus size={28} />
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-navy">Join Us</h3>
            <p className="mt-1 text-sm text-slate2">We're always looking for contributors.</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
