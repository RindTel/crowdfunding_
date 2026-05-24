
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ChevronRight, Users, Clock,
  Target, Shield, TrendingUp, Sparkles, Heart, Play,
} from 'lucide-react';


const STATS = [
  { end: 2.4,  suffix: 'M+', prefix: '$', label: 'Raised for dreamers', decimals: 1 },
  { end: 3200, suffix: '+',  prefix: '',  label: 'Donations made',       decimals: 0 },
  { end: 156,  suffix: '',   prefix: '',  label: 'Active campaigns',      decimals: 0 },
  { end: 1800, suffix: '+',  prefix: '',  label: 'Community members',     decimals: 0 },
];

const CAMPAIGNS = [
  {
    title: 'Eco Smart Water Purifier', category: 'Technology',
    raised: 32500, pct: 65, backers: 412, days: 18,
    accent: '#4f9cf9', accentAlpha: 'rgba(79,156,249,0.18)', accentGlow: 'rgba(79,156,249,0.14)',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=400&fit=crop&q=80',
    quote: 'Clean water for every household.',
  },
  {
    title: 'Community Urban Garden', category: 'Environment',
    raised: 18900, pct: 76, backers: 287, days: 9,
    accent: '#34d399', accentAlpha: 'rgba(52,211,153,0.18)', accentGlow: 'rgba(52,211,153,0.14)',
    img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=640&h=400&fit=crop&q=80',
    quote: 'Growing food, growing bonds.',
  },
  {
    title: 'AI Tutoring for Rural Kids', category: 'Education',
    raised: 8100, pct: 27, backers: 103, days: 34,
    accent: '#f59e0b', accentAlpha: 'rgba(245,158,11,0.18)', accentGlow: 'rgba(245,158,11,0.14)',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&h=400&fit=crop&q=80',
    quote: 'Every child deserves a future.',
  },
];

const FEATURES = [
  { icon: Target,     title: 'Campaign Builder',   desc: 'Rich story editor, reward tiers, milestone tracking, and media embedding — all in one beautifully unified workspace.' },
  { icon: Shield,     title: 'Secure & Trusted',   desc: 'End-to-end encrypted transactions with PCI-compliant payment processing. Your backers trust you — we keep them safe.' },
  { icon: TrendingUp, title: 'Live Analytics',      desc: 'Real-time donation feed, conversion tracking, and deep backer insights. Know exactly what\'s working and grow faster.' },
  { icon: Users,      title: 'Community Built-In',  desc: 'Comments, updates, anonymous donations, and social sharing baked in. Your audience, amplified.' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Campaign Creator', initials: 'SM', text: 'FundForge helped me raise $48k in 30 days. The tools feel like they were designed by someone who actually ran a campaign.' },
  { name: 'James R.', role: 'Serial Backer',    initials: 'JR', text: "I've backed 23 campaigns across platforms. The discovery experience here is genuinely unlike anything else." },
  { name: 'Priya K.', role: 'NGO Director',     initials: 'PK', text: 'We hit 200% of our goal. The community features — comments, live updates, social — made all the difference.' },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return y;
}

function Counter({ end, prefix, suffix, decimals, active }: {
  end: number; prefix: string; suffix: string; decimals: number; active: boolean;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1700;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(e * end);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, end]);

  const disp = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  return <>{prefix}{disp}{suffix}</>;
}

