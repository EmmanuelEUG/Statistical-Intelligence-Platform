// ============================================================
//  STATISTICAL INTELLIGENCE PLATFORM — main.js
//  React 18 + GSAP  |  Commit 1: Command Dashboard + Data Viewer
// ============================================================

const { useState, useEffect, useRef, useCallback } = React;

// ── GSAP ScrollTrigger ─────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);
const RAW       = window.__SIP_DATA__  || { records: [], columns: [], shape: { rows: 0, cols: 0 } };
const STATUS    = window.__SIP_STATUS__ || 'empty';
const RECORDS   = RAW.records  || [];
const COLUMNS   = RAW.columns  || [];
const SHAPE     = RAW.shape    || { rows: 0, cols: 0 };

// ── Short column labels (strip "Pxx. " prefix) ───────────────
function shortLabel(col) {
  return col.replace(/^P\d+\.\s*/, '').replace('Marca temporal', 'Timestamp');
}

// ── Infer numeric columns ────────────────────────────────────
function isNumericCol(col) {
  const sample = RECORDS.slice(0, 5).map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
  return sample.length > 0 && sample.every(v => !isNaN(Number(v)));
}

// ── Navigation config ────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'welcome', label: 'Command',  icon: '◈', commit: 1 },
  { id: 'data',    label: 'Dataset',  icon: '⊞', commit: 1 },
  { id: 'explore', label: 'Explore',  icon: '◉', commit: 2, locked: false },
  { id: 'hypo',    label: 'Hypothesis',icon:'⊿', commit: 2, locked: false },
  { id: 'report',  label: 'Report',   icon: '⋮⋮', commit: 3, locked: true },
];

// ============================================================
//  Component: TopBar
// ============================================================
function TopBar({ dataLoaded }) {
  return (
    <header className="sip-topbar">
      <div className="sip-topbar__logo">
        <div className="sip-topbar__logo-icon">
          <svg viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="url(#logoGrad)" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="5" fill="url(#logoGrad)" opacity="0.9"/>
            <line x1="14" y1="1" x2="14" y2="27" stroke="url(#logoGrad)" strokeWidth="0.8" opacity="0.4"/>
            <line x1="1" y1="14" x2="27" y2="14" stroke="url(#logoGrad)" strokeWidth="0.8" opacity="0.4"/>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c8d8f0"/>
                <stop offset="50%" stopColor="#7fb5ff"/>
                <stop offset="100%" stopColor="#a090ff"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="sip-topbar__logo-text">SIP / Statistical Intelligence Platform</span>
      </div>

      <span className="sip-topbar__subtitle">Universidad Politécnica de Chiapas · Probabilidad y Estadística 2026</span>

      <div className="sip-topbar__status">
        <div className={`sip-status-dot ${dataLoaded ? '' : 'empty'}`}/>
        <span style={{fontFamily:'DM Mono,monospace', fontSize:11}}>
          {dataLoaded ? `${SHAPE.rows} records · ${SHAPE.cols} vars` : 'AWAITING DATA'}
        </span>
      </div>
    </header>
  );
}

// ============================================================
//  Component: NavBar
// ============================================================
function NavBar({ active, onNavigate }) {
  return (
    <nav className="sip-nav">
      {NAV_ITEMS.map(item => (
        <div
          key={item.id}
          className={`sip-nav__item ${active === item.id ? 'active' : ''} ${item.locked ? 'locked' : ''}`}
          onClick={() => !item.locked && onNavigate(item.id)}
          title={item.locked ? `Available in Commit ${item.commit}` : item.label}
        >
          <span style={{fontSize:13}}>{item.icon}</span>
          {item.label}
          <span className={`sip-nav__badge ${item.id === 'welcome' || item.id === 'data' ? 'ready' : ''}`}>
            {item.locked ? `C${item.commit}` : 'LIVE'}
          </span>
        </div>
      ))}
    </nav>
  );
}

