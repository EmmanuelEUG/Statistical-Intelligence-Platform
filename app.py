# Statistical Intelligence Platform - Sistema de Análisis Estadístico
import streamlit as st
import pandas as pd
import json
import os
import requests
from dotenv import load_dotenv

# Intentar importar la librería OpenAI (OtroProyecto la usa, es más estable)
try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

# --- CARGA DE ENTORNO RESILIENTE ---
def _get_key():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if "GROQ_API_KEY" in line and "=" in line:
                    return line.split("=")[1].split("#")[0].strip().replace('"', '').replace("'", "")
    return os.getenv("GROQ_API_KEY")

API_KEY = _get_key()
MODEL = "llama-3.3-70b-versatile"

st.set_page_config(page_title="SIP — Intelligence Platform", layout="wide", initial_sidebar_state="collapsed")

# Session State
if "ai_memory" not in st.session_state: st.session_state.ai_memory = None
if "active_sid" not in st.session_state: st.session_state.active_sid = None

# CSS Pantalla Completa
st.markdown("""
<style>
    header, footer, #MainMenu { visibility: hidden !important; }
    .stApp { background: #000 !important; overflow: hidden !important; }
    .block-container { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
    iframe { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; border: none !important; z-index: 1; }
</style>
""", unsafe_allow_html=True)

# Cargar CSV
data_json = json.dumps({"records": [], "columns": []})
DEFAULT_CSV = os.path.join(os.path.dirname(__file__), "data", "encuesta_ia.csv")
if os.path.exists(DEFAULT_CSV):
    try:
        df = pd.read_csv(DEFAULT_CSV)
        data_json = json.dumps({"records": df.to_dict(orient="records"), "columns": list(df.columns)})
    except: pass

# --- PROCESAR IA (LÓGICA OTRO_PROYECTO REFORZADA) ---
params = st.query_params
if "ai_query" in params:
    sid = params.get("active_id", "General")
    stats = params.get("stats", "")
    
    if API_KEY:
        try:
            prompt = f"Actúa como un consultor estratégico. Analiza estos datos: {stats}. Explica el impacto para un negocio con analogías simples y da 3 consejos prácticos. Tono ciberpunk."
            
            # Usar la misma técnica que en el proyecto OtroProyecto pero con Groq
            headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
            payload = {"model": MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0.7}
            r = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=25)
            
            if r.status_code == 200:
                st.session_state.ai_memory = r.json()["choices"][0]["message"]["content"]
                st.session_state.active_sid = sid
            else:
                st.session_state.ai_memory = f"⚠️ Error de API: {r.status_code}"
        except Exception as e:
            st.session_state.ai_memory = f"⚠️ Error: {str(e)}"
    
    # Limpiar URL y refrescar (Técnica de sincronización)
    st.query_params.clear()
    st.rerun()

# Inyectar al Frontend
html_code = open("index.html", "r").read()

# Detectar la URL base de Streamlit
try:
    from streamlit.web.server.websocket_headers import _get_websocket_headers
    _host = "localhost"
except:
    _host = "localhost"

_port = os.environ.get("STREAMLIT_SERVER_PORT", "8501")
_base_url = f"http://{_host}:{_port}"

data_bridge = f"""
<script>
window.__SIP_DATA__ = {data_json}; 
window.__SIP_AI_RESPONSE__ = {json.dumps(st.session_state.ai_memory)};
window.__SIP_RELOAD_SECTION__ = "{st.session_state.active_sid or ''}";
window.__SIP_BASE_URL__ = "{_base_url}";
window.__GROQ_KEY__ = "{API_KEY or ''}";
</script>
"""
st.components.v1.html(html_code.replace("</head>", data_bridge + "</head>"), height=2000, scrolling=False)