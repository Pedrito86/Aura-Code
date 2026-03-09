import os
import sys

# Aggiungi la directory root al path per permettere gli import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from src.agent import QuoteAgent

def main():
    # Carica le variabili d'ambiente
    load_dotenv()
    
    # Verifica API Key
    if not os.getenv("OPENAI_API_KEY"):
        print("ERRORE: API Key di OpenAI non trovata.")
        print("Per favore, crea un file .env copiando .env.example e inserisci la tua chiave.")
        print("Esempio: OPENAI_API_KEY=sk-...")
        return

    print("Ciao 👋")
    print("Ti aiuto a preparare rapidamente una richiesta di preventivo.")
    print("\nTi farò alcune domande tecniche (meno di 2 minuti).")
    print("\nDi quale servizio hai bisogno?")
    print("• Sito web")
    print("• Automazioni AI/email")
    print("• Antifurto o videosorveglianza")
    print("• Domotica o smart home")
    print("\n(Scrivi 'esci' per terminare)")

    try:
        agent = QuoteAgent()
    except ValueError as e:
        print(f"Errore di inizializzazione: {e}")
        return

    while True:
        try:
            user_input = input("\nTu: ").strip()
            
            if user_input.lower() in ['esci', 'quit', 'exit']:
                print("\nGrazie per aver usato Preventivo Smart Servizi. Arrivederci!")
                break
            
            if not user_input:
                continue

            response = agent.chat(user_input)
            print(f"Agent: {response}")
            
        except KeyboardInterrupt:
            print("\n\nInterruzione rilevata. Arrivederci!")
            break
        except Exception as e:
            print(f"\nSi è verificato un errore: {e}")

if __name__ == "__main__":
    main()
