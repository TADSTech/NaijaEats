import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User, Loader2, Star, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  
  // State for form
  const [formData, setFormData] = useState({
    name: "Mama Titi's Kitchen",
    category: "Nigerian",
    price_range: "₦₦",
    location: "Surulere, Lagos",
    menu_highlights: "amala, gbegiri, assorted meat",
    common_tags: "authentic, slow service",
    simulate_as: "bayo_001"
  })

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)
  
  useEffect(() => {
    if (!localStorage.getItem('naijaeats_user')) {
      navigate('/login')
    }
  }, [navigate])

  const user = JSON.parse(localStorage.getItem('naijaeats_user') || '{"name": "Guest"}')

  const handleLogout = () => {
    localStorage.removeItem('naijaeats_user')
    navigate('/')
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const simulateLoadingSteps = () => {
    setLoadingStep(0)
    const intervals = [800, 1500, 2200]
    intervals.forEach((time, index) => {
      setTimeout(() => setLoadingStep(index + 1), time)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setResult(null)
    
    simulateLoadingSteps()

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${API_URL}/simulate-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: formData.simulate_as === 'active_user' ? (user.id || "loggedin_001") : formData.simulate_as,
          restaurant: {
            name: formData.name,
            category: formData.category,
            price_range: formData.price_range,
            location: formData.location,
            menu_highlights: formData.menu_highlights.split(',').map(s => s.trim()).filter(Boolean),
            common_tags: formData.common_tags.split(',').map(s => s.trim()).filter(Boolean)
          }
        })
      })

      if (!response.ok) {
        throw new Error('Simulation failed. Make sure the backend is running on port 8000.')
      }

      const data = await response.json()
      // Wait for loading animation to finish nicely before showing data
      setTimeout(() => {
        setResult(data)
        setIsSubmitting(false)
      }, 2500)
    } catch (err) {
      setTimeout(() => {
        setError(err.message)
        setIsSubmitting(false)
      }, 2500)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-navy text-white flex flex-col"
    >
      <div className="absolute inset-0 grid-bg opacity-30 z-0" />
      
      <header className="border-b border-white/10 bg-navy-soft/50 py-4 px-6 flex items-center justify-between relative z-10 backdrop-blur sticky top-0">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold bg-gradient-to-r from-gold to-white bg-clip-text text-transparent">NaijaEats</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-gold">
              <User size={16} />
            </div>
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted hover:text-white transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="container-x py-8 relative z-10 flex-1 flex flex-col pt-12">
        
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-display font-medium text-white mb-3">
              Simulate Review
            </h1>
            <p className="text-muted text-lg">
              Input a restaurant's details and watch the AI predict your exact review behavior.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            
            {/* INPUT FORM */}
            <div className="rounded-2xl border border-white/10 bg-navy-soft/60 backdrop-blur p-6 sm:p-8">
              <h2 className="text-xl font-display font-medium text-white mb-6">Restaurant Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Simulate As (Persona)</label>
                  <select 
                    name="simulate_as" value={formData.simulate_as} onChange={handleChange}
                    className="w-full rounded-lg border border-gold/30 bg-navy p-3 text-white outline-none focus:border-gold transition appearance-none font-medium"
                  >
                    <option value="active_user">My Profile ({user.name})</option>
                    <option value="bayo_001">Bayo (Loves Amala, Hates slow service)</option>
                    <option value="amaka_002">Amaka (Bougie, Loves ambience & aesthetics)</option>
                    <option value="chinedu_003">Chinedu (Budget-conscious, Cares about portion size)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Name</label>
                  <input 
                    required type="text" name="name" value={formData.name} onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-navy/50 p-3 text-white outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">Category</label>
                    <input 
                      required type="text" name="category" value={formData.category} onChange={handleChange}
                      className="w-full rounded-lg border border-white/10 bg-navy/50 p-3 text-white outline-none focus:border-gold transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">Price Range</label>
                    <select 
                      name="price_range" value={formData.price_range} onChange={handleChange}
                      className="w-full rounded-lg border border-white/10 bg-navy/50 p-3 text-white outline-none focus:border-gold transition appearance-none"
                    >
                      <option value="₦">₦ (Budget)</option>
                      <option value="₦₦">₦₦ (Mid)</option>
                      <option value="₦₦₦">₦₦₦ (High)</option>
                      <option value="₦₦₦₦">₦₦₦₦ (Luxury)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Location</label>
                  <input 
                    required type="text" name="location" value={formData.location} onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-navy/50 p-3 text-white outline-none focus:border-gold transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Menu Highlights (Comma separated)</label>
                  <input 
                    type="text" name="menu_highlights" value={formData.menu_highlights} onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-navy/50 p-3 text-white outline-none focus:border-gold transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Common Tags (Comma separated)</label>
                  <input 
                    type="text" name="common_tags" value={formData.common_tags} onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-navy/50 p-3 text-white outline-none focus:border-gold transition"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-6 rounded-lg bg-gold py-4 font-bold text-navy hover:bg-gold/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      Predict Review
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* RESULTS VIEW */}
            <div className="lg:sticky lg:top-24 h-full min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* IDLE STATE */}
                {!isSubmitting && !result && !error && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full rounded-2xl border-2 border-dashed border-white/10 bg-navy-soft/30 p-8 flex flex-col items-center justify-center text-center backdrop-blur"
                  >
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-muted mb-4">
                      <Star size={24} />
                    </div>
                    <p className="text-muted">Enter restaurant details to see what your simulated review will look like.</p>
                  </motion.div>
                )}

                {/* LOADING STATE */}
                {isSubmitting && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full rounded-2xl border border-white/10 bg-navy-soft/60 p-8 flex flex-col items-center justify-center backdrop-blur"
                  >
                    <Loader2 size={48} className="text-gold animate-spin mb-8" />
                    
                    <div className="w-full max-w-xs space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className={loadingStep >= 1 ? "text-gold" : "text-white/20"} />
                        <span className={loadingStep >= 1 ? "text-white" : "text-muted"}>Loading Behavioral Fingerprint...</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className={loadingStep >= 2 ? "text-gold" : "text-white/20"} />
                        <span className={loadingStep >= 2 ? "text-white" : "text-muted"}>Retrieving Similar Past Reviews...</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className={loadingStep >= 3 ? "text-gold" : "text-white/20"} />
                        <span className={loadingStep >= 3 ? "text-white" : "text-muted"}>Generating Context-Aware Review...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ERROR STATE */}
                {error && !isSubmitting && (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full rounded-2xl border border-red-500/20 bg-red-500/10 p-8 flex flex-col items-center justify-center text-center"
                  >
                    <div className="text-red-400 mb-2">Error!</div>
                    <div className="text-white">{error}</div>
                  </motion.div>
                )}

                {/* RESULT STATE */}
                {result && !isSubmitting && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-gold/30 bg-navy-soft p-6 sm:p-8 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 bg-gold/10 text-gold text-xs font-bold rounded-bl-xl">
                      {(result.confidence * 100).toFixed(0)}% Confidence
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted mb-2 uppercase tracking-wider">Predicted Rating</h3>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            size={28} 
                            className={star <= result.predicted_rating ? "fill-gold text-gold" : "text-white/20"} 
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mb-6 relative">
                      <div className="absolute -left-3 -top-3 text-4xl text-white/5 font-serif">"</div>
                      <p className="text-lg leading-relaxed text-white relative z-10 italic">
                        {result.review_text}
                      </p>
                    </div>

                    <div className="relative pt-6 border-t border-white/10">
                      <h3 className="text-sm font-medium text-muted mb-2 uppercase tracking-wider">Agent Reasoning</h3>
                      <p className="text-sm text-white/70">
                        {result.reasoning}
                      </p>
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>
    </motion.div>
  )
}