// ============================================================
//  Component: WelcomeView
// ============================================================
function WelcomeView({ onNavigate }) {
  const ref = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    // GSAP stagger entrance with delay for lens
    gsap.fromTo(
      el.querySelectorAll('.anim-fade-up'),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.5 }
    );
  }, []);

  const handleFileSelect = (e) => {
    // File uploaded - Streamlit will handle the rerun automatically
    // Just trigger a visual feedback
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
    }
  };

  const numericCols = COLUMNS.filter(isNumericCol);
  const textCols    = COLUMNS.filter(c => !isNumericCol(c));

  return (
    <div className="sip-welcome" ref={ref}>
      <div className="anim-fade-up sip-welcome__eyebrow">Executive Command Center · Commit 1</div>

      <h1 className="anim-fade-up sip-welcome__title">
        <strong>Plataforma de</strong><br/>
        Inteligencia Estadística
      </h1>

      <p className="anim-fade-up sip-welcome__desc">
        Motor de análisis estadístico para la encuesta de <em>Adopción de IA en Ingeniería</em>.
        Carga tus datos, formula hipótesis y genera reportes de nivel ejecutivo.
      </p>

      <div className="anim-fade-up sip-welcome__metrics">
        <div className="sip-metric-pill">
          <span className="sip-metric-pill__value">{SHAPE.rows || '—'}</span>
          <span className="sip-metric-pill__label">Registros</span>
        </div>
        <div className="sip-metric-pill">
          <span className="sip-metric-pill__value">{SHAPE.cols || '—'}</span>
          <span className="sip-metric-pill__label">Variables</span>
        </div>
        <div className="sip-metric-pill">
          <span className="sip-metric-pill__value">{numericCols.length || '—'}</span>
          <span className="sip-metric-pill__label">Numéricas</span>
        </div>
        <div className="sip-metric-pill">
          <span className="sip-metric-pill__value">{textCols.length || '—'}</span>
          <span className="sip-metric-pill__label">Categóricas</span>
        </div>
      </div>

      <div className="anim-fade-up" style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{display:'none'}}
        />
        <button 
          className="sip-welcome__cta" 
          onClick={() => fileInputRef.current?.click()}
          style={{flex:'1', minWidth:'200px'}}
        >
          <span>📤</span>
          Cargar CSV
          <span style={{opacity:0.5}}>↑</span>
        </button>
        <button 
          className="sip-welcome__cta" 
          onClick={() => onNavigate('data')}
          style={{flex:'1', minWidth:'200px'}}
        >
          <span>◈</span>
          Inspeccionar Dataset
          <span style={{opacity:0.5}}>→</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
