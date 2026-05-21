import { motion } from 'framer-motion'

export default function SectionHeading({ eyebrow, title, subtitle, tone = 'dark', align = 'center' }) {
  const dark = tone === 'dark'
  const alignCls = align === 'left' ? 'text-left' : 'text-center mx-auto'
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55 }}
      className={`max-w-3xl ${alignCls}`}
    >
      {eyebrow && (
        <span className={dark ? 'eyebrow' : 'eyebrow-light'}>{eyebrow}</span>
      )}
      <h2 className={`section-heading mt-4 ${dark ? 'text-white' : 'text-navy'}`}>{title}</h2>
      {subtitle && (
        <p className={`mt-4 text-base leading-relaxed sm:text-lg ${dark ? 'text-muted' : 'text-slate2'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
