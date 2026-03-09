# Preventivo Smart Servizi - Conversational Agent

Un agente conversazionale intelligente progettato per raccogliere specifiche tecniche per preventivi di servizi.

## Servizi Supportati
1. **Creazione siti web**
2. **Automazioni AI o email automatiche**
3. **Installazione antifurto o videosorveglianza**
4. **Domotica o automazioni casa/garage**

## Caratteristiche
- Interfaccia conversazionale (Chat Bot)
- Raccolta dati guidata (Questionario Dinamico)
- Generazione riepilogo tecnico finale
- **NO Prezzi**: L'agente non genera prezzi, raccoglie solo i dati tecnici.

## Installazione
1. Clona il repository
2. Crea un ambiente virtuale: `python -m venv venv`
3. Attiva l'ambiente: `source venv/bin/activate`
4. Installa le dipendenze: `pip install -r requirements.txt`
5. Configura l'API Key: copia `.env.example` in `.env` e inserisci la tua chiave OpenAI.

## Utilizzo
Esegui l'agente con: `python -m src.main`
