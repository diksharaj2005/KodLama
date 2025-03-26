document.addEventListener('DOMContentLoaded', function() {
    // Chat elements with null checks
    const chatElements = {
        toggle: document.getElementById('chatbot-toggle'),
        container: document.getElementById('chatbot-container'),
        close: document.getElementById('close-chat'),
        sendBtn: document.getElementById('send-btn'),
        input: document.getElementById('user-input'),
        messages: document.getElementById('chat-messages')
    };

    // Validate essential elements exist
    if (Object.values(chatElements).some(el => !el)) {
        console.error('Critical chat elements missing!');
        return;
    }

    // Enhanced Disaster Knowledge Base with structured responses
    const disasterKB = {
        disasters: ["earthquake", "tsunami", "hurricane", "wildfire", "flood"],
        
        responses: {
            greeting: `Hello! I'm DisasterBot, your emergency preparedness assistant. I can help with:
                <ul>
                    <li>Earthquake safety procedures</li>
                    <li>Tsunami evacuation plans</li>
                    <li>Hurricane preparedness</li>
                    <li>Wildfire danger information</li>
                    <li>Flood risk assessment</li>
                </ul>
                <p>Try asking: "What should I do during an earthquake?" or "How do I prepare for a hurricane?"</p>
                <p>For immediate help, say <strong>"EMERGENCY"</strong> followed by your situation.</p>`,
                
            emergency: `🚨 <strong>EMERGENCY ASSISTANCE ACTIVATED</strong> 🚨
                <p>Please describe your situation clearly (example: "Earthquake happening now" or "Flood waters rising").</p>
                <p>While you wait for my response, here are emergency contacts:</p>
                <ul>
                    <li>Police/Fire/Medical: <strong>911</strong></li>
                    <li>Coast Guard: <strong>+1-202-372-2100</strong></li>
                    <li>FEMA: <strong>1-800-621-3362</strong></li>
                </ul>`,
                
            unknown: `I'm not sure I understand. For immediate help, contact local emergency services.
                <p>Here are some things I can help with:</p>
                <ul>
                    <li>Safety steps for different disasters</li>
                    <li>Preparation checklists</li>
                    <li>Emergency contact information</li>
                    <li>What to do after a disaster</li>
                </ul>
                <p>Try asking: "How do I prepare for earthquakes?" or "What's in a basic emergency kit?"</p>`,
                
            contacts: `Here are important emergency contacts:
                <ul>
                    <li><strong>Medical Emergency:</strong> 911</li>
                    <li><strong>Fire Department:</strong> 911</li>
                    <li><strong>Police:</strong> 911</li>
                    <li><strong>Poison Control:</strong> 1-800-222-1222</li>
                    <li><strong>FEMA:</strong> 1-800-621-3362</li>
                    <li><strong>Red Cross:</strong> 1-800-RED-CROSS</li>
                </ul>`,
                
            tips: [
                "Remember: During any disaster, stay calm and follow official instructions.",
                "Pro tip: Keep your emergency kit in an easily accessible location.",
                "Did you know? You should practice your evacuation route twice a year.",
                "Important: Always have multiple ways to receive emergency alerts.",
                "Safety first: Check your smoke detectors and fire extinguishers regularly."
            ]
        },
        
        // Disaster-specific information (keep your existing structure)
        // ... (your existing earthquake, tsunami, etc. data)
        
        // Helper methods
        getRandomTip: function() {
            return this.responses.tips[Math.floor(Math.random() * this.responses.tips.length)];
        },
        
        formatSteps: function(steps) {
            return steps.map((step, i) => `${i+1}. ${step}`).join('<br>');
        },
        
        getFAQResponse: function(disaster, question) {
            const faq = this[disaster]?.faq;
            if (!faq) return null;
            
            for (const [keyword, answer] of Object.entries(faq)) {
                if (question.includes(keyword)) {
                    return answer;
                }
            }
            return null;
        }
    };

    // Chat state management
    const chatState = {
        isEmergency: false,
        lastInteraction: null,
        
        init: function() {
            chatElements.container.style.display = 'none';
            if (!localStorage.getItem('chatHistory')) {
                this.sendGreeting();
            }
        },
        
        sendGreeting: function() {
            if (chatElements.messages.children.length === 0) {
                this.addBotMessage(disasterKB.responses.greeting, true);
            }
        },
        
        setEmergencyMode: function(enable) {
            this.isEmergency = enable;
            chatElements.container.classList.toggle('emergency-mode', enable);
            if (enable) {
                this.addBotMessage(disasterKB.responses.emergency, true);
            }
        },
        
        addUserMessage: function(text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message user-message';
            messageDiv.textContent = text;
            chatElements.messages.appendChild(messageDiv);
            this.scrollToBottom();
        },
        
        addBotMessage: function(text, isHTML = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot-message';
            
            if (isHTML) {
                messageDiv.innerHTML = text;
            } else {
                // Auto-link URLs and phone numbers
                const linkedText = text
                    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
                    .replace(/(\d{3}-\d{3}-\d{4})/g, '<a href="tel:$1">$1</a>');
                messageDiv.innerHTML = linkedText;
            }
            
            chatElements.messages.appendChild(messageDiv);
            this.scrollToBottom();
        },
        
        showTypingIndicator: function() {
            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.innerHTML = '<span></span><span></span><span></span>';
            chatElements.messages.appendChild(indicator);
            this.scrollToBottom();
            return indicator;
        },
        
        scrollToBottom: function() {
            chatElements.messages.scrollTop = chatElements.messages.scrollHeight;
        }
    };

    // Message processing
    const messageProcessor = {
        handleUserMessage: function(message) {
            chatState.addUserMessage(message);
            chatElements.input.value = '';
            
            const typingIndicator = chatState.showTypingIndicator();
            
            setTimeout(() => {
                chatElements.messages.removeChild(typingIndicator);
                this.generateResponse(message);
            }, 800 + Math.random() * 700);
        },
        
        generateResponse: function(message) {
            const lowerMsg = message.toLowerCase();
            
            // Emergency mode activation
            if (lowerMsg.includes("emergency")) {
                chatState.setEmergencyMode(true);
                return;
            }
            
            // Check for specific disaster queries
            for (const disaster of disasterKB.disasters) {
                if (lowerMsg.includes(disaster)) {
                    // Check for FAQ questions first
                    const faqResponse = disasterKB.getFAQResponse(disaster, lowerMsg);
                    if (faqResponse) {
                        chatState.addBotMessage(faqResponse);
                        return;
                    }
                    
                    // Default to steps if no FAQ match
                    const steps = disasterKB[disaster]?.steps;
                    if (steps) {
                        const formattedSteps = `<strong>${disaster.toUpperCase()} SAFETY STEPS:</strong><br>${disasterKB.formatSteps(steps)}`;
                        chatState.addBotMessage(formattedSteps, true);
                        return;
                    }
                }
            }
            
            // Special commands
            if (lowerMsg.includes("contact") || lowerMsg.includes("number")) {
                chatState.addBotMessage(disasterKB.responses.contacts, true);
            } 
            else if (lowerMsg.includes("help") || lowerMsg.includes("hi") || lowerMsg.includes("hello")) {
                chatState.addBotMessage(disasterKB.responses.greeting, true);
            }
            else {
                // Add a random tip to the unknown response
                const unknownResponse = `${disasterKB.responses.unknown}<br><br><em>${disasterKB.getRandomTip()}</em>`;
                chatState.addBotMessage(unknownResponse, true);
            }
        }
    };

    // Event handlers
    function setupEventListeners() {
        // Toggle chat visibility
        chatElements.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = chatElements.container.style.display === 'block';
            chatElements.container.style.animation = isVisible ? 'fadeOut 0.3s ease' : 'fadeIn 0.3s ease';
            chatElements.container.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                chatElements.input.focus();
                chatState.sendGreeting();
            }
        });

        // Close chat
        chatElements.close.addEventListener('click', (e) => {
            e.stopPropagation();
            chatElements.container.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                chatElements.container.style.display = 'none';
                chatElements.container.style.animation = '';
            }, 300);
        });

        // Send message handlers
        chatElements.sendBtn.addEventListener('click', debounce(() => {
            const message = chatElements.input.value.trim();
            if (message) messageProcessor.handleUserMessage(message);
        }, 300));

        chatElements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && chatElements.input.value.trim()) {
                messageProcessor.handleUserMessage(chatElements.input.value.trim());
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!chatElements.container.contains(e.target) && e.target !== chatElements.toggle) {
                chatElements.container.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    chatElements.container.style.display = 'none';
                    chatElements.container.style.animation = '';
                }, 300);
            }
        });
    }

    // Debounce function
    function debounce(func, delay) {
        let timeoutId;
        return function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, arguments), delay);
        };
    }

    // Initialize
    chatState.init();
    setupEventListeners();
});