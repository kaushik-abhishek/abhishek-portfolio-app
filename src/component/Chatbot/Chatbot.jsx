import { useState, useRef, useEffect, useCallback } from 'react'
import {
  FiSend,
  FiX,
  FiMessageCircle,
  FiMinimize2,
  FiMaximize2,
} from 'react-icons/fi'

// ---------------------------------------------------------------------------
// Static configuration (kept outside the component so they're not re-created
// on every render).
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  'What are your skills?',
  'Tell me about your projects',
  'How can I contact you?',
  'What services do you offer?',
]

/**
 * Pattern-matched response rules. Order matters — the first matching rule
 * wins. Word-boundary regexes (\b) avoid false matches like "hire" → "hi",
 * "framework" → "work", or "this" → "hi".
 */
const RESPONSE_RULES = [
  {
    test: /\b(who is abhishek|about abhishek)\b/i,
    reply:
      "Abhishek is a passionate full-stack developer with 4+ years of experience. He specializes in building scalable web applications using modern technologies like React, Node.js, and the MERN stack. He's also skilled in UI/UX design and mobile app development.",
  },
  {
    test: /\b(skills|technologies|tech stack)\b/i,
    reply:
      "Abhishek's key skills include:\n• Frontend: React, JavaScript, TypeScript, HTML/CSS, Tailwind CSS\n• Backend: Node.js, Express.js, Python, Java\n• Databases: MongoDB, MySQL, PostgreSQL\n• Mobile: React Native\n• Tools: Git, Docker, AWS, Firebase\n• Design: UI/UX, Figma, Adobe Creative Suite",
  },
  {
    test: /\b(projects|portfolio|work done)\b|tell me about your projects/i,
    reply:
      "Here are Abhishek's key projects:\n• Inbox\n• Dashboard\n• Yellowbook ICE\n• Dealer Management System\n• Portfolio\n• Food Bazar",
  },
  {
    test: /\b(experience|career|work\w*)\b/i,
    reply:
      "Abhishek has 4+ years of professional experience in full-stack development. He has worked on various projects including web applications, mobile apps, and has experience with both frontend and backend development. He's passionate about creating seamless user experiences and efficient solutions.",
  },
  {
    test: /\b(contact|reach|get in touch)\b/i,
    reply:
      'You can reach Abhishek through:\n• Email: Check the Contact section for his email\n• LinkedIn: https://www.linkedin.com/in/kaushikxabhishek\n• GitHub: https://github.com/kaushik-abhishek\n• You can also use the contact form on this website for direct communication.',
  },
  {
    test: /\b(resume|cv|download)\b/i,
    reply:
      "You can download Abhishek's resume by clicking the 'Download CV' button in the About section. His resume contains detailed information about his experience, skills, and achievements.",
  },
  {
    test: /\b(services|offer)\b|what can you do/i,
    reply:
      'Abhishek offers the following services:\n• Full-stack web development\n• Mobile app development (React Native)\n• UI/UX design\n• API development and integration\n• Database design and optimization\n• Website maintenance and support\n• Consultation and technical advice',
  },
  {
    test: /\b(price|pricing|cost|rate|budget)\b/i,
    reply:
      'For pricing information and project quotes, please contact Abhishek directly through the contact form or email. He provides customized quotes based on project requirements, complexity, and timeline.',
  },
  {
    test: /\b(available|availability|freelance|hire|hiring)\b/i,
    reply:
      "Abhishek is available for freelance projects and full-time opportunities. He's open to discussing new projects and collaborations. Feel free to reach out to discuss your requirements and availability.",
  },
  {
    test: /\b(education|degree|university|college)\b/i,
    reply:
      "You can find detailed information about Abhishek's educational background in the Education section of this portfolio. He has a strong academic foundation combined with practical experience in software development.",
  },
  {
    test: /\b(thank|thanks)\b/i,
    reply:
      "You're welcome! I'm here to help you learn more about Abhishek and his work. Feel free to ask any other questions you might have.",
  },
  {
    test: /\b(help|assist)\b/i,
    reply:
      "I'm here to help! You can ask me about:\n• Abhishek's skills and experience\n• His projects and portfolio\n• Contact information\n• Services he offers\n• His background and education\n• Or any other questions about his work",
  },
  {
    test: /\b(good|great|awesome|amazing)\b/i,
    reply:
      "Thank you! I'm glad I could help. Abhishek is indeed a talented developer with a passion for creating amazing digital experiences. Is there anything specific you'd like to know more about?",
  },
  {
    test: /\b(time|when|timeline)\b/i,
    reply:
      "For project timelines and availability, I'd recommend reaching out to Abhishek directly through the contact form. He can provide specific timelines based on your project requirements.",
  },
  // Greetings go LAST so longer/more specific phrases match first
  // (e.g. "hire" / "history" / "this" no longer collide with "hi").
  {
    test: /\b(hello|hi|hey|hola)\b/i,
    reply:
      "Hello! I'm Abhishek's AI assistant. I can help you learn more about his skills, experience, projects, or answer any questions about his work. What would you like to know?",
  },
]

