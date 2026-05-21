import { Link } from 'react-router-dom'

export default function Logo({ to = '/', tone = 'dark', size = 'md' }) {
  const text = tone === 'dark' ? 'text-white' : 'text-navy'
  const sz = size === 'lg' ? 'text-2xl' : 'text-xl'
  return (
    <Link to={to} className={`group inline-flex items-center gap-2 font-display font-extrabold tracking-tight ${sz} ${text}`}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-navy-soft ring-1 ring-white/10">
        <span className="text-gold">N</span>
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-ngreen ring-2 ring-navy" />
      </span>
      <span>
        Naija<span className="text-gold">Eats</span>
      </span>
    </Link>
  )
}
