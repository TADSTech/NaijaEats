import { Github } from 'lucide-react'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy py-14">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted">
              AI that finally speaks our language.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Project</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/akanjiolayinka/naijaeats"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-white transition hover:text-gold"
                >
                  <Github size={14} /> GitHub Repo
                </a>
              </li>
              <li>
                <a href="#how" className="text-white transition hover:text-gold">How It Works</a>
              </li>
              <li>
                <a href="#demo" className="text-white transition hover:text-gold">Demo</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Built For</h4>
            <p className="mt-4 text-sm text-white">
              The DSN × BCT LLM Agent Challenge
            </p>
            <p className="mt-2 text-xs text-muted">Lagos, Nigeria</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} NaijaEats. All rights reserved.</span>
          <span>Made with 🍲 in Lagos</span>
        </div>
      </div>
    </footer>
  )
}
