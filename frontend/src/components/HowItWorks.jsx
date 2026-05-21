import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading.jsx'

const steps = [
  {
    n: '01',
    title: 'Profile',
    body: 'Build a behavioral fingerprint from review history — tone, ratings, triggers, preferences.'
  },
  {
    n: '02',
    title: 'Retrieve',
    body: 'Find the most similar restaurants they’ve reviewed before, as grounding evidence.'
  },
  {
    n: '03',
    title: 'Reason',
    body: 'The LLM thinks step-by-step about how THIS user would react to THIS restaurant.'
  },
  {
    n: '04',
    title: 'Naija-fy',
    body: 'Polish the output into authentic Nigerian voice — natural Pidgin, local food references.'
  }
]

export default function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden bg-navy py-24 sm:py-28">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="The Pipeline"
          title="How NaijaEats Works"
          subtitle="Not one LLM call. A four-stage reasoning pipeline."
          tone="dark"
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative rounded-2xl border border-white/10 bg-navy-soft/60 p-6 backdrop-blur transition hover:border-gold/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/15 font-display text-lg font-bold text-gold">
                  {s.n}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
