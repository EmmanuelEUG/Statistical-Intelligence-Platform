# Statistical Intelligence Platform (SIP)
### Commit 1 — Executive Command Dashboard + Data Viewer

> A modular, full-stack statistical analysis platform built with **Python/Streamlit** (backend) and **React + GSAP** (frontend), bridged via a JSON data tunnel injected at render time.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PYTHON / STREAMLIT                       │
│  app.py                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │ st.file_     │→  │  pandas      │→  │ JSON bridge    │  │
│  │ uploader()   │   │  DataFrame   │   │ __SIP_DATA__   │  │
│  └──────────────┘   └──────────────┘   └────────┬───────┘  │
│                                                  │          │
│  st.components.v1.html( index.html + data )      │          │
└──────────────────────────────────────────────────┼──────────┘
                                                   │ injected
┌──────────────────────────────────────────────────▼──────────┐
│                  REACT SPA (Browser)                        │
│  index.html  ←  style.css  ←  main.js                      │
│                                                             │
│  window.__SIP_DATA__   →  React state  →  UI components    │
│  window.__SIP_STATUS__ →  TopBar badge                      │
│                                                             │
│  GSAP: Circular Lens Reveal on route transitions            │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
statistical_intelligence/
│
├── app.py          # Streamlit backend — data engine & HTML injector
├── index.html      # SPA shell — CDN imports + injection anchors
├── style.css       # Executive Command Center visual system
├── main.js         # React components + GSAP animations
│
├── data/
│   └── encuesta_ia.csv   # Default dataset (44 records · 21 variables)
│
└── README.md
```

---

## Data Bridge: How Python Talks to React

The bridge is a **JSON string injection** pattern — zero HTTP, zero WebSockets:

```python
# app.py
data_json = json.dumps(df.to_dict(orient="records"), ...)

html_final = html_template
    .replace("/* __DATA_BRIDGE__ */", f"window.__SIP_DATA__ = {data_json};")
    .replace("/* __JS_INJECT__ */", js_content)

st.components.v1.html(html_final, height=900)
```

```js
// main.js (React)
const RECORDS = window.__SIP_DATA__.records;  // available instantly
```

**Why this approach?**
- No API server needed — Streamlit is the only process
- Data is serialized once on the Python side, typed correctly
- React reads it from `window` before first render — no async waterfall
- Works inside Streamlit's sandboxed `<iframe>` environment

---

## Circular Lens Reveal (GSAP)

Navigation transitions use a `clip-path: circle()` mask that expands from the screen center with an elastic overshoot:

```js
gsap.fromTo(lensRef.current,
  { clipPath: 'circle(0% at 50% 50%)' },
  { clipPath: 'circle(150% at 50% 50%)', ease: 'back.out(1.4)', duration: 0.65 }
);
```

This creates a cinematic "portal open" feel without any image-based masking.

---

## Running Locally

```bash
# 1. Install dependencies
pip install streamlit pandas

# 2. Place your CSV in data/encuesta_ia.csv
#    (or upload via the sidebar at runtime)

# 3. Launch
streamlit run app.py
```

---

## Commit Roadmap

| Commit | Features |
|--------|----------|
| **1** ✅ | Architecture, data bridge, Command screen, Data viewer, Lens reveal |
| 2 | Exploratory analysis, distribution charts (Plotly), column inspector |
| 3 | Hypothesis testing engine (z/t/chi²), p-value visualizer |
| 4 | AI-powered report generator (PDF export) |

---

## Dataset

**Encuesta: Adopción de IA en Ingeniería** — UP Chiapas, 2026

| Property | Value |
|----------|-------|
| Records  | 44    |
| Variables | 21   |
| Numeric cols | P03, P08, P12, P14, P16, P19, P20 |
| Categorical cols | 14 (Likert scales, multi-select, nominal) |

---

*Emmanuel Urbina Guerrero · Ingeniería en Tecnologías de la Información e Innovación Digital · UP Chiapas 2026*