function CampaignCard({ c, delay }: { c: typeof CAMPAIGNS[0]; delay: number }) {
  const { ref, visible } = useInView(0.08);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [prog, setProg] = useState(false);

  useEffect(() => { if (visible) setTimeout(() => setProg(true), delay + 350); }, [visible, delay]);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    setTilt({ x: ((e.clientX - left) / width - .5) * 13, y: ((e.clientY - top) / height - .5) * -13 });
  }, []);

  return (
    <div
      ref={(el) => {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(48px)', transition: `opacity .75s ease ${delay}ms, transform .75s cubic-bezier(.23,1,.32,1) ${delay}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={onMove}
    >
      <Link to="/campaigns" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          borderRadius: 22, overflow: 'hidden',
          background: 'rgba(255,255,255,.025)',
          border: `1px solid ${hovered ? c.accent + '55' : 'rgba(255,255,255,.07)'}`,
          boxShadow: hovered ? `0 36px 90px rgba(0,0,0,.6),0 0 50px ${c.accentGlow}` : '0 4px 30px rgba(0,0,0,.35)',
          transform: hovered ? `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(-10px) scale(1.015)` : 'perspective(900px) rotateX(0) rotateY(0)',
          transition: 'all .4s cubic-bezier(.23,1,.32,1)',
        }}>
          {/* Image */}
          <div style={{ position: 'relative', height: 218, overflow: 'hidden' }}>
            <img src={c.img} alt={c.title} style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: hovered ? 'scale(1.09)' : 'scale(1)', transition: 'transform .65s ease',
            }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 35%,rgba(7,7,15,.93))' }} />
            <span style={{
              position: 'absolute', top: 13, left: 13,
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em',
              padding: '5px 12px', borderRadius: 99,
              background: c.accentAlpha, color: c.accent, border: `1px solid ${c.accent}44`,
            }}>{c.category}</span>
            <div style={{
              position: 'absolute', bottom: 13, left: 14, right: 14,
              fontSize: 12, color: 'rgba(255,255,255,.75)', fontStyle: 'italic',
              opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all .32s ease',
            }}>"{c.quote}"</div>
          </div>
          {/* Body */}
          <div style={{ padding: '20px 22px 22px' }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 14, lineHeight: 1.35 }}>{c.title}</div>
            {/* Progress bar */}
            <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginBottom: 10 }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: prog ? `${c.pct}%` : '0%',
                background: `linear-gradient(90deg,${c.accent}99,${c.accent})`,
                boxShadow: `0 0 14px ${c.accent}77`,
                transition: 'width 1.5s cubic-bezier(.23,1,.32,1)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>${c.raised.toLocaleString()}</span>
              <span style={{ color: c.accent, fontWeight: 700 }}>{c.pct}%</span>
            </div>
            {/* Hover reveal */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              fontSize: 11, color: 'rgba(255,255,255,.4)',
              overflow: 'hidden', maxHeight: hovered ? 36 : 0, opacity: hovered ? 1 : 0,
              marginTop: hovered ? 10 : 0, transition: 'max-height .3s ease,opacity .3s ease,margin-top .3s ease',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={10} /> {c.backers} backers</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {c.days} days left</span>
              <span style={{ marginLeft: 'auto', color: c.accent, fontWeight: 600 }}>Back it →</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function SectionHead({ label, title, sub }: { label: string; title: React.ReactNode; sub?: string }) {
  const { ref, visible } = useInView(0.2);
  return (
    <div ref={ref} style={{
      textAlign: 'center', marginBottom: 56,
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(38px)',
      transition: 'opacity .8s ease, transform .8s cubic-bezier(.23,1,.32,1)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#818cf8', marginBottom: 12 }}>{label}</p>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(26px,4vw,46px)', color: '#fff', lineHeight: 1.08, letterSpacing: '-.025em', marginBottom: sub ? 12 : 0 }}>{title}</h2>
      {sub && <p style={{ color: 'rgba(255,255,255,.38)', fontSize: 15, lineHeight: 1.65 }}>{sub}</p>}
    </div>
  );
}


export function LandingPage() {
  const scrollY = useScrollY();
  const { ref: statsRef, visible: statsVis } = useInView(0.3);
  const { ref: featRef,  visible: featVis  } = useInView(0.08);
  const { ref: testiRef, visible: testiVis } = useInView(0.08);
  const { ref: ctaRef,   visible: ctaVis   } = useInView(0.2);
  const navSolid = scrollY > 60;

  
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'ff-lp-hide';
   
    style.textContent = `
      .ff-public-hide { display: none !important; }
      body { background: #07070f !important; }
    `;
    document.head.appendChild(style);

   
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    header?.classList.add('ff-public-hide');
    footer?.classList.add('ff-public-hide');

    return () => {
      document.getElementById('ff-lp-hide')?.remove();
      header?.classList.remove('ff-public-hide');
      footer?.classList.remove('ff-public-hide');
    };
  }, []);

  return (
    <>
      {/*  FONTS*/}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        @keyframes ff-orb    { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(26px,-38px) scale(1.12)} }
        @keyframes ff-shimmer{ 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes ff-grad   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes ff-fadeup { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ff-pulse  { 0%{box-shadow:0 0 0 0 rgba(99,102,241,.55)} 70%{box-shadow:0 0 0 14px rgba(99,102,241,0)} 100%{box-shadow:0 0 0 0 rgba(99,102,241,0)} }
        @keyframes ff-scroll { 0%,100%{transform:translateY(0);opacity:.55} 50%{transform:translateY(9px);opacity:.15} }

        .ff-shimmer {
          background: linear-gradient(120deg,#e8e8ff 20%,#818cf8 40%,#c084fc 60%,#e8e8ff 80%);
          background-size: 300% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: ff-shimmer 5.5s linear infinite;
        }
        .ff-btn-primary {
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 28px;border-radius:16px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);background-size:200% 200%;
          border:none;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;
          cursor:pointer;text-decoration:none;
          animation:ff-grad 4s ease infinite;
          transition:transform .25s cubic-bezier(.23,1,.32,1),box-shadow .25s ease;
          position:relative;overflow:hidden;
        }
        .ff-btn-primary:hover{transform:translateY(-3px);box-shadow:0 22px 55px rgba(99,102,241,.44)}
        .ff-btn-primary:active{transform:scale(.97)}
        .ff-btn-primary::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.22),transparent 70%);opacity:0;transition:opacity .2s}
        .ff-btn-primary:hover::after{opacity:1}

        .ff-btn-ghost {
          display:inline-flex;align-items:center;gap:8px;
          padding:13px 24px;border-radius:16px;
          background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.11);
          color:rgba(255,255,255,.65);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;
          cursor:pointer;text-decoration:none;transition:all .25s ease;backdrop-filter:blur(12px);
        }
        .ff-btn-ghost:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.24);transform:translateY(-2px);color:#fff}

        .ff-feat {
          padding:28px;border-radius:22px;background:rgba(255,255,255,.02);
          border:1px solid rgba(255,255,255,.07);
          transition:transform .35s cubic-bezier(.23,1,.32,1),border-color .35s ease,box-shadow .35s ease;
          position:relative;overflow:hidden;
        }
        .ff-feat::before{content:'';position:absolute;inset:0;border-radius:22px;background:linear-gradient(135deg,rgba(99,102,241,.07),transparent);opacity:0;transition:opacity .35s ease}
        .ff-feat:hover{transform:translateY(-7px);border-color:rgba(99,102,241,.36);box-shadow:0 24px 64px rgba(0,0,0,.44),0 0 32px rgba(99,102,241,.1)}
        .ff-feat:hover::before{opacity:1}

        .ff-testi{padding:26px;border-radius:22px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);transition:transform .3s ease,border-color .3s ease}
        .ff-testi:hover{transform:translateY(-5px);border-color:rgba(255,255,255,.13)}

        .ff-nav-link{font-size:13px;color:rgba(255,255,255,.52);text-decoration:none;font-family:'DM Sans',sans-serif;transition:color .2s ease}
        .ff-nav-link:hover{color:rgba(255,255,255,.9)}
        .ff-footer-link{font-size:12px;color:rgba(255,255,255,.28);text-decoration:none;transition:color .2s ease}
        .ff-footer-link:hover{color:rgba(255,255,255,.65)}
      `}</style>

      {/*STICKY NAV */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:200,
        padding:'0 28px',height:64,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        background: navSolid ? 'rgba(7,7,15,.85)' : 'transparent',
        backdropFilter: navSolid ? 'blur(22px)' : 'none',
        borderBottom: navSolid ? '1px solid rgba(255,255,255,.06)' : 'none',
        transition:'background .35s ease,backdrop-filter .35s ease,border-bottom .35s ease',
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:9 }}>
          <div style={{
            width:34, height:34, borderRadius:10, flexShrink:0,
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 18px rgba(99,102,241,.45)',
            animation:'ff-pulse 3s ease infinite',
          }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:18, letterSpacing:'-.025em', color:'#fff' }}>
            Fund<span style={{ color:'#818cf8' }}>Forge</span>
          </span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:26 }}>
          <Link to="/campaigns" className="ff-nav-link">Explore</Link>
          <a href="#features" className="ff-nav-link">Features</a>
          <Link to="/login" className="ff-nav-link">Sign in</Link>
          <Link to="/register" className="ff-btn-primary" style={{ padding:'9px 20px', borderRadius:12, fontSize:13 }}>
            Get started →
          </Link>
        </div>
      </nav>

      {/*  HERO */}
      <section style={{
        position:'relative', overflow:'hidden', minHeight:'100vh',
        display:'flex', alignItems:'center',
        background:'linear-gradient(160deg,#06060f 0%,#0a0a1a 50%,#0d0818 100%)',
        fontFamily:"'DM Sans',sans-serif",
      }}>
        {/* Ambient orbs */}
        {([
          { w:700,h:700,t:'-18%',l:'2%',   bg:'rgba(99,102,241,1)',  d:'0s', s:'14s' },
          { w:430,h:430,t:'3%',  r:'1%',   bg:'rgba(139,92,246,1)', d:'2s', s:'17s' },
          { w:330,h:330,t:'58%', r:'3%',   bg:'rgba(59,130,246,.9)',d:'1s', s:'11s' },
          { w:300,h:300,b:'12%', l:'1%',   bg:'rgba(168,85,247,.9)',d:'3s', s:'13s' },
          { w:540,h:540,b:'3%',  l:'30%',  bg:'rgba(99,102,241,.6)',d:'.5s',s:'19s' },
        ] as any[]).map((o, i) => (
          <div key={i} style={{
            position:'absolute', borderRadius:'50%', pointerEvents:'none',
            filter:'blur(92px)', opacity:.15,
            width:o.w, height:o.h,
            top:o.t, bottom:o.b, left:o.l, right:o.r,
            background:o.bg,
            animation:`ff-orb ${o.s} ease-in-out ${o.d} infinite alternate`,
          }} />
        ))}
        {/* Grid overlay */}
        <div style={{
          position:'absolute',inset:0,pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)',
          backgroundSize:'76px 76px',
          maskImage:'radial-gradient(ellipse 80% 60% at 50% 40%,black,transparent)',
        }} />
        {/* Parallax wrapper */}
        <div style={{ transform:`translateY(${scrollY * .11}px)`, width:'100%' }}>
          <div style={{ maxWidth:960, margin:'0 auto', padding:'110px 24px 80px', textAlign:'center', position:'relative', zIndex:2 }}>

            {/* Badge */}
            <div style={{
              display:'inline-flex',alignItems:'center',gap:7,
              padding:'8px 16px',borderRadius:99,
              background:'rgba(99,102,241,.11)',border:'1px solid rgba(99,102,241,.28)',
              color:'#a5b4fc',fontSize:11,fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',
              fontFamily:"'DM Sans',sans-serif",
              animation:'ff-fadeup .7s ease .1s both',
            }}>
              <Sparkles size={11} color="#818cf8" />
              Crowdfunding, reimagined for 2025
            </div>

            {/* H1 */}
            <h1 style={{
              fontFamily:"'Syne',sans-serif",fontWeight:900,
              fontSize:'clamp(42px,7.5vw,84px)',lineHeight:1.02,letterSpacing:'-.035em',
              color:'#fff',margin:'26px auto 22px',
              animation:'ff-fadeup .85s ease .25s both',
            }}>
              Fund the ideas<br />
              <span className="ff-shimmer" style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic' }}>
                that change everything.
              </span>
            </h1>

            {/* Subtext */}
            <p style={{
              color:'rgba(255,255,255,.4)',fontSize:16,fontWeight:300,lineHeight:1.78,
              maxWidth:460,margin:'0 auto 40px',animation:'ff-fadeup .85s ease .42s both',
            }}>
              FundForge connects visionary creators with passionate supporters.
              Launch your campaign, build your community, make it real.
            </p>

            {/* CTAs */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:12,flexWrap:'wrap',animation:'ff-fadeup .85s ease .58s both' }}>
              <Link to="/register" className="ff-btn-primary">
                Start a Campaign <ArrowRight size={16} />
              </Link>
              <Link to="/campaigns" className="ff-btn-ghost">
                <Play size={13} style={{ opacity:.75 }} /> Explore Projects
              </Link>
            </div>

            {/* Scroll hint */}
            <div style={{ width:1.5,height:36,margin:'30px auto 0',background:'linear-gradient(to bottom,transparent,rgba(255,255,255,.3),transparent)',animation:'ff-scroll 2.2s ease-in-out infinite' }} />

            {/* Stats */}
            <div ref={statsRef} style={{
              display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'32px 56px',
              borderTop:'1px solid rgba(255,255,255,.06)',
              paddingTop:40,marginTop:44,
              animation:'ff-fadeup .85s ease .72s both',
            }}>
              {STATS.map((s, i) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:900,color:'#fff',letterSpacing:'-.02em' }}>
                    <Counter {...s} active={statsVis} />
                  </div>
                  <div style={{ fontSize:12,color:'rgba(255,255,255,.36)',marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:130,background:'linear-gradient(to bottom,transparent,#07070f)',pointerEvents:'none' }} />
      </section>

      {/* CAMPAIGNS */}
      <section style={{ background:'#07070f',padding:'100px 24px',fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ maxWidth:960,margin:'0 auto' }}>
          <SectionHead label="Featured Campaigns" title="Projects making real impact" sub="Discover campaigns changing lives — one donation at a time." />
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20 }}>
            {CAMPAIGNS.map((c, i) => <CampaignCard key={c.title} c={c} delay={i * 140} />)}
          </div>
          <div style={{ textAlign:'center',marginTop:40 }}>
            <Link to="/campaigns" className="ff-btn-ghost" style={{ fontSize:13 }}>
              View all campaigns <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/*  FEATURES */}
      <section id="features" style={{ background:'linear-gradient(180deg,#07070f 0%,#0c0c1e 100%)',padding:'100px 24px',position:'relative',overflow:'hidden',fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ position:'absolute',top:'35%',left:'50%',transform:'translateX(-50%)',width:780,height:380,background:'radial-gradient(ellipse,rgba(99,102,241,.07),transparent 70%)',pointerEvents:'none' }} />
        <div style={{ maxWidth:960,margin:'0 auto',position:'relative',zIndex:1 }}>
          <SectionHead label="Why FundForge" title="Everything you need to succeed" sub="Built for serious creators and committed backers." />
          <div ref={featRef} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16 }}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="ff-feat" style={{ opacity:featVis?1:0, transform:featVis?'translateY(0)':'translateY(36px)', transition:`opacity .75s ease ${i*110}ms,transform .75s cubic-bezier(.23,1,.32,1) ${i*110}ms` }}>
                <div style={{ width:46,height:46,borderRadius:13,marginBottom:20,background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.22)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Icon size={18} color="#818cf8" />
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:'#fff',marginBottom:9 }}>{title}</div>
                <p style={{ fontSize:13,color:'rgba(255,255,255,.38)',lineHeight:1.75,margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS  */}
      <section style={{ background:'#07070f',padding:'100px 24px',fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ maxWidth:960,margin:'0 auto' }}>
          <SectionHead label="Voices" title="Trusted by thousands" sub="Real stories from creators and backers who made it happen." />
          <div ref={testiRef} style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="ff-testi" style={{ opacity:testiVis?1:0, transform:testiVis?'translateY(0)':'translateY(36px)', transition:`opacity .75s ease ${i*110}ms,transform .75s cubic-bezier(.23,1,.32,1) ${i*110}ms` }}>
                <div style={{ display:'flex',gap:3,marginBottom:14 }}>
                  {Array.from({length:5}).map((_,k)=>(
                    <svg key={k} width="12" height="12" viewBox="0 0 12 12"><path d="M6 0l1.5 3.5H11L8.5 5.8l1 3.7L6 7.5l-3.5 2 1-3.7L1 3.5h3.5L6 0z" fill="#f59e0b"/></svg>
                  ))}
                </div>
                <p style={{ fontSize:13,color:'rgba(255,255,255,.55)',lineHeight:1.75,fontStyle:'italic',marginBottom:20 }}>"{t.text}"</p>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff' }}>{t.initials}</div>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:'#fff' }}>{t.name}</div>
                    <div style={{ fontSize:11,color:'rgba(255,255,255,.35)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  CTA  */}
      <section style={{ background:'linear-gradient(160deg,#080816,#0d0820,#080816)',padding:'120px 24px',textAlign:'center',position:'relative',overflow:'hidden',fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:900,height:440,background:'radial-gradient(ellipse,rgba(99,102,241,.18),rgba(139,92,246,.08) 40%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',backgroundImage:'linear-gradient(rgba(255,255,255,.024) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.024) 1px,transparent 1px)',backgroundSize:'56px 56px' }} />
        <div ref={ctaRef} style={{ maxWidth:640,margin:'0 auto',position:'relative',zIndex:1,opacity:ctaVis?1:0,transform:ctaVis?'translateY(0)':'translateY(50px)',transition:'opacity .85s ease,transform .85s cubic-bezier(.23,1,.32,1)' }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:7,color:'#818cf8',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:18 }}>
            <Heart size={13} color="#818cf8" /> Join the movement
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:'clamp(32px,5.5vw,60px)',color:'#fff',lineHeight:1.06,letterSpacing:'-.03em',marginBottom:18 }}>
            Ready to launch<br />
            <span className="ff-shimmer" style={{ fontFamily:"'Instrument Serif',serif",fontStyle:'italic' }}>your big idea?</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,.4)',fontSize:15,lineHeight:1.72,marginBottom:42 }}>
            Join 1,800+ creators who've brought their projects to life with FundForge.<br />
            It's free to start — your campaign could be next.
          </p>
          <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
            <Link to="/register" className="ff-btn-primary" style={{ padding:'15px 32px',fontSize:15 }}>
              Create your free account <ArrowRight size={16} />
            </Link>
            <Link to="/campaigns" className="ff-btn-ghost">
              Browse campaigns <ChevronRight size={14} />
            </Link>
          </div>
          <p style={{ marginTop:22,fontSize:12,color:'rgba(255,255,255,.2)' }}>
            No credit card required · Free forever for backers
          </p>
        </div>
      </section>

      {/*  FOOTER */}
      <footer style={{ background:'#05050e',borderTop:'1px solid rgba(255,255,255,.05)',padding:'32px 28px',fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ maxWidth:960,margin:'0 auto',display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:16 }}>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:17,color:'#fff',letterSpacing:'-.02em' }}>
            Fund<span style={{ color:'#818cf8' }}>Forge</span>
          </span>
          <div style={{ display:'flex',gap:22 }}>
            {['Privacy','Terms','Contact','Blog'].map(l=>(
              <Link key={l} to="/" className="ff-footer-link">{l}</Link>
            ))}
          </div>
          <p style={{ fontSize:12,color:'rgba(255,255,255,.2)',margin:0 }}>
            © {new Date().getFullYear()} FundForge. Built for changemakers.
          </p>
        </div>
      </footer>
    </>
  );
}