const { useState, useEffect, useRef } = React;

const RAW = window.__SIP_DATA__ || { records: [], columns: [], shape: { rows: 0, cols: 0 } };
const RECORDS = RAW.records || [];
const COLUMNS = RAW.columns || [];

function shortLabel(col) {
  return col.replace(/^P\d+\.\s*/, '').replace('Marca temporal', 'Timestamp');
}

const NAV_ITEMS = [
  { id: 'welcome', label: 'Command',  icon: '◈' },
  { id: 'data',    label: 'Dataset',  icon: '⊞' },
  { id: 'explore', label: 'Explore',  icon: '◉' },
  { id: 'hypo',    label: 'Hypothesis',icon:'⊿' },
  { id: 'report',  label: 'Report',   icon: '⋮⋮' },
];

function App() {
  const [activeView, setActiveView] = useState('welcome');
  const [screenSize, setScreenSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const sections = ['welcome', 'data', 'explore', 'hypo', 'report'];
  const networkRef = useRef(null);

  // --- Actualizar tamaño dinámicamente ---
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Three.js Engine (Active Theory Style) ---
  useEffect(() => {
    if (!window.THREE) return;
    const canvas = document.getElementById('bg');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(screenSize.w, screenSize.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, screenSize.w / screenSize.h, 0.1, 100);
    camera.position.z = 15;

    const group = new THREE.Group();
    scene.add(group);
    networkRef.current = group;

    // Plexus Grid
    const count = 400;
    const geometry = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) pos[i] = (Math.random() - 0.5) * 40;
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ 
      size: 0.1, color: 0x00d4ff, transparent: true, opacity: 0.8 
    }));
    group.add(points);

    // Conexiones
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.1 });
    const lineGeo = new THREE.BufferGeometry();
    const linePos = [];
    for(let i=0; i<100; i++) {
        const i3 = Math.floor(Math.random() * count) * 3;
        const j3 = Math.floor(Math.random() * count) * 3;
        linePos.push(pos[i3], pos[i3+1], pos[i3+2], pos[j3], pos[j3+1], pos[j3+2]);
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    const animate = () => {
      requestAnimationFrame(animate);
      group.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    return () => renderer.dispose();
  }, [screenSize]);

  // --- Scroll & Snap Logic ---
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const vh = screenSize.h;
      const scrollPercent = scrollY / (vh * (sections.length - 1));

      // Reacción de la Red 3D
      if (networkRef.current) {
        networkRef.current.position.z = scrollPercent * 10;
        networkRef.current.rotation.x = scrollPercent * Math.PI * 0.5;
      }

      sections.forEach((id, index) => {
        const el = document.getElementById(`section-${id}`);
        if (!el) return;
        const start = index * vh;
        const progress = (scrollY - start) / vh;
        
        // Efectos de transición suaves
        if (Math.abs(progress) < 1) {
          const opacity = 1 - Math.abs(progress);
          el.style.opacity = opacity;
          el.style.transform = `scale(${1 - Math.abs(progress) * 0.1}) translateY(${progress * 20}px)`;
          if (opacity > 0.6) setActiveView(id);
        } else {
          el.style.opacity = 0;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [screenSize]);

  const scrollTo = (index) => {
    window.scrollTo({ top: index * screenSize.h, behavior: 'smooth' });
  };

  return (
    <div className="sip-app" style={{ height: `${sections.length * 100}vh`, background: 'transparent' }}>
      
      {/* UI FIJA */}
      <div style={{ position: 'fixed', top: 30, left: 40, zIndex: 1000, pointerEvents: 'none' }}>
        <div style={{ color: '#00d4ff', fontSize: 10, letterSpacing: 5, fontWeight: 800 }}>SIP // IMMERSIVE OS</div>
      </div>

      <nav style={{ position: 'fixed', right: 40, top: '50%', transform: 'translateY(-50%)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 15 }}>
        {sections.map((id, i) => (
          <div key={id} onClick={() => scrollTo(i)} style={{ 
            width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
            background: activeView === id ? '#00d4ff' : 'rgba(255,255,255,0.2)',
            boxShadow: activeView === id ? '0 0 15px #00d4ff' : 'none',
            transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
          }} />
        ))}
      </nav>

      {/* SECCIONES DINÁMICAS */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        {sections.map((id, i) => (
          <div key={id} id={`section-${id}`} style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: i === 0 ? 1 : 0, transition: 'opacity 0.1s linear'
          }}>
            <div className="section-inner" style={{ textAlign: 'center', pointerEvents: 'all', width: '90%', maxWidth: 1000 }}>
              
              {id === 'welcome' && (
                <>
                  <h1 style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.04em' }}>SIP PLATFORM</h1>
                  <p style={{ color: '#00d4ff', letterSpacing: 15, fontSize: 12, marginTop: 10 }}>INTELLIGENCE CORE</p>
                </>
              )}

              {id === 'data' && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: 30, borderRadius: 24, backdropFilter: 'blur(30px)' }}>
                  <h2 style={{ color: 'white', marginBottom: 20, letterSpacing: 5 }}>DATASET EXPLORER</h2>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'DM Mono' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: 10, textAlign: 'left' }}>VAR</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>VALUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RECORDS.slice(0, 5).map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: 10 }}>{shortLabel(COLUMNS[idx] || '')}</td>
                          <td style={{ padding: 10, color: 'white' }}>{String(r[COLUMNS[idx]] || '')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {['explore', 'hypo', 'report'].includes(id) && (
                <div style={{ opacity: 0.4, letterSpacing: 10, fontSize: 24, color: 'white' }}>{id.toUpperCase()}</div>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* CURSOR */}
      <div id="cursor-dot" style={{ position: 'fixed', width: 6, height: 6, background: '#fff', borderRadius: '50%', pointerEvents: 'none', zIndex: 5000 }}></div>
      <div id="cursor-ring" style={{ position: 'fixed', width: 30, height: 30, border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', pointerEvents: 'none', zIndex: 4999, transform: 'translate(-50%, -50%)', transition: 'width 0.3s' }}></div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('sip-root'));
root.render(<App />);

window.addEventListener('mousemove', e => {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if(dot) { dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; }
  if(ring) { ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px'; }
});
// Sync refresh
