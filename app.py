import streamlit as st
import pandas as pd
import json
import os

st.set_page_config(
    page_title="Statistical Intelligence Platform",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── CSS para forzar Full Screen en el Iframe ──────────────────────────────────
st.markdown("""
<style>
    #MainMenu, header, footer { visibility: hidden; }
    .stApp { background: #000 !important; }
    .block-container { padding: 0 !important; max-width: 100% !important; }
    /* Forzamos que el iframe ocupe todo el alto disponible */
    iframe { 
        height: 100vh !important; 
        width: 100% !important;
        border: none;
    }
    .element-container, .stMarkdown {
        margin: 0 !important;
        padding: 0 !important;
    }
</style>
""", unsafe_allow_html=True)

# ── Data loading ───────────────────────────────────────────────────────────────
DEFAULT_CSV = os.path.join(os.path.dirname(__file__), "data", "encuesta_ia.csv")

def serialize_for_frontend(df: pd.DataFrame) -> str:
    payload = {
        "records": df.to_dict(orient="records"),
        "columns": list(df.columns),
    }
    return json.dumps(payload, ensure_ascii=False, default=str)

if os.path.exists(DEFAULT_CSV):
    df = pd.read_csv(DEFAULT_CSV, encoding='utf-8-sig')
    data_json = serialize_for_frontend(df)
    status = "loaded"
else:
    data_json = json.dumps({"records": [], "columns": []})
    status = "empty"

# ── Load HTML/CSS/JS templates ───────────────────────────────────────────────
html_path  = os.path.join(os.path.dirname(__file__), "index.html")
css_path   = os.path.join(os.path.dirname(__file__), "style.css")
js_path    = os.path.join(os.path.dirname(__file__), "main.js")

with open(html_path,  "r", encoding="utf-8") as f: html_template  = f.read()
with open(css_path,   "r", encoding="utf-8") as f: css_content    = f.read()
with open(js_path,    "r", encoding="utf-8") as f: js_content     = f.read()

html_final = html_template \
    .replace("/* __CSS_INJECT__ */", css_content) \
    .replace("/* __DATA_BRIDGE__ */", f"window.__SIP_DATA__ = {data_json};") \
    .replace("/* __STATUS__ */", f"window.__SIP_STATUS__ = '{status}';") \
    .replace("/* __JS_INJECT__ */", js_content)

# Importante: scrolling=True para que el componente maneje su propio scroll interno
st.components.v1.html(html_final, scrolling=True)