//  Component: DataView
// ============================================================
function DataView() {
  const [page,     setPage]     = useState(0);
  const [search,   setSearch]   = useState('');
  const PAGE_SIZE = 10; // Reducido de 15 para menos DOM rendering

  const filtered = RECORDS.filter(row =>
    !search || COLUMNS.some(col =>
      String(row[col] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const numericCols = COLUMNS.filter(isNumericCol);
  const textCols    = COLUMNS.filter(c => !isNumericCol(c));

  // Compact columns: exclude timestamp, show up to 8 (reducido de 10)
  const visibleCols = COLUMNS.filter(c => c !== 'Marca temporal').slice(0, 8);

  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.querySelectorAll('.anim-fade-up'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out', delay: 0.4 }
    );
  }, []);

  if (!RECORDS.length) {
    return (
      <div className="sip-empty">
        <div className="sip-empty__icon">⊙</div>
        <div>No hay datos cargados. Usa el panel lateral para subir un CSV.</div>
      </div>
    );
  }

  return (
    <div className="sip-data-view" ref={ref}>

      {/* Header */}
      <div className="anim-fade-up sip-data-header">
        <div>
          <div className="sip-data-header__title">Dataset: Adopción de IA en Ingeniería</div>
          <div className="sip-data-header__sub">
            Fuente: Encuesta UP Chiapas 2026 · {filtered.length} registros filtrados
          </div>
        </div>
        <input
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '7px 14px',
            color: '#f0f4ff',
            fontSize: 12,
            fontFamily: 'DM Mono,monospace',
            outline: 'none',
            width: 220,
          }}
          placeholder="Buscar en registros…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      {/* Stat boxes */}
      <div className="anim-fade-up sip-stats-row">
        <div className="sip-stat-box accent-blue">
          <div className="sip-stat-box__value">{SHAPE.rows}</div>
          <div className="sip-stat-box__label">Total Registros</div>
        </div>
        <div className="sip-stat-box accent-green">
          <div className="sip-stat-box__value">{SHAPE.cols}</div>
          <div className="sip-stat-box__label">Variables</div>
        </div>
        <div className="sip-stat-box accent-cyan">
          <div className="sip-stat-box__value">{numericCols.length}</div>
          <div className="sip-stat-box__label">Numéricas</div>
        </div>
        <div className="sip-stat-box accent-silver">
          <div className="sip-stat-box__value">{textCols.length}</div>
          <div className="sip-stat-box__label">Categóricas</div>
        </div>
      </div>

      {/* Column index */}
      <div className="anim-fade-up sip-card">
        <div className="sip-card__header">
          <span className="sip-card__title">Índice de Variables ({COLUMNS.length})</span>
          <span className="sip-card__badge">Schema</span>
        </div>
        <div className="sip-cols-wrap">
          {COLUMNS.map(col => (
            <span key={col} className={`sip-col-pill ${isNumericCol(col) ? 'numeric' : ''}`}>
              {shortLabel(col)}
            </span>
          ))}
        </div>
      </div>

      {/* Data table */}
      <div className="anim-fade-up sip-card">
        <div className="sip-card__header">
          <span className="sip-card__title">
            Registros — página {page + 1} / {totalPages}
          </span>
          <span className="sip-card__badge">{filtered.length} filas</span>
        </div>
        <div className="sip-table-wrap">
          <table className="sip-table">
            <thead>
              <tr>
                <th>#</th>
                {visibleCols.map(col => (
                  <th key={col}>
                    <div className="sip-th-inner" title={col}>
                      {shortLabel(col)}
                      {isNumericCol(col) && <span style={{color:'#00e5a0',fontSize:9}}> ⊕</span>}
                    </div>
                  </th>
                ))}
                <th style={{color:'rgba(255,255,255,0.2)'}}>+{COLUMNS.length - visibleCols.length - 1}</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={i}>
                  <td>{page * PAGE_SIZE + i + 1}</td>
                  {visibleCols.map(col => {
                    const val = row[col];
                    const num = isNumericCol(col);
                    return (
                      <td key={col} className={num ? 'sip-td--num' : 'sip-td--str'} title={String(val ?? '')}>
                        {val !== null && val !== undefined ? String(val) : '—'}
                      </td>
                    );
                  })}
                  <td style={{color:'rgba(255,255,255,0.15)',fontSize:10}}>…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'12px 20px',
            borderTop:'1px solid rgba(255,255,255,0.06)',
            fontFamily:'DM Mono,monospace', fontSize:11,
            color:'rgba(160,170,200,0.5)',
          }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:6, padding:'5px 14px', color: page === 0 ? 'rgba(255,255,255,0.2)' : '#f0f4ff',
                cursor: page === 0 ? 'default' : 'pointer', fontSize:11,
              }}
            >← Prev</button>
            <span>
              Mostrando {page * PAGE_SIZE + 1}–{Math.min((page+1)*PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:6, padding:'5px 14px',
                color: page >= totalPages - 1 ? 'rgba(255,255,255,0.2)' : '#f0f4ff',
                cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontSize:11,
              }}
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
//  Component: PlaceholderView
// ============================================================
function PlaceholderView({ id }) {
  const info = {
    explore: { icon: '◉', title: 'Análisis Exploratorio',   sub: 'Distribuciones, correlaciones y visualizaciones avanzadas.' },
    hypo:    { icon: '⊿', title: 'Prueba de Hipótesis',     sub: 'Motor de pruebas z, t y chi² con visualizaciones cinemáticas.' },
    report:  { icon: '⋮⋮', title: 'Generador de Reportes',  sub: 'PDF ejecutivo con interpretaciones automáticas por IA.' },
  }[id] || { icon: '?', title: id, sub: '' };

  return (
    <div className="sip-placeholder">
      <div className="sip-placeholder__tag">Commit 2 · Próximamente</div>
      <div style={{fontSize:48, opacity:0.2}}>{info.icon}</div>
      <div className="sip-placeholder__title">{info.title}</div>
      <div className="sip-placeholder__sub">{info.sub}</div>
    </div>
  );
}

