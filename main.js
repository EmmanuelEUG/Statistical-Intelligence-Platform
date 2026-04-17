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
  const [isImmersive, setIsImmersive] = useState(false);
  const [screenSize, setScreenSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const sections = ['welcome', 'data', 'explore', 'hypo', 'report'];
  const networkRef = useRef(null);
  const mouse = useRef(new THREE.Vector2());

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
    camera.position.set(0, 0, 0); // Cámara en el centro del cilindro

    const raycaster = new THREE.Raycaster();

    // --- Cilindro de Paneles (Estilo Active Theory) ---
    const cylinderGroup = new THREE.Group();
    scene.add(cylinderGroup);
    networkRef.current = cylinderGroup;

    const panelCount = sections.length;
    const radius = 15;
    const panels = [];

    sections.forEach((id, i) => {
      const angle = (i / panelCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const geometry = new THREE.PlaneGeometry(8, 10);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
      });

      const panel = new THREE.Mesh(geometry, material);
      panel.position.set(x, 0, z);
      panel.lookAt(0, 0, 0);
      panel.userData = { id, index: i };
      
      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3 }));
      panel.add(line);

      cylinderGroup.add(panel);
      panels.push(panel);
    });

    const onMouseClick = () => {
      raycaster.setFromCamera(mouse.current, camera);
      const intersects = raycaster.intersectObjects(panels);
      if (intersects.length > 0) {
        const target = intersects[0].object;
        window.__targetID = target.userData.id;
        window.__isFlying = true;
      }
    };
    window.addEventListener('click', onMouseClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      if (window.__isFlying) {
        camera.position.lerp(new THREE.Vector3(0, 0, 5), 0.05); // Debería volar HACIA el panel, simplificado por ahora
        if (camera.position.length() > 5) {
          window.__isFlying = false;
          // Disparar cambio de estado en React vía evento custom o window
          window.dispatchEvent(new CustomEvent('enter-section', { detail: window.__targetID }));
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('click', onMouseClick);
      renderer.dispose();
    };
  }, [screenSize]);

  // --- Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollPercent = scrollY / (screenSize.h * (sections.length - 1));
      if (networkRef.current && !isImmersive) {
        networkRef.current.rotation.y = scrollPercent * Math.PI * 2;
      }
    };

    const handleEnter = (e) => {
      setActiveView(e.detail);
      setIsImmersive(true);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('enter-section', handleEnter);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('enter-section', handleEnter);
    };
  }, [screenSize, isImmersive]);

  // --- Sync mouse coordinates ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      const dot = document.getElementById('cursor-dot');
      const ring = document.getElementById('cursor-ring');
      if(dot) { dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; }
      if(ring) { ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px'; }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const exitSection = () => {
    setIsImmersive(false);
    // Reiniciar cámara (simplificado, se puede mejorar con animación)
    window.dispatchEvent(new CustomEvent('exit-immersive'));
  };

  return (
    <div className="sip-app" style={{ height: isImmersive ? '100vh' : `${sections.length * 100}vh`, background: 'transparent', overflow: isImmersive ? 'hidden' : 'auto' }}>
      
      {/* UI FIJA */}
      <div style={{ position: 'fixed', top: 30, left: 40, zIndex: 1000, pointerEvents: 'none' }}>
        <div style={{ color: '#00d4ff', fontSize: 10, letterSpacing: 5, fontWeight: 800 }}>SIP // IMMERSIVE OS</div>
      </div>

      {!isImmersive && (
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
      )}

      {isImmersive && (
        <button onClick={exitSection} style={{
          position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2000,
          background: 'transparent', border: '1px solid #00d4ff', color: '#00d4ff', padding: '10px 20px',
          borderRadius: 100, cursor: 'pointer', letterSpacing: 2, fontSize: 10, fontWeight: 800
        }}>
          EXIT TO CORE
        </button>
      )}

      {/* SECCIONES DINÁMICAS */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: isImmersive ? 'all' : 'none', zIndex: 10, display: isImmersive ? 'block' : 'none' }}>
        {sections.map((id) => (
          <div key={id} id={`section-${id}`} style={{
            position: 'absolute', inset: 0, display: activeView === id ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="section-inner" style={{ textAlign: 'center', width: '90%', maxWidth: 1000 }}>
              
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
