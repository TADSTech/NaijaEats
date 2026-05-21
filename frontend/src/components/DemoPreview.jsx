import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles, Star } from 'lucide-react'
import SectionHeading from './SectionHeading.jsx'

const initialForm = {
  userId: 'bayo_001',
  restaurant: "Mama Titi's Kitchen",
  category: 'Nigerian',
  price: '₦₦'
}

export default function DemoPreview() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState(null)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const generate = (e) => {
    e.preventDefault()
    setLoading(true)
    setOutput(null)
    setTimeout(() => {
      setLoading(false)
      setOutput({
        rating: 3,
        confidence: 87,
        text: `${form.restaurant}'s amala? E dey slap die. Portion sizes mad, and the ewedu sweet pass. But the service na to wait small wait — make dem upgrade. Worth am sha, but no come hungry-hungry.`
      })
    }, 1500)
  }

  return (
    <section id="demo" className="bg-cream py-24 sm:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Live Demo"
          title="See It In Action"
          subtitle="Type in any restaurant. Watch NaijaEats predict Bayo's exact reaction — rating, voice, and all."
          tone="light"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <form onSubmit={generate} className="rounded-2xl border border-navy/10 bg-white p-7 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-navy">Restaurant Input</h3>
              <span className="rounded-full bg-cream-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate2">
                Mock · No API
              </span>
            </div>

            <div className="space-y-4">
              <Field label="User ID">
                <input
                  value={form.userId}
                  onChange={update('userId')}
                  className="demo-input"
                />
              </Field>
              <Field label="Restaurant Name">
                <input value={form.restaurant} onChange={update('restaurant')} className="demo-input" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select value={form.category} onChange={update('category')} className="demo-input">
                    <option>Nigerian</option>
                    <option>Continental</option>
                    <option>Fast Food</option>
                    <option>Cafe</option>
                  </select>
                </Field>
                <Field label="Price Range">
                  <select value={form.price} onChange={update('price')} className="demo-input">
                    <option>₦</option>
                    <option>₦₦</option>
                    <option>₦₦₦</option>
                    <option>₦₦₦₦</option>
                  </select>
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold mt-7 w-full disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Review
                </>
              )}
            </button>
          </form>

          {/* Output */}
          <div className="relative min-h-[360px] rounded-2xl border border-navy/10 bg-navy p-7 text-white shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Predicted Review</h3>
              <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {form.userId}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-56 flex-col items-center justify-center gap-3 text-muted"
                >
                  <Loader2 size={28} className="animate-spin text-gold" />
                  <span className="text-sm">Profiling · Retrieving · Reasoning · Naija-fying…</span>
                </motion.div>
              )}

              {!loading && !output && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-56 flex-col items-center justify-center gap-2 text-center text-muted"
                >
                  <Sparkles size={24} className="text-gold/70" />
                  <p className="text-sm">Click <span className="text-white">Generate Review</span> to simulate Bayo's response.</p>
                </motion.div>
              )}

              {!loading && output && (
                <motion.div
                  key="output"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <div className="flex items-center gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        fill="currentColor"
                        className={i < output.rating ? '' : 'text-white/15'}
                      />
                    ))}
                    <span className="ml-3 text-sm font-semibold text-white">{output.rating}/5</span>
                  </div>

                  <p className="mt-5 text-base leading-relaxed text-white">"{output.text}"</p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs uppercase tracking-[0.18em] text-muted">
                    <span>Confidence · <span className="text-gold">{output.confidence}%</span></span>
                    <span>Voice · Pidgin EN</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .demo-input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(14,27,46,0.12);
          background: #fff;
          padding: 11px 14px;
          font-size: 14px;
          color: #0E1B2E;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .demo-input:focus {
          border-color: #F2B137;
          box-shadow: 0 0 0 4px rgba(242,177,55,0.18);
        }
      `}</style>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate2">{label}</span>
      {children}
    </label>
  )
}
