import { useEffect, useMemo, useState } from 'react'
import { NavLink, Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { buildWhatsAppLink, buildOrderMessage, buildCustomOrderMessage } from './lib/whatsapp'

// ---- hooks ----
export function useAuth() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return { session, loading: session === undefined, isLoggedIn: !!session }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(null)
  useEffect(() => {
    let active = true
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (active) setSettings(data)
    })
    return () => { active = false }
  }, [])
  return settings
}

// ---- shared components ----
export function Monogram({ className = 'w-9 h-9', light = false }) {
  const stroke = light ? '#FAF3E7' : '#7A1F2B'
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" stroke={stroke} strokeWidth="1" />
      <text x="20" y="27" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="19" fill={stroke}>D</text>
    </svg>
  )
}

const PALETTES = [
  ['#7A1F2B', '#3D0F16'],
  ['#241016', '#7A1F2B'],
  ['#C9A24B', '#7A1F2B'],
  ['#3D0F16', '#C9A24B'],
]
function hashToIndex(str, len) {
  let h = 0
  for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h % len
}

export function PlaceholderArt({ label = 'Duchess', className = '' }) {
  const [from, to] = PALETTES[hashToIndex(label, PALETTES.length)]
  const initial = (label || 'D').trim().charAt(0).toUpperCase()
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <span className="font-display text-cream/25 select-none" style={{ fontSize: '4rem' }}>{initial}</span>
      <span className="absolute bottom-2 right-2 text-[10px] tracking-wide text-cream/50 font-body">Photo coming soon</span>
    </div>
  )
}

