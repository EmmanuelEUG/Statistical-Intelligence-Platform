import streamlit as st
import pandas as pd
import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(
    page_title="SIP — Intelligence Platform",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Ocultar elementos de Streamlit y forzar pantalla completa
st.markdown("""
<style>
    header, footer, #MainMenu { visibility: hidden !important; }
    .stApp { background: #000 !important; overflow: hidden !important; }
    .block-container { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
    iframe { 
        position: fixed !important; top: 0 !important; left: 0 !important; 
        width: 100vw !important; height: 100vh !important; 
        border: none !important; z-index: 1; 
    }
</style>
""", unsafe_allow_html=True)

DEFAULT_CSV = os.path.join(os.path.dirname(__file__), "data", "encuesta_ia.csv")
data_json = json.dumps({"records": [], "columns": []})
if os.path.exists(DEFAULT_CSV):
    try:
        df = pd.read_csv(DEFAULT_CSV)
        data_json = json.dumps({"records": df.to_dict(orient="records"), "columns": list(df.columns)})
    except: pass

# Lógica de AI Insights
ai_response = None
query_params = st.query_params
if "ai_query" in query_params:
    section = query_params.get("section", "General")
    stats_summary = query_params.get("stats", "")
    api_key = os.getenv("GROK_API_KEY")
    
    if api_key:
        try:
            prompt = f"""Actúa como un consultor estratégico de IA de alto nivel. 
            Analiza los siguientes datos estadísticos de la sección '{section}':
            {stats_summary}
            
            Proporciona 'Strategic Insights' ejecutivos y fáciles de leer.
            Usa analogías para explicar conceptos técnicos.
            Dime qué información nos dan estos datos y qué decisiones se podrían tomar.
            Habla como si el cliente fuera un empresario que no es estadístico.
            Sé conciso y directo, estilo ciberpunk."""
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            # Usando el endpoint compatible con OpenAI de xAI (Grok)
            payload = {
                "model": "grok-beta", # O el modelo disponible
                "messages": [{"role": "user", "content": prompt}]
            }
            resp = requests.post("https://api.x.ai/v1/chat/completions", headers=headers, json=payload, timeout=15)
            if resp.status_code == 200:
                ai_response = resp.json()['choices'][0]['message']['content']
            else:
                ai_response = f"Error del Servidor AI: {resp.status_code} - {resp.text}"
        except Exception as e:
            ai_response = f"Error en la conexión con la IA: {str(e)}"
    else:
        ai_response = "Error: GROK_API_KEY no encontrada en el archivo .env"

html_content = open("index.html", "r").read()
data_bridge = f"<script>window.__SIP_DATA__ = {data_json}; window.__SIP_AI_RESPONSE__ = {json.dumps(ai_response)};</script>"
st.components.v1.html(html_content.replace("</head>", data_bridge + "</head>"), height=2000, scrolling=False)
