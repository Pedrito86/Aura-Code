document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Menu Toggle ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close menu when clicking a link
    const navItems = document.querySelectorAll('.nav-links li a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // --- Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(element => revealObserver.observe(element));

    const counterElements = document.querySelectorAll('[data-counter][data-target]');
    const animateCounter = (element) => {
        if (!element || element.getAttribute('data-animated') === 'true') return;

        const target = Number(element.getAttribute('data-target'));
        if (!Number.isFinite(target)) return;

        const suffix = element.getAttribute('data-suffix') || '';
        const duration = Number(element.getAttribute('data-duration')) || 1100;

        element.setAttribute('data-animated', 'true');

        const startTime = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const currentValue = Math.floor(progress * target);
            element.textContent = `${currentValue}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                element.textContent = `${target}${suffix}`;
            }
        };

        element.textContent = `0${suffix}`;
        requestAnimationFrame(tick);
    };

    if (counterElements.length) {
        const containers = new Set();
        counterElements.forEach((el) => {
            containers.add(el.closest('.hero-trust') || el);
        });

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const container = entry.target;
                container.querySelectorAll('[data-counter][data-target]').forEach(animateCounter);
                counterObserver.unobserve(container);
            });
        }, { threshold: 0.4 });

        containers.forEach((container) => counterObserver.observe(container));
    }

    // --- 3D Tilt Effect for Service Cards ---
    const tiltCards = document.querySelectorAll('.service-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation based on cursor position
            // Center of card is (0,0)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Limit rotation to +/- 10 degrees
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;

            // Apply transformation
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            // Reset transformation
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // --- Advanced Typing Effect (Preserves HTML & Spacing) ---
    const heroTitles = document.querySelectorAll('h1'); // Apply to ALL h1 elements
    
    heroTitles.forEach(title => {
        // Skip if already processed or has no content
        if (title.getAttribute('data-typed') === 'true' || !title.innerHTML.trim()) return;

        // Store original HTML content (including icons and spans)
        const originalContent = title.innerHTML;
        const originalText = title.innerText; // For fallback/accessibility
        
        // Clear content initially
        title.innerHTML = '';
        title.classList.add('typing-cursor');
        
        // Create a temporary container to parse HTML nodes
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalContent;
        
        const nodes = Array.from(tempDiv.childNodes);
        let currentNodeIndex = 0;
        let currentCharIndex = 0;
        
        function typeWriter() {
            if (currentNodeIndex < nodes.length) {
                const currentNode = nodes[currentNodeIndex];
                
                if (currentNode.nodeType === Node.TEXT_NODE) {
                    // It's a text node, type character by character
                    const text = currentNode.textContent;
                    
                    if (currentCharIndex < text.length) {
                        // Append next character
                        // We need to append to the last text node in the title, or create one
                        let lastNode = title.lastChild;
                        if (!lastNode || lastNode.nodeType !== Node.TEXT_NODE) {
                            lastNode = document.createTextNode('');
                            title.appendChild(lastNode);
                        }
                        lastNode.textContent += text.charAt(currentCharIndex);
                        currentCharIndex++;
                        setTimeout(typeWriter, 30 + Math.random() * 30); // Random speed for realism
                    } else {
                        // Finished this text node, move to next node
                        currentNodeIndex++;
                        currentCharIndex = 0;
                        setTimeout(typeWriter, 10);
                    }
                } else {
                    // It's an HTML element (like <i> icon or <span>), append instantly
                    // Clone the node to avoid moving it from tempDiv
                    title.appendChild(currentNode.cloneNode(true));
                    currentNodeIndex++;
                    setTimeout(typeWriter, 100); // Pause slightly after element
                }
            } else {
                // Animation complete
                title.classList.remove('typing-cursor');
                title.setAttribute('data-typed', 'true');
            }
        }
        
        // Start animation with a small delay based on intersection or immediate
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(typeWriter, 200);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(title);
    });

    // --- Interactive Particles System ---
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Handle window resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });

        // Mouse interaction
        const mouse = {
            x: null,
            y: null,
            radius: 150
        }

        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        // Particle Class
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            // Method to draw individual particle
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            // Method to update particle position
            update() {
                // Check if particle is within canvas boundaries
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }

                // Check collision detection - mouse position / particle position
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < mouse.radius + this.size) {
                    if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                        this.x += 2;
                    }
                    if (mouse.x > this.x && this.x > this.size * 10) {
                        this.x -= 2;
                    }
                    if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                        this.y += 2;
                    }
                    if (mouse.y > this.y && this.y > this.size * 10) {
                        this.y -= 2;
                    }
                }

                // Move particle
                this.x += this.directionX;
                this.y += this.directionY;

                // Draw particle
                this.draw();
            }
        }

        // Create particle array
        function initParticles() {
            particlesArray = [];
            // Adjust number of particles based on screen size
            let numberOfParticles = (canvas.height * canvas.width) / 9000;
            
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;
                let color = 'rgba(148, 163, 184, 0.3)'; // Slate-400 with opacity

                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        // Animation Loop
        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, innerWidth, innerHeight);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connectParticles();
        }

        // Check if particles are close enough to draw line
        function connectParticles() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                    + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                    
                    if (distance < (canvas.width/7) * (canvas.height/7)) {
                        opacityValue = 1 - (distance/20000);
                        ctx.strokeStyle = 'rgba(148, 163, 184,' + opacityValue * 0.15 + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        initParticles();
        animateParticles();
    }

    // --- Trust Section Counter Animation ---
    const trustSection = document.querySelector('.trust-section');
    if (trustSection) {
        const counters = document.querySelectorAll('.stat-number');
        let activated = false;

        const counterObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !activated) {
                activated = true; // Set flag immediately to prevent double firing
                
                counters.forEach(counter => {
                    const target = counter.getAttribute('data-target');
                    if (!target) return;

                    const targetNum = parseInt(target);
                    const suffix = counter.getAttribute('data-suffix') || '';
                    const duration = 2000;
                    const frameDuration = 1000 / 60;
                    const totalFrames = Math.round(duration / frameDuration);
                    
                    let frame = 0;
                    
                    const easeOutQuad = t => t * (2 - t);
                    
                    const updateCounter = () => {
                        frame++;
                        const progress = easeOutQuad(frame / totalFrames);
                        const current = Math.round(targetNum * progress);
                        
                        if (frame < totalFrames) {
                            counter.innerText = current + suffix;
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = targetNum + suffix;
                        }
                    };
                    
                    requestAnimationFrame(updateCounter);
                });
            }
        }, { threshold: 0.5 });

        counterObserver.observe(trustSection);
    }

    // --- Premium Project Card Glow Effect ---
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- Chat Widget Logic (Existing) ---
    const chatWidget = document.getElementById('chat-widget');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const closeChatBtn = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatBody = document.getElementById('chat-body');
    const openChatButtons = document.querySelectorAll('.open-chat-btn');

    const contactMsgParam = new URLSearchParams(window.location.search).get('msg');
    if (contactMsgParam) {
        const contactMessageTextarea = document.getElementById('message');
        if (contactMessageTextarea && contactMessageTextarea.value.trim() === '') {
            contactMessageTextarea.value = contactMsgParam.trim();
        }
    }

    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chat_session_id', sessionId);
    }

    const chatState = {
        mode: 'idle',
        quote: {
            projectType: null,
            sector: null,
            priority: null,
            pages: null,
            budget: null
        }
    };

    function setChatInputEnabled(enabled) {
        chatInput.disabled = !enabled;
        sendBtn.disabled = !enabled;
        chatInput.placeholder = enabled ? 'Scrivi un messaggio…' : 'Seleziona un’opzione qui sopra…';
    }

    function toggleChat() {
        chatWidget.classList.toggle('active');
        
        if (chatWidget.classList.contains('active')) {
            chatToggleBtn.style.display = 'none';
            // Messaggio di benvenuto se la chat è vuota
            if (chatBody.children.length === 0) {
                startChatSession();
            }
        } else {
            chatToggleBtn.style.display = 'flex';
        }
    }

    chatToggleBtn.addEventListener('click', toggleChat);
    
    closeChatBtn.addEventListener('click', function() {
        chatWidget.classList.remove('active');
        chatToggleBtn.style.display = 'flex';
    });

    openChatButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!chatWidget.classList.contains('active')) {
                toggleChat();
            }
        });
    });

    function clearQuickReplies() {
        const nodes = chatBody.querySelectorAll('.chat-quick-replies');
        nodes.forEach(n => n.remove());
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'agent-message');
        messageDiv.innerText = text;
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addMessageElement(element, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'agent-message');
        messageDiv.appendChild(element);
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addAgentLinks(title, links) {
        const wrap = document.createElement('div');
        const titleDiv = document.createElement('div');
        titleDiv.textContent = title;
        titleDiv.style.marginBottom = '10px';
        wrap.appendChild(titleDiv);

        const actions = document.createElement('div');
        actions.className = 'chat-actions';

        links.forEach(link => {
            const a = document.createElement('a');
            a.className = 'chat-chip chat-chip--link';
            a.href = link.href;
            a.textContent = link.label;
            if (link.targetBlank) a.target = '_blank';
            actions.appendChild(a);
        });

        wrap.appendChild(actions);
        addMessageElement(wrap, 'agent');
    }

    function renderQuickReplies(options) {
        clearQuickReplies();
        const container = document.createElement('div');
        container.className = 'chat-quick-replies';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = opt.variant ? `chat-chip ${opt.variant}` : 'chat-chip';
            btn.textContent = opt.label;
            btn.addEventListener('click', () => {
                clearQuickReplies();
                addMessage(opt.label, 'user');
                opt.onSelect();
            });
            container.appendChild(btn);
        });
        chatBody.appendChild(container);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function resetChatState() {
        chatState.mode = 'idle';
        chatState.quote = {
            projectType: null,
            sector: null,
            priority: null,
            pages: null,
            budget: null
        };
    }

    function startChatSession() {
        resetChatState();
        setChatInputEnabled(true);
        addMessage('Ciao 👋 Come posso aiutarti?', 'agent');
        showMainMenu();
    }

    function showMainMenu() {
        renderQuickReplies([
            { label: 'Richiedi un preventivo per un progetto', onSelect: startQuoteFlow, variant: 'chat-chip--primary' },
            { label: 'Vedi esempi di siti web', onSelect: showExamplesFlow },
            { label: 'Fai una domanda', onSelect: startFaqFlow }
        ]);
    }

    function startQuoteFlow() {
        resetChatState();
        chatState.mode = 'quote';
        setChatInputEnabled(false);
        addMessage('Perfetto. Che tipo di progetto vuoi realizzare?', 'agent');
        renderQuickReplies([
            { label: 'Sito web', onSelect: () => { chatState.quote.projectType = 'Sito web'; askQuoteSector(); } },
            { label: 'Web app', onSelect: () => { chatState.quote.projectType = 'Web app'; askQuoteSector(); } },
            { label: 'E-commerce', onSelect: () => { chatState.quote.projectType = 'E-commerce'; askQuoteSector(); } },
            { label: 'Landing page', onSelect: () => { chatState.quote.projectType = 'Landing page'; askQuoteSector(); } },
            { label: 'AI tool', onSelect: () => { chatState.quote.projectType = 'AI tool'; askQuoteSector(); } }
        ]);
    }

    function askQuoteSector() {
        addMessage('Per quale settore è il progetto?', 'agent');
        renderQuickReplies([
            { label: 'Ristorante', onSelect: () => { chatState.quote.sector = 'Ristorante'; askQuotePriority(); } },
            { label: 'Startup', onSelect: () => { chatState.quote.sector = 'Startup'; askQuotePriority(); } },
            { label: 'Attività locali', onSelect: () => { chatState.quote.sector = 'Attività locali'; askQuotePriority(); } },
            { label: 'Agenzia immobiliare', onSelect: () => { chatState.quote.sector = 'Agenzia immobiliare'; askQuotePriority(); } },
            { label: 'Altro', onSelect: () => { chatState.quote.sector = 'Altro'; askQuotePriority(); } }
        ]);
    }

    function askQuotePriority() {
        addMessage('Qual è la priorità principale?', 'agent');
        renderQuickReplies([
            { label: 'Prenotazioni online', onSelect: () => { chatState.quote.priority = 'Prenotazioni online'; askQuotePages(); } },
            { label: 'Pagamenti', onSelect: () => { chatState.quote.priority = 'Pagamenti'; askQuotePages(); } },
            { label: 'Dashboard', onSelect: () => { chatState.quote.priority = 'Dashboard'; askQuotePages(); } },
            { label: 'CMS', onSelect: () => { chatState.quote.priority = 'CMS'; askQuotePages(); } },
            { label: 'Chatbot AI', onSelect: () => { chatState.quote.priority = 'Chatbot AI'; askQuotePages(); } },
            { label: 'Integrazioni personalizzate', onSelect: () => { chatState.quote.priority = 'Integrazioni personalizzate'; askQuotePages(); } }
        ]);
    }

    function askQuotePages() {
        addMessage('Quante pagine?', 'agent');
        renderQuickReplies([
            { label: '1–3', onSelect: () => { chatState.quote.pages = '1–3'; askQuoteBudget(); } },
            { label: '4–7', onSelect: () => { chatState.quote.pages = '4–7'; askQuoteBudget(); } },
            { label: '8+', onSelect: () => { chatState.quote.pages = '8+'; askQuoteBudget(); } }
        ]);
    }

    function askQuoteBudget() {
        addMessage('Qual è il tuo budget indicativo?', 'agent');
        renderQuickReplies([
            { label: 'Sotto €1000', onSelect: () => { chatState.quote.budget = 'Sotto €1000'; finishQuoteFlow(); } },
            { label: '€1000–3000', onSelect: () => { chatState.quote.budget = '€1000–3000'; finishQuoteFlow(); } },
            { label: '€3000+', onSelect: () => { chatState.quote.budget = '€3000+'; finishQuoteFlow(); } }
        ]);
    }

    function buildQuoteSummary() {
        const parts = [];
        if (chatState.quote.projectType) parts.push(`Tipo progetto: ${chatState.quote.projectType}`);
        if (chatState.quote.sector) parts.push(`Settore: ${chatState.quote.sector}`);
        if (chatState.quote.priority) parts.push(`Priorità: ${chatState.quote.priority}`);
        if (chatState.quote.pages) parts.push(`Pagine: ${chatState.quote.pages}`);
        if (chatState.quote.budget) parts.push(`Budget: ${chatState.quote.budget}`);
        return parts.join(' • ');
    }

    function finishQuoteFlow() {
        const summary = buildQuoteSummary();
        const msg = `Perfetto. Riepilogo: ${summary}`;
        addMessage(msg, 'agent');

        const contactUrl = '/contatti';
        const detailedUrl = `/contatti?msg=${encodeURIComponent(summary)}`;

        addAgentLinks('Vuoi fare il prossimo step?', [
            { label: 'Prenota una consulenza gratuita', href: contactUrl },
            { label: 'Richiedi un preventivo dettagliato', href: detailedUrl }
        ]);

        setChatInputEnabled(true);
        chatState.mode = 'idle';
        renderQuickReplies([
            { label: 'Torna al menu', onSelect: showMainMenu }
        ]);
    }

    function showExamplesFlow() {
        resetChatState();
        chatState.mode = 'idle';
        setChatInputEnabled(true);
        addAgentLinks('Ecco le pagine dei settori:', [
            { label: 'Ristoranti', href: '/settori/ristoranti' },
            { label: 'Startup', href: '/settori/startup' },
            { label: 'Attività locali', href: '/settori/attivita-locali' },
            { label: 'Agenzie immobiliari', href: '/settori/agenzie-immobiliari' },
            { label: 'Tutti i settori', href: '/settori' }
        ]);
        renderQuickReplies([
            { label: 'Torna al menu', onSelect: showMainMenu }
        ]);
    }

    const faqEntries = [
        { keys: ['tempi', 'quanto tempo', 'consegna'], answer: 'Dipende da complessità e contenuti. In media: landing 1–2 settimane, sito 2–4, e-commerce/web app da 4+.' },
        { keys: ['prezzo', 'costo', 'budget'], answer: 'Il prezzo dipende da pagine, funzionalità e contenuti. Se vuoi, scegli “Richiedi un preventivo” e lo stimiamo in modo preciso.' },
        { keys: ['seo'], answer: 'Sì: SEO tecnica, struttura contenuti e performance. L’obiettivo è farti trovare e convertire meglio.' },
        { keys: ['assistenza', 'manutenzione'], answer: 'Sì: possiamo seguire aggiornamenti, miglioramenti e monitoraggio performance anche dopo il lancio.' },
        { keys: ['e-commerce', 'pagamenti'], answer: 'Sì: checkout, pagamenti, spedizioni e integrazioni. Progettiamo anche UX per aumentare conversione.' },
        { keys: ['ai', 'chatbot', 'automazioni'], answer: 'Sì: chatbot AI, automazioni e integrazioni con strumenti esistenti per ridurre lavoro manuale.' }
    ];

    function getFaqAnswer(text) {
        const t = text.toLowerCase();
        const match = faqEntries.find(entry => entry.keys.some(k => t.includes(k)));
        return match ? match.answer : null;
    }

    function startFaqFlow() {
        resetChatState();
        chatState.mode = 'faq';
        setChatInputEnabled(true);
        addMessage('Certo. Scrivimi la tua domanda e ti rispondo in modo breve.', 'agent');
        renderQuickReplies([
            { label: 'Tempi di consegna', onSelect: () => addMessage(faqEntries[0].answer, 'agent') },
            { label: 'Prezzi e budget', onSelect: () => addMessage(faqEntries[1].answer, 'agent') },
            { label: 'SEO', onSelect: () => addMessage(faqEntries[2].answer, 'agent') },
            { label: 'Assistenza', onSelect: () => addMessage(faqEntries[3].answer, 'agent') },
            { label: 'Torna al menu', onSelect: showMainMenu }
        ]);
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        if (chatState.mode === 'faq') {
            const answer = getFaqAnswer(text);
            if (answer) {
                addMessage(answer, 'agent');
            } else {
                addMessage('Posso aiutarti su tempi, budget, SEO, e-commerce, AI e assistenza. Su cosa vuoi un chiarimento?', 'agent');
                renderQuickReplies([
                    { label: 'Tempi di consegna', onSelect: () => addMessage(faqEntries[0].answer, 'agent') },
                    { label: 'Prezzi e budget', onSelect: () => addMessage(faqEntries[1].answer, 'agent') },
                    { label: 'SEO', onSelect: () => addMessage(faqEntries[2].answer, 'agent') },
                    { label: 'Torna al menu', onSelect: showMainMenu }
                ]);
            }
            return;
        }

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    session_id: sessionId
                })
            });
            
            const data = await response.json();
            if (data.response) {
                addMessage(data.response, 'agent');
            } else if (data.error) {
                addMessage("Errore: " + data.error, 'agent');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage("Si è verificato un errore di connessione.", 'agent');
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
