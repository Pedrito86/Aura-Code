from flask import Flask, render_template, request, jsonify, session, flash, redirect, url_for, Response, abort
import os
import sys
from datetime import date

# Aggiungi la directory root al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from src.agent import QuoteAgent

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.url_map.strict_slashes = False

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

SECTORS = {
    "ristoranti": {
        "name": "Ristoranti",
        "icon": "fas fa-utensils",
        "h1": "Siti web per Ristoranti",
        "intro": "Siti veloci e ottimizzati per aumentare prenotazioni, recensioni e visibilità su Google (SEO locale).",
        "objective": "Portare più prenotazioni e richieste, riducendo la frizione nel percorso utente.",
        "features": [
            "Menu digitale",
            "Sistema di prenotazione",
            "Contatti rapidi (click-to-call / WhatsApp)",
            "SEO locale",
        ],
        "outcomes": [
            "Aumento prenotazioni",
            "Migliore visibilità su Google Maps",
            "Più richieste da mobile",
            "Esperienza utente più rapida",
        ],
        "examples_anchor": "ristoranti",
        "seo_title": "Siti Web per Ristoranti | Sornex Studio",
        "seo_description": "Realizzazione siti web per ristoranti: menu digitale, prenotazioni, SEO locale e performance per aumentare coperti e richieste.",
        "seo_keywords": "siti web ristoranti, sito ristorante, prenotazioni online, menu digitale, seo locale ristorante",
    },
    "startup": {
        "name": "Startup",
        "icon": "fas fa-rocket",
        "h1": "Siti e Web App per Startup",
        "intro": "Landing page, MVP e dashboard pensati per validare il prodotto e lanciare velocemente con un’immagine credibile.",
        "objective": "Accelerare il go-to-market e convertire visite in lead, demo o signup.",
        "features": [
            "Landing page ad alta conversione",
            "MVP veloci",
            "Dashboard e web app",
            "Integrazione con API",
        ],
        "outcomes": [
            "Più lead qualificati",
            "Time-to-market ridotto",
            "Base tecnica scalabile",
            "Tracking e misurazione migliori",
        ],
        "examples_anchor": "startup",
        "seo_title": "Siti e MVP per Startup | Sornex Studio",
        "seo_description": "Soluzioni per startup: landing page, MVP e web app scalabili. Design, performance e SEO per lanciare e crescere più velocemente.",
        "seo_keywords": "sito per startup, landing page startup, mvp, web app startup, sviluppo startup",
    },
    "agenzie-immobiliari": {
        "name": "Agenzie immobiliari",
        "icon": "fas fa-house-chimney",
        "h1": "Siti web per Agenzie Immobiliari",
        "intro": "Siti professionali per valorizzare gli immobili e trasformare visite in contatti con schede indicizzabili e filtri rapidi.",
        "objective": "Generare più contatti e appuntamenti grazie a pagine immobili chiare e facili da trovare su Google.",
        "features": [
            "Gestione immobili",
            "Filtri di ricerca avanzati",
            "Galleria immagini",
            "Form di contatto ottimizzato",
        ],
        "outcomes": [
            "Più richieste per immobile",
            "Migliore posizionamento delle schede",
            "Riduzione dei lead non qualificati",
            "Esperienza di ricerca più rapida",
        ],
        "examples_anchor": "immobiliare",
        "seo_title": "Siti Web per Agenzie Immobiliari | Sornex Studio",
        "seo_description": "Realizzazione siti per agenzie immobiliari: listing, schede immobile indicizzabili, filtri avanzati e contatti ottimizzati.",
        "seo_keywords": "sito agenzia immobiliare, sito immobili, schede immobile seo, listing immobili, filtri ricerca immobili",
    },
    "attivita-locali": {
        "name": "Attività locali",
        "icon": "fas fa-store",
        "h1": "Siti web per Attività Locali",
        "intro": "Siti moderni e veloci per farsi trovare su Google e trasformare visite in chiamate e richieste (perfetti per servizi locali).",
        "objective": "Aumentare contatti e richieste con una presenza online credibile e ottimizzata per la ricerca locale.",
        "features": [
            "Pagine servizi chiare",
            "Recensioni e trust",
            "Contatti rapidi",
            "Performance e mobile-first",
        ],
        "outcomes": [
            "Più chiamate e messaggi",
            "Migliore visibilità locale",
            "Maggiore fiducia e conversione",
            "Riduzione della dispersione utenti",
        ],
        "examples_anchor": "attivita-locali",
        "seo_title": "Siti Web per Attività Locali | Sornex Studio",
        "seo_description": "Siti web per attività locali: mobile-first, SEO locale, contatti rapidi e pagine servizi ottimizzate per aumentare le richieste.",
        "seo_keywords": "sito attività locale, seo locale, sito per professionisti, sito palestra, sito studio professionale",
    },
}

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

@app.route('/processo')
def process():
    return render_template('process.html')

@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/settori')
def sectors():
    return render_template('settori.html')

@app.route('/settori/<slug>')
def sector_detail(slug):
    sector = SECTORS.get(slug)
    if not sector:
        abort(404)
    return render_template('sector_detail.html', sector=sector)

@app.route('/settori-esempi')
def sector_examples():
    return render_template('settori_esempi.html')

@app.route('/contatti', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        # Simulazione invio email
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        
        # Qui si potrebbe integrare l'invio reale di email o il salvataggio su DB
        print(f"Nuovo contatto ricevuto: {name} ({email}): {message}")
        
        flash('Messaggio inviato con successo! Ti risponderemo al più presto.', 'success')
        return redirect(url_for('contact'))
        
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

@app.route('/sitemap.xml')
def sitemap_xml():
    today = date.today().isoformat()
    urls = [
        ("home", 1.0, "weekly"),
        ("web_ai", 0.9, "monthly"),
        ("sectors", 0.9, "monthly"),
        ("sector_examples", 0.8, "monthly"),
        ("process", 0.7, "monthly"),
        ("about", 0.6, "monthly"),
        ("faq", 0.6, "monthly"),
        ("contact", 0.7, "monthly"),
    ]

    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for endpoint, priority, changefreq in urls:
        xml.append("<url>")
        xml.append(f"<loc>{url_for(endpoint, _external=True)}</loc>")
        xml.append(f"<lastmod>{today}</lastmod>")
        xml.append(f"<changefreq>{changefreq}</changefreq>")
        xml.append(f"<priority>{priority:.1f}</priority>")
        xml.append("</url>")

    for slug in SECTORS.keys():
        xml.append("<url>")
        xml.append(f"<loc>{url_for('sector_detail', slug=slug, _external=True)}</loc>")
        xml.append(f"<lastmod>{today}</lastmod>")
        xml.append("<changefreq>monthly</changefreq>")
        xml.append("<priority>0.8</priority>")
        xml.append("</url>")
    xml.append("</urlset>")

    return Response("\n".join(xml), mimetype="application/xml")

@app.route('/robots.txt')
def robots_txt():
    sitemap_url = url_for("sitemap_xml", _external=True)
    content = "\n".join([
        "User-agent: *",
        "Allow: /",
        "",
        f"Sitemap: {sitemap_url}",
    ])
    return Response(content, mimetype="text/plain")

if __name__ == '__main__':
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "0") == "1" or os.getenv("DEBUG", "0") == "1"
    app.run(debug=debug, port=port)
