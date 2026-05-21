import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading.jsx'

const messages = [
  {
    side: 'left',
    sender: 'Chukwuemeka',
    color: 'gold',
    text: 'Bayo abeg, that new spot for Surulere — Mama Titi’s — you don chop there before?'
  },
  {
    side: 'right',
    sender: 'NaijaEats',
    color: 'green',
    text: 'He never been there. But based on Bayo? He’d give it 3 stars. Amala go sweet am, but the slow service go vex am.'
  },
  {
    side: 'left',
    sender: 'Chukwuemeka',
    color: 'gold',
    text: 'Haha this sounds exactly like Bayo. Make I try the place myself.'
  }
]

export default function BayoStory() {
  return (
    <section className="bg-cream py-24 sm:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="A Story"
          title="Meet Bayo"
          subtitle="28, software engineer in Yaba. Reviewed 47 spots. Loves amala. Hates slow service."
          tone="light"
        />

        <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-navy/10 bg-white p-5 shadow-card sm:p-8">
          <div className="mb-5 flex items-center justify-between border-b border-navy/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ngreen text-sm font-bold text-white">CK</div>
              <div>
                <div className="text-sm font-semibold text-navy">Chukwuemeka</div>
                <div className="text-[11px] text-slate2">online</div>
              </div>
            </div>
            <span className="rounded-full bg-cream-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate2">
              WhatsApp
            </span>
          </div>

          <div className="space-y-3">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.55 }}
                className={`flex ${m.side === 'right' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    m.color === 'gold'
                      ? 'rounded-bl-sm bg-gold/90 text-navy'
                      : 'rounded-br-sm bg-ngreen text-white'
                  }`}
                >
                  <div className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${
                    m.color === 'gold' ? 'text-navy/70' : 'text-white/80'
                  }`}>
                    {m.sender}
                  </div>
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
