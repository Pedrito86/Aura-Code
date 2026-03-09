import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser

class QuoteAgent:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY non trovata. Assicurati di averla impostata nel file .env")
        
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
        
        self.system_prompt = """Sei un assistente tecnico di "Aura Code", una Digital Agency specializzata. 
Il tuo obiettivo è raccogliere informazioni per preventivi di servizi digitali.

Devi identificare quale servizio serve tra:
1) Creazione sito web
2) E-Commerce
3) Automazioni AI / Chatbot
4) Software Gestionale Custom

REGOLE:
- Fai UNA domanda alla volta.
- Non fare mai più domande insieme.
- Usa linguaggio semplice e professionale.
- Non inventare prezzi.
- Devi solo raccogliere dati per una proposta tecnica.

FASE 1 — CLASSIFICAZIONE
Chiedi prima: "Di quale soluzione digitale hai bisogno?"

FASE 2 — QUESTIONARIO DINAMICO

SE SITO WEB chiedi:
- Hai già un dominio o un sito esistente?
- Che tipo di attività devi promuovere?
- Quante pagine indicativamente prevedi?
- Hai bisogno di funzionalità specifiche (blog, area riservata)?

SE E-COMMERCE chiedi:
- Quanti prodotti prevedi di vendere circa?
- Hai già un gestionale di magazzino?
- In quali mercati vuoi vendere (Italia, Estero)?
- Hai bisogno di integrazioni con marketplace (Amazon, eBay)?

SE AUTOMAZIONI AI / CHATBOT chiedi:
- Quale processo vuoi automatizzare (assistenza clienti, lead generation)?
- Su quali canali deve operare (Sito web, WhatsApp, Email)?
- Hai già dei testi o delle risposte frequenti pronte?
- Vuoi che l'AI si integri con il tuo calendario o CRM?

SE SOFTWARE GESTIONALE chiedi:
- Qual è il flusso di lavoro principale da gestire?
- Quanti utenti dovranno accedere al sistema?
- Deve essere accessibile da mobile?
- Deve integrarsi con altri software esistenti?

FASE 3 — CHIUSURA

Quando hai raccolto abbastanza informazioni:
1. crea un riepilogo tecnico ordinato
2. chiedi nome ed email per inviare la proposta

Formato riepilogo:
SERVIZIO: [Servizio Identificato]
DETTAGLI: [Dettagli Raccolti]
OBIETTIVO: [Obiettivo del Cliente]
NOTE TECNICHE: [Altre Note]

Non generare prezzi.
Concludi dicendo che verrà preparata una proposta su misura.
"""
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}"),
        ])
        
        self.chain = self.prompt | self.llm | StrOutputParser()
        self.history = []

    def chat(self, user_input: str) -> str:
        response = self.chain.invoke({
            "history": self.history,
            "input": user_input
        })
        
        self.history.append(HumanMessage(content=user_input))
        self.history.append(AIMessage(content=response))
        
        return response

    def reset(self):
        self.history = []
