import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading.jsx'

const cards = [
  {
    icon: '🧠',
    title: 'No Personality',
    body: 'Every user gets the same generic predictions. Your taste, your triggers, your unique writing style — completely ignored.'
  },
  {
    icon: '🌍',
    title: 'No Culture',
    body: 'A 3-star from a Nigerian is not the same as a 3-star from an American. Western models miss this completely.'
  },
  {
    icon: '🗣️',
    title: 'No Voice',
    body: 'Generated reviews sound robotic. Nobody actually talks like "This establishment provided satisfactory dining."'
  }
]

export default function ProblemSection() {
  return (
    <section id="problem" className="bg-cream py-24 sm:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="The Gap"
          title="The Problem With AI Today"
          subtitle="Mainstream review AI ignores who you are, where you're from, and how you actually talk."
          tone="light"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-navy/10 bg-white p-7 shadow-card transition hover:-translate-y-1 hover:border-gold/60"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cream-soft text-3xl">
                {c.icon}
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-navy">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate2">{c.body}</p>
              <div className="mt-6 h-1 w-12 rounded-full bg-gold/60 transition group-hover:w-20" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