// ============================================================
//  Root App with Scroll-based Navigation & Three.js
// ============================================================
function App() {
  const [activeView, setActiveView] = useState('welcome');
  const [isScrolling, setIsScrolling] = useState(false);
  const contentRef = useRef(null);
  const threeSceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isVisibleRef = useRef(true);

  // Pause animations when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (document.hidden && animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!window.THREE) {
      console.warn('Three.js not loaded, skipping 3D animations');
      return;
    }
    
    if (!threeSceneRef.current) {
      // Create scene
      const scene = new THREE.Scene();
      threeSceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;

      // Create renderer - reuse existing canvas element
      const existingCanvas = document.getElementById('bg');
      const renderer = new THREE.WebGLRenderer({ 
        canvas: existingCanvas,
        alpha: true, 
        antialias: true 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;

      // Create more sophisticated Three.js scene
      const geometry1 = new THREE.TorusGeometry(1, 0.4, 16, 100);
      const material1 = new THREE.MeshBasicMaterial({
        color: 0x5b9cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      const torus = new THREE.Mesh(geometry1, material1);
      torus.position.x = -2;
      scene.add(torus);

      // Add another geometric shape
      const geometry2 = new THREE.OctahedronGeometry(0.8, 0);
      const material2 = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      const octahedron = new THREE.Mesh(geometry2, material2);
      octahedron.position.x = 2;
      scene.add(octahedron);

      // Add particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 50;
      const positions = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xa090ff,
        size: 0.02,
        transparent: true,
        opacity: 0.6
      });
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // Animation loop with reduced frequency (30fps instead of 60fps)
      let lastFrameTime = 0;
      const frameInterval = 33; // ~30fps
      
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        
        if (!isVisibleRef.current) return; // Skip rendering if tab is hidden
        
        const now = Date.now();
        if (now - lastFrameTime < frameInterval) return;
        lastFrameTime = now;
        
        const time = now * 0.001;
        
        torus.rotation.x += 0.005;
        torus.rotation.y += 0.005;
        torus.position.y = Math.sin(time) * 0.5;
        
        octahedron.rotation.x += 0.0025;
        octahedron.rotation.z += 0.004;
        octahedron.position.y = Math.cos(time * 0.7) * 0.3;
        
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;
        
        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, []);

  // GSAP ScrollTrigger animations
  useEffect(() => {
    const sections = gsap.utils.toArray('.sip-section');

    sections.forEach((section, index) => {
      gsap.set(section, { opacity: 0, y: 50 });

      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
          gsap.to(section, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
          });
        },
        onLeave: () => {
          gsap.to(section, {
            opacity: 0.3,
            y: -30,
            duration: 0.5,
            ease: 'power2.in'
          });
        },
        onEnterBack: () => {
          gsap.to(section, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
          });
        },
        onLeaveBack: () => {
          gsap.to(section, {
            opacity: 0.3,
            y: 50,
            duration: 0.5,
            ease: 'power2.in'
          });
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Scroll detection and navigation with throttling
  useEffect(() => {
    let lastScrollTime = 0;
    const scrollThrottle = 50; // ms between scroll updates

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime < scrollThrottle) return;
      lastScrollTime = now;

      if (isScrolling) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const currentSection = Math.round(scrollY / windowHeight);

      const sections = ['welcome', 'data', 'explore', 'hypo', 'report'];
      const newActiveView = sections[currentSection] || 'welcome';

      if (newActiveView !== activeView) {
        setActiveView(newActiveView);
      }

      // Only update camera position, skip geometry updates
      if (threeSceneRef.current && cameraRef.current) {
        const progress = scrollY / (document.body.scrollHeight - windowHeight);
        
        // Simple camera movement only (no geometry morphing)
        cameraRef.current.position.z = 5 - progress * 2;
        cameraRef.current.rotation.z = progress * Math.PI * 0.1;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeView, isScrolling]);

  const navigateTo = useCallback((targetId) => {
    const sections = ['welcome', 'data', 'explore', 'hypo', 'report'];
    const targetIndex = sections.indexOf(targetId);
    if (targetIndex !== -1) {
      setIsScrolling(true);
      const targetScroll = targetIndex * window.innerHeight;
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
      setTimeout(() => setIsScrolling(false), 1000);
    }
  }, []);

  const dataLoaded = RECORDS.length > 0;

  return (
    <div className="sip-app">
      {/* Ambient background */}
      <div className="sip-bg">
        <div className="sip-bg__grid"/>
        <div className="sip-bg__glow-top"/>
        <div className="sip-bg__glow-bottom"/>
        <div className="sip-bg__vignette"/>
      </div>

      <TopBar dataLoaded={dataLoaded}/>
      <NavBar active={activeView} onNavigate={navigateTo}/>

      <main className="sip-content" ref={contentRef}>
        {/* Scrollable sections */}
        <section className="sip-section" id="welcome">
          <WelcomeView onNavigate={navigateTo}/>
        </section>

        <section className="sip-section" id="data">
          <DataView/>
        </section>

        <section className="sip-section" id="explore">
          <PlaceholderView id="explore"/>
        </section>

        <section className="sip-section" id="hypo">
          <PlaceholderView id="hypo"/>
        </section>

        <section className="sip-section" id="report">
          <PlaceholderView id="report"/>
        </section>
      </main>
    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────
// ── Particles Engine ──────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts;
  const mouse = { x: -1e4, y: -1e4 };
  const N = 80;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkPt() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      c: Math.random() > 0.5 ? '91,156,246' : '0,212,255',
      a: Math.random() * 0.3 + 0.1
    };
  }

  resize();
  pts = Array.from({ length: N }, mkPt);

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('resize', resize);

  function tick() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 180) { p.vx -= dx / d * 0.03; p.vy -= dy / d * 0.03; }
      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(91,156,246,${(1 - d / 120) * 0.12})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
}

// ── Custom Cursor ─────────────────────────────────────────────
function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  let rx = 0, ry = 0, tx = 0, ty = 0;
  let isMoving = false;
  let moveTimeout;

  window.addEventListener('mousemove', e => { 
    tx = e.clientX; 
    ty = e.clientY;
    if (!isMoving) {
      isMoving = true;
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => { isMoving = false; }, 5000);
    }
  });
  
  const interactives = 'button, a, .sip-nav__item, input, select, .sip-welcome__cta';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactives)) document.body.classList.add('hovered');
    else document.body.classList.remove('hovered');
  });

  function loop() {
    if (isMoving) {
      rx += (tx - rx) * 0.15; ry += (ty - ry) * 0.15;
      dot.style.left = tx + 'px'; dot.style.top = ty + 'px';
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    }
    requestAnimationFrame(loop);
  }
  loop();
}

const container = document.getElementById('sip-root');
const root = ReactDOM.createRoot(container);
root.render(<App/>);
// Deshabilitado para optimización de memoria - canvas 2D loop muy pesado
// initParticles();
initCursor();
