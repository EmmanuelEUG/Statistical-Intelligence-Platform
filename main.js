// ============================================================
//  STATISTICAL INTELLIGENCE PLATFORM — main.js
//  React 18 + GSAP  |  Commit 1: Command Dashboard + Data Viewer
// ============================================================

const { useState, useEffect, useRef, useCallback } = React;

// ── Data bridge ──────────────────────────────────────────────
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
  { id: 'explore', label: 'Explore',  icon: '◉', commit: 2, locked: true },
  { id: 'hypo',    label: 'Hypothesis',icon:'⊿', commit: 2, locked: true },
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

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    // GSAP stagger entrance
    gsap.fromTo(
      el.querySelectorAll('.anim-fade-up'),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.15 }
    );
  }, []);

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

      <div className="anim-fade-up">
        <button className="sip-welcome__cta" onClick={() => onNavigate('data')}>
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
  const PAGE_SIZE = 15;

  const filtered = RECORDS.filter(row =>
    !search || COLUMNS.some(col =>
      String(row[col] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const numericCols = COLUMNS.filter(isNumericCol);
  const textCols    = COLUMNS.filter(c => !isNumericCol(c));

  // Compact columns: exclude timestamp, show up to 10
  const visibleCols = COLUMNS.filter(c => c !== 'Marca temporal').slice(0, 10);

  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.querySelectorAll('.anim-fade-up'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out' }
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
//  Root App with Lens-Reveal navigation
// ============================================================
function App() {
  const [activeView,   setActiveView]   = useState('welcome');
  const [pendingView,  setPendingView]  = useState(null);
  const [isRevealing,  setIsRevealing]  = useState(false);
  const lensRef = useRef(null);

  // Lens-reveal transition
  const navigateTo = useCallback((targetId) => {
    if (targetId === activeView || isRevealing) return;
    setIsRevealing(true);
    setPendingView(targetId);
    // GSAP circular mask expand
    if (lensRef.current) {
      gsap.fromTo(lensRef.current,
        { clipPath: 'circle(0% at 50% 50%)', opacity: 1 },
        {
          clipPath: 'circle(150% at 50% 50%)',
          opacity: 1,
          duration: 0.65,
          ease: 'back.out(1.4)',
          onComplete: () => {
            setActiveView(targetId);
            setPendingView(null);
            setIsRevealing(false);
            gsap.set(lensRef.current, { clipPath: 'none' });
          }
        }
      );
    } else {
      setActiveView(targetId);
      setPendingView(null);
      setIsRevealing(false);
    }
  }, [activeView, isRevealing]);

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

      <main className="sip-content">
        {/* Lens overlay for transition */}
        <div
          ref={lensRef}
          style={{
            position:'absolute', inset:0, zIndex:10,
            background:'rgba(0,0,0,0.96)',
            pointerEvents: isRevealing ? 'all' : 'none',
            opacity: isRevealing ? 1 : 0,
            clipPath: 'circle(0% at 50% 50%)',
          }}
        />

        {/* Views */}
        <div className={`sip-view ${activeView === 'welcome' ? 'active' : ''}`}>
          <WelcomeView onNavigate={navigateTo}/>
        </div>

        <div className={`sip-view ${activeView === 'data' ? 'active' : ''}`}>
          <DataView/>
        </div>

        {['explore','hypo','report'].map(id => (
          <div key={id} className={`sip-view ${activeView === id ? 'active' : ''}`}>
            <PlaceholderView id={id}/>
          </div>
        ))}
      </main>
    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────
const container = document.getElementById('sip-root');
const root = ReactDOM.createRoot(container);
root.render(<App/>);
