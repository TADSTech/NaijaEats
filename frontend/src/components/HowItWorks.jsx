import { useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionHeading from './SectionHeading.jsx'

gsap.registerPlugin(ScrollTrigger)

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
  const containerRef = useRef()
  const scrollRef = useRef()

  useGSAP(() => {
    const sections = gsap.utils.toArray('.h-slide')
    
    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => "+=" + scrollRef.current.offsetWidth
      }
    })
  }, { scope: containerRef })

  return (
    <section id="how" ref={containerRef} className="relative overflow-hidden bg-navy py-24 sm:py-28 h-screen flex flex-col justify-center">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="container-x relative mb-12">
        <SectionHeading
          eyebrow="The Pipeline"
          title="How NaijaEats Works"
          subtitle="Not one LLM call. A four-stage reasoning pipeline."
          tone="dark"
        />
      </div>

      <div className="relative w-full overflow-hidden flex">
        <div ref={scrollRef} className="flex gap-6 w-[400vw] lg:w-[200vw] px-[10vw]">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="h-slide w-full lg:w-1/2 flex-shrink-0 relative rounded-2xl border border-white/10 bg-navy-soft/60 p-8 md:p-12 backdrop-blur transition hover:border-gold/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gold/40 bg-gold/15 font-display text-2xl font-bold text-gold">
                  {s.n}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
              </div>
              <h3 className="mt-8 font-display text-3xl font-bold text-white">{s.title}</h3>
              <p className="mt-4 text-lg leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