const FALLBACK_RESPONSES = [
  "That's an interesting question! While I have information about Abhishek's work and experience, for specific details about that topic, I'd recommend reaching out to him directly through the contact form.",
  "I understand you're asking about that. For the most accurate and detailed information, I'd suggest contacting Abhishek directly. He'd be happy to discuss your specific needs.",
  "That's a great question! For detailed information about that topic, I'd recommend getting in touch with Abhishek directly. He can provide more specific insights based on your requirements.",
  "I appreciate your question! For comprehensive information about that, I'd suggest reaching out to Abhishek through the contact section. He's always happy to discuss his work and answer questions.",
]

const getDynamicResponse = (userMessage) => {
  const trimmed = userMessage.trim()
  if (!trimmed) return FALLBACK_RESPONSES[0]

  const matched = RESPONSE_RULES.find((rule) => rule.test.test(trimmed))
  if (matched) return matched.reply

  return FALLBACK_RESPONSES[
    Math.floor(Math.random() * FALLBACK_RESPONSES.length)
  ]
}

const createWelcomeMessage = () => ({
  id: 1,
  text: "Hi! I'm Abhishek's AI assistant. How can I help you today?",
  sender: 'bot',
  timestamp: new Date(),
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState(() => [createWelcomeMessage()])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const messageIdRef = useRef(2) // 1 is reserved for the welcome message

  const nextMessageId = () => {
    const id = messageIdRef.current
    messageIdRef.current += 1
    return id
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when the panel opens (and isn't minimized)
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // Auto-resize textarea as the user types — driven by state so it stays in
  // sync with controlled value changes (including programmatic clears).
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [inputValue])

  // Clear any pending typing simulation on unmount to avoid setting state
  // on an unmounted component.
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
    }
  }, [])

  /**
   * Sends a message. Accepts an optional `overrideText` so callers (like
   * quick-action buttons) can submit immediately without round-tripping
   * through `inputValue` state (which would be stale at call time).
   */
  const handleSendMessage = useCallback(
    (overrideText) => {
      const text = (overrideText ?? inputValue).trim()
      if (!text) return

      const userMessage = {
        id: nextMessageId(),
        text,
        sender: 'user',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue('')
      setIsTyping(true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(
        () => {
          const botMessage = {
            id: nextMessageId(),
            text: getDynamicResponse(text),
            sender: 'bot',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, botMessage])
          setIsTyping(false)
          typingTimeoutRef.current = null
        },
        1000 + Math.random() * 1500,
      )
    },
    [inputValue],
  )

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat assistant"
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 z-50 flex items-center justify-center"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat assistant"
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-16'
              : 'bottom-4 left-4 right-4 w-[calc(100vw-2rem)] h-[480px] md:bottom-4 md:right-4 md:left-auto md:w-[380px] md:h-[480px]'
          }`}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold">A</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    Abhishek&apos;s Assistant
                  </h3>
                  <p className="text-xs opacity-90">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsMinimized((v) => !v)}
                  aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  {isMinimized ? (
                    <FiMaximize2 size={16} />
                  ) : (
                    <FiMinimize2 size={16} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                  {messages.map((message, index) => (
                    <div key={message.id}>
                      <div
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-line break-words">
                            {message.text}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === 'user'
                                ? 'text-blue-100'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>

                      {index === 0 && message.sender === 'bot' && (
                        <div className="flex flex-wrap gap-2 mt-2 justify-start">
                          {QUICK_ACTIONS.map((quickAction) => (
                            <button
                              type="button"
                              key={quickAction}
                              onClick={() => handleSendMessage(quickAction)}
                              className="px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200 shadow-sm hover:shadow-md"
                            >
                              {quickAction}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div
                      className="flex justify-start"
                      aria-live="polite"
                      aria-label="Assistant is typing"
                    >
                      <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-3 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        aria-label="Type your message"
                        rows={1}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim()}
                      aria-label="Send message"
                      className="flex-shrink-0 w-11 h-11 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                    >
                      <FiSend size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
