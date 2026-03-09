from flask import Flask, render_template, request, jsonify, session
import os
import sys

# Aggiungi la directory root al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from src.agent import QuoteAgent

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Inizializza l'agente (lo faremo per sessione se necessario, ma per ora una istanza globale o per richiesta)
# Meglio istanziare l'agente per richiesta o gestire lo stato nella sessione
# Dato che QuoteAgent ha una 'history', dobbiamo gestirla per utente.
# Per semplicità in questa demo, useremo la sessione Flask per memorizzare la history, 
# ma QuoteAgent deve essere serializzabile o ricostruito.
# Modificheremo l'approccio: l'agente sarà stateless rispetto all'oggetto Python, 
# e passeremo la history dalla sessione Flask.

# Tuttavia, QuoteAgent attuale mantiene lo stato in self.history.
# Per supportare più utenti web, dobbiamo gestire lo stato separatamente.
# Creeremo un dizionario globale di agenti basato su session_id per questa demo.

agents = {}

def get_agent(session_id):
    if session_id not in agents:
        try:
            agents[session_id] = QuoteAgent()
        except ValueError as e:
            return None
    return agents[session_id]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/web-ai')
def web_ai():
    return render_template('web_ai.html')

@app.route('/chi-siamo')
def about():
    return render_template('about.html')

@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/contatti')
def contact():
    return render_template('contact.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        session_id = request.json.get('session_id', 'default')
        
        agent = get_agent(session_id)
        if not agent:
            return jsonify({"error": "Errore nell'inizializzazione dell'agente. Controlla la chiave API."}), 500
            
        response = agent.chat(user_message)
        return jsonify({"response": response})
    except Exception as e:
        print(f"Errore durante la chat: {str(e)}")
        if "Incorrect API key" in str(e) or "api_key" in str(e).lower():
            return jsonify({"error": "Chiave API OpenAI non valida o mancante. Controlla il file .env"}), 401
        return jsonify({"error": f"Si è verificato un errore: {str(e)}"}), 500

@app.route('/reset', methods=['POST'])
def reset():
    session_id = request.json.get('session_id', 'default')
    if session_id in agents:
        agents[session_id].reset()
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
