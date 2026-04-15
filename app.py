"""
Statistical Intelligence Platform — Commit 1
Backend: Python/Streamlit — Data Engine & Bridge
"""

import streamlit as st
import pandas as pd
import json
import os

st.set_page_config(
    page_title="Statistical Intelligence Platform",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Hide Streamlit chrome ──────────────────────────────────────────────────────
st.markdown("""
<style>
    #MainMenu, header, footer { visibility: hidden; }
    .stApp { background: #000; }
    .block-container { padding: 0 !important; max-width: 100% !important; }
</style>
""", unsafe_allow_html=True)

# ── Data loading ───────────────────────────────────────────────────────────────
DEFAULT_CSV = os.path.join(
    os.path.dirname(__file__),
    "data",
    "Encuesta_ Adopción de IA en Ingeniería (respuestas) - Respuestas de formulario 1.csv",
)

def load_dataframe(uploaded_file=None) -> pd.DataFrame | None:
    try:
        if uploaded_file is not None:
            return pd.read_csv(uploaded_file)
        if os.path.exists(DEFAULT_CSV):
            return pd.read_csv(DEFAULT_CSV)
    except Exception as e:
        st.error(f"Error reading file: {e}")
    return None

def serialize_for_frontend(df: pd.DataFrame) -> str:
    """Serialize DataFrame to a JSON string safe for JS injection."""
    payload = {
        "records": df.to_dict(orient="records"),
        "columns": list(df.columns),
        "shape": {"rows": len(df), "cols": len(df.columns)},
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
    }
    return json.dumps(payload, ensure_ascii=False, default=str)

# ── Sidebar uploader ───────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### 📁 Data Source")
    uploaded = st.file_uploader(
        "Upload CSV",
        type=["csv"],
        help="Upload a survey CSV. Default dataset loads automatically.",
    )

df = load_dataframe(uploaded)

# ── Build data bridge JSON ─────────────────────────────────────────────────────
if df is not None:
    data_json = serialize_for_frontend(df)
    status = "loaded"
    status_msg = f"{len(df)} records · {len(df.columns)} variables"
else:
    data_json = json.dumps({"records": [], "columns": [], "shape": {"rows": 0, "cols": 0}})
    status = "empty"
    status_msg = "No data loaded"

# ── Inject React SPA via st.components ────────────────────────────────────────
html_path  = os.path.join(os.path.dirname(__file__), "index.html")
css_path   = os.path.join(os.path.dirname(__file__), "style.css")
js_path    = os.path.join(os.path.dirname(__file__), "main.js")

with open(html_path,  "r", encoding="utf-8") as f: html_template  = f.read()
with open(css_path,   "r", encoding="utf-8") as f: css_content    = f.read()
with open(js_path,    "r", encoding="utf-8") as f: js_content     = f.read()

# Inject data bridge into the HTML
html_final = html_template \
    .replace("/* __CSS_INJECT__ */", css_content) \
    .replace("/* __DATA_BRIDGE__ */", f"window.__SIP_DATA__ = {data_json};") \
    .replace("/* __STATUS__ */", f"window.__SIP_STATUS__ = '{status}';") \
    .replace("/* __JS_INJECT__ */", js_content)

st.components.v1.html(html_final, height=900, scrolling=False)