export function ProductCard({ product, selected, qty, onToggle, onQtyChange }) {
  const unavailable = product.is_available === false
  return (
    <div className={`group border border-gold/25 bg-white/40 ${unavailable ? 'opacity-50' : ''}`}>
      <div className="aspect-[4/3]">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <PlaceholderArt label={product.name} className="w-full h-full" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-snug text-ink">{product.name}</h3>
          <span className="font-body text-sm text-burgundy whitespace-nowrap pt-0.5">
            {product.price ? `₦${Number(product.price).toLocaleString()}` : 'Price on request'}
          </span>
        </div>
        {product.description && <p className="text-sm text-charcoal/70 mt-1.5 leading-relaxed">{product.description}</p>}
        {unavailable ? (
          <p className="mt-3 text-xs uppercase tracking-wide text-charcoal/50">Currently unavailable</p>
        ) : onToggle ? (
          <div className="mt-3 flex items-center gap-3">
            <button onClick={() => onToggle(product)} className={`text-sm px-3 py-1.5 border transition ${selected ? 'bg-burgundy text-cream border-burgundy' : 'border-charcoal/30 text-charcoal hover:border-burgundy'}`}>
              {selected ? 'Added' : 'Add to order'}
            </button>
            {selected && (
              <input type="number" min="1" value={qty} onChange={(e) => onQtyChange(product, Math.max(1, Number(e.target.value)))} className="w-14 border border-charcoal/20 px-2 py-1 text-sm text-center" aria-label={`Quantity for ${product.name}`} />
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/custom-orders', label: 'Custom Orders' },
  { to: '/locations', label: 'Locations' },
  { to: '/about', label: 'About' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-gold/30">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Monogram className="w-8 h-8" />
          <span className="font-display text-lg tracking-tight text-ink">Duchess</span>
        </NavLink>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `text-sm font-body transition-colors ${isActive ? 'text-burgundy' : 'text-charcoal/80 hover:text-burgundy'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="md:hidden p-2 -mr-2" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
          <div className="w-6 h-[1.5px] bg-ink mb-1.5" />
          <div className="w-6 h-[1.5px] bg-ink mb-1.5" />
          <div className="w-4 h-[1.5px] bg-ink" />
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-gold/30 bg-cream px-5 py-3 flex flex-col gap-1">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={({ isActive }) => `py-2.5 text-base ${isActive ? 'text-burgundy' : 'text-charcoal/85'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="bg-ink text-cream mt-24">
      <div className="max-w-6xl mx-auto px-5 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Monogram className="w-8 h-8" light />
            <span className="font-display text-lg">Duchess</span>
          </div>
          <p className="text-cream/60 text-sm max-w-xs leading-relaxed">
            Shawarma, pizza, cakes, pastries & custom celebration orders. Unofficial concept site — not yet affiliated with the business.
          </p>
        </div>
        <div>
          <p className="text-gold text-sm mb-3 font-display">Explore</p>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/menu" className="hover:text-cream">Menu</Link></li>
            <li><Link to="/custom-orders" className="hover:text-cream">Custom Orders</Link></li>
            <li><Link to="/locations" className="hover:text-cream">Locations</Link></li>
            <li><Link to="/about" className="hover:text-cream">About</Link></li>
            <li><Link to="/admin" className="hover:text-cream">Admin</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-gold text-sm mb-3 font-display">Built by</p>
          <p className="text-sm text-cream/70">
            BuildWithSawdah<br />
            <a href="https://instagram.com/BuildWithSawdah" className="hover:text-cream underline underline-offset-2">@BuildWithSawdah</a>
            <br />tirmidhysawdah@gmail.com
          </p>
        </div>
      </div>
      <div className="hairline opacity-30" />
      <p className="text-center text-xs text-cream/40 py-5">© {new Date().getFullYear()} Duchess concept site — demo build, all product data subject to confirmation.</p>
    </footer>
  )
}

export function WhatsAppFab() {
  const settings = useSiteSettings()
  return (
    <a href={buildWhatsAppLink(settings?.whatsapp_number, 'Hello Duchess, I would like to place an order.')} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-40 bg-burgundy text-cream px-5 py-3 rounded-full shadow-lg font-body text-sm font-medium flex items-center gap-2 hover:brightness-110 transition" aria-label="Order on WhatsApp">
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.86 9.86 0 0 0 12.04 2zm5.8 14.17c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.65-.6-2.9-1.25-4.79-4.15-4.94-4.35-.14-.2-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.26-.29.58-.36.77-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.56.16.28.71 1.17 1.53 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.28.37-.23.62-.14.26.09 1.64.77 1.92.91.28.14.47.21.53.33.07.12.07.68-.17 1.36z" />
      </svg>
      Order on WhatsApp
    </a>
  )
}

// ---- public pages ----
export function Home() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [branches, setBranches] = useState([])
  const settings = useSiteSettings()

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []))
    supabase.from('products').select('*').eq('is_featured', true).eq('is_available', true).limit(4).then(({ data }) => setFeatured(data || []))
    supabase.from('branches').select('*').limit(3).then(({ data }) => setBranches(data || []))
  }, [])

  const waLink = buildWhatsAppLink(settings?.whatsapp_number, 'Hello Duchess, I would like to place an order.')

  return (
    <div>
      <section className="bg-ink text-cream">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-sm tracking-wide mb-4">Shawarma · Pizza · Cakes · Pastries</p>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-6">A little indulgence, freshly made.</h1>
            <p className="text-cream/70 text-base md:text-lg leading-relaxed max-w-md mb-8">From loaded shawarma to celebration cakes — Duchess brings it fresh, and straight to your WhatsApp order.</p>
            <div className="flex flex-wrap gap-4">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-burgundy px-7 py-3.5 text-sm font-medium hover:brightness-110 transition">Order on WhatsApp</a>
              <Link to="/menu" className="border border-gold/50 px-7 py-3.5 text-sm font-medium hover:border-gold transition">View Menu</Link>
            </div>
          </div>
          <div className="aspect-[4/3]"><PlaceholderArt label="Duchess Hero" className="w-full h-full" /></div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="font-display text-2xl md:text-3xl text-ink mb-8">What we're known for</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c) => (
              <Link key={c.id} to="/menu" className="aspect-square relative flex items-end p-4 group overflow-hidden">
                <PlaceholderArt label={c.name} className="absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                <span className="relative text-cream font-display text-lg">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="bg-blush/40 py-16">
          <div className="max-w-6xl mx-auto px-5">
            <h2 className="font-display text-2xl md:text-3xl text-ink mb-8">Fan favourites</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
              {featured.map((p) => (
                <div key={p.id} className="bg-white/60">
                  <div className="aspect-square"><PlaceholderArt label={p.name} className="w-full h-full" /></div>
                  <div className="p-3">
                    <p className="font-display text-base text-ink">{p.name}</p>
                    <p className="text-xs text-burgundy mt-1">{p.price ? `₦${Number(p.price).toLocaleString()}` : 'Price on request'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/3] order-2 md:order-1"><PlaceholderArt label="Custom Cake" className="w-full h-full" /></div>
        <div className="order-1 md:order-2">
          <p className="text-burgundy text-sm tracking-wide mb-3">Celebrations</p>
          <h2 className="font-display text-3xl md:text-4xl text-ink mb-5">Make it a Duchess moment.</h2>
          <p className="text-charcoal/70 leading-relaxed mb-7 max-w-md">Birthdays, proposals, small get-togethers — tell us what you're celebrating and we'll put it together.</p>
          <Link to="/custom-orders" className="inline-block bg-ink text-cream px-7 py-3.5 text-sm font-medium hover:bg-charcoal transition">Start a custom order</Link>
        </div>
      </section>

      {branches.length > 0 && (
        <section className="bg-ink text-cream py-16">
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl">Find us</h2>
              <Link to="/locations" className="text-gold text-sm hover:underline">All locations</Link>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {branches.map((b) => (
                <div key={b.id} className="border border-cream/15 p-5">
                  <p className="font-display text-lg mb-1">{b.name}</p>
                  <p className="text-cream/60 text-sm">{b.address || '[Address to be confirmed]'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-5 py-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-ink mb-5">Hungry already?</h2>
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-burgundy text-cream px-9 py-4 text-sm font-medium hover:brightness-110 transition">Order on WhatsApp</a>
      </section>
    </div>
  )
}

export function Menu() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [order, setOrder] = useState({})
  const [branchId, setBranchId] = useState('')
  const settings = useSiteSettings()

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []))
    supabase.from('products').select('*').order('created_at').then(({ data }) => setProducts(data || []))
    supabase.from('branches').select('*').then(({ data }) => setBranches(data || []))
  }, [])

  const filtered = useMemo(() => (activeCategory === 'all' ? products : products.filter((p) => p.category_id === activeCategory)), [products, activeCategory])

  const orderItems = useMemo(() => Object.entries(order).filter(([, qty]) => qty > 0).map(([id, qty]) => {
    const product = products.find((p) => p.id === id)
    return product ? { name: product.name, qty } : null
  }).filter(Boolean), [order, products])

  function toggle(product) {
    setOrder((prev) => {
      const next = { ...prev }
      if (next[product.id]) delete next[product.id]
      else next[product.id] = 1
      return next
    })
  }
  function setQty(product, qty) {
    setOrder((prev) => ({ ...prev, [product.id]: qty }))
  }

  const branchName = branches.find((b) => b.id === branchId)?.name
  const waLink = buildWhatsAppLink(settings?.whatsapp_number, buildOrderMessage({ items: orderItems, branchName }))

  return (
    <div className="max-w-6xl mx-auto px-5 py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-2">Menu</h1>
      <p className="text-charcoal/60 mb-8">Browse, select what you want, and send it straight to WhatsApp.</p>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 -mx-5 px-5 md:mx-0 md:px-0">
        <button onClick={() => setActiveCategory('all')} className={`shrink-0 px-4 py-2 text-sm border ${activeCategory === 'all' ? 'bg-ink text-cream border-ink' : 'border-charcoal/20'}`}>All</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`shrink-0 px-4 py-2 text-sm border ${activeCategory === c.id ? 'bg-ink text-cream border-ink' : 'border-charcoal/20'}`}>{c.name}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-28">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} selected={!!order[p.id]} qty={order[p.id] || 1} onToggle={toggle} onQtyChange={setQty} />
        ))}
        {filtered.length === 0 && <p className="text-charcoal/50 col-span-full py-10 text-center">No products in this category yet.</p>}
      </div>

      {orderItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-ink text-cream border-t border-gold/30">
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="text-sm flex-1 min-w-0">
              <span className="text-gold">{orderItems.length} item{orderItems.length > 1 ? 's' : ''} selected</span>
              <span className="text-cream/50"> — {orderItems.map((i) => `${i.qty}× ${i.name}`).join(', ')}</span>
            </div>
            {branches.length > 0 && (
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="bg-transparent border border-cream/30 px-3 py-2 text-sm">
                <option value="" className="text-ink">Select branch</option>
                {branches.map((b) => <option key={b.id} value={b.id} className="text-ink">{b.name}</option>)}
              </select>
            )}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-burgundy px-6 py-2.5 text-sm font-medium text-center hover:brightness-110 transition">Order via WhatsApp</a>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm text-charcoal/70 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export function CustomOrders() {
  const [form, setForm] = useState({ name: '', phone: '', type: '', date: '', location: '', details: '' })
  const settings = useSiteSettings()
  function update(field, value) { setForm((f) => ({ ...f, [field]: value })) }
  const ready = form.name && form.phone && form.type
  const waLink = buildWhatsAppLink(settings?.whatsapp_number, buildCustomOrderMessage(form))

  return (
    <div>
      <section className="bg-ink text-cream">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-sm tracking-wide mb-4">Celebrations & custom pieces</p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight mb-5">Make it a Duchess moment.</h1>
            <p className="text-cream/70 leading-relaxed max-w-md">Custom 
