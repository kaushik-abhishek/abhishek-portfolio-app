import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageCircle, FiMinimize2, FiMaximize2 } from 'react-icons/fi';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Abhishek's AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getDynamicResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm Abhishek's AI assistant. I can help you learn more about his skills, experience, projects, or answer any questions about his work. What would you like to know?";
    }

    // About Abhishek
    if (message.includes('who is abhishek') || message.includes('about abhishek')) {
      return "Abhishek is a passionate full-stack developer with 4+ years of experience. He specializes in building scalable web applications using modern technologies like React, Node.js, and the MERN stack. He's also skilled in UI/UX design and mobile app development.";
    }

    // Skills and technologies
    if (message.includes('skills') || message.includes('technologies') || message.includes('tech stack')) {
      return "Abhishek's key skills include:\n• Frontend: React, JavaScript, TypeScript, HTML/CSS, Tailwind CSS\n• Backend: Node.js, Express.js, Python, Java\n• Databases: MongoDB, MySQL, PostgreSQL\n• Mobile: React Native\n• Tools: Git, Docker, AWS, Firebase\n• Design: UI/UX, Figma, Adobe Creative Suite";
    }

    // Experience
    if (message.includes('experience') || message.includes('work') || message.includes('career')) {
      return "Abhishek has 4+ years of professional experience in full-stack development. He has worked on various projects including web applications, mobile apps, and has experience with both frontend and backend development. He's passionate about creating seamless user experiences and efficient solutions.";
    }

    // Projects
    if (
      message.includes('projects') ||
      message.includes('portfolio') ||
      message.includes('work done') ||
      message.includes('tell me about your projects')
    ) {
      return "Here are Abhishek's key projects:\n• Inbox\n• Dashboard\n• Yellowbook ICE\n• Dealer Management System\n• Portfolio\n• Food Bazar";
    }

    // Contact information
    if (message.includes('contact') || message.includes('reach') || message.includes('get in touch')) {
      return "You can reach Abhishek through:\n• Email: Check the Contact section for his email\n• LinkedIn: https://www.linkedin.com/in/kaushikxabhishek\n• GitHub: https://github.com/kaushik-abhishek\n• You can also use the contact form on this website for direct communication.";
    }

    // Resume/CV
    if (message.includes('resume') || message.includes('cv') || message.includes('download')) {
      return "You can download Abhishek's resume by clicking the 'Download CV' button in the About section. His resume contains detailed information about his experience, skills, and achievements.";
    }

    // Services
    if (message.includes('services') || message.includes('what can you do') || message.includes('offer')) {
      return "Abhishek offers the following services:\n• Full-stack web development\n• Mobile app development (React Native)\n• UI/UX design\n• API development and integration\n• Database design and optimization\n• Website maintenance and support\n• Consultation and technical advice";
    }

    // Pricing
    if (message.includes('price') || message.includes('cost') || message.includes('rate') || message.includes('budget')) {
      return "For pricing information and project quotes, please contact Abhishek directly through the contact form or email. He provides customized quotes based on project requirements, complexity, and timeline.";
    }

    // Availability
    if (message.includes('available') || message.includes('freelance') || message.includes('hire')) {
      return "Abhishek is available for freelance projects and full-time opportunities. He's open to discussing new projects and collaborations. Feel free to reach out to discuss your requirements and availability.";
    }

    // Education
    if (message.includes('education') || message.includes('degree') || message.includes('university')) {
      return "You can find detailed information about Abhishek's educational background in the Education section of this portfolio. He has a strong academic foundation combined with practical experience in software development.";
    }

    // Thank you responses
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! I'm here to help you learn more about Abhishek and his work. Feel free to ask any other questions you might have.";
    }

    // Default responses based on keywords
    if (message.includes('help') || message.includes('assist')) {
      return "I'm here to help! You can ask me about:\n• Abhishek's skills and experience\n• His projects and portfolio\n• Contact information\n• Services he offers\n• His background and education\n• Or any other questions about his work";
    }

    if (message.includes('good') || message.includes('great') || message.includes('awesome')) {
      return "Thank you! I'm glad I could help. Abhishek is indeed a talented developer with a passion for creating amazing digital experiences. Is there anything specific you'd like to know more about?";
    }

    if (message.includes('time') || message.includes('when')) {
      return "For project timelines and availability, I'd recommend reaching out to Abhishek directly through the contact form. He can provide specific timelines based on your project requirements.";
    }

    // Fallback responses for unrecognized queries
    const fallbackResponses = [
      "That's an interesting question! While I have information about Abhishek's work and experience, for specific details about that topic, I'd recommend reaching out to him directly through the contact form.",
      "I understand you're asking about that. For the most accurate and detailed information, I'd suggest contacting Abhishek directly. He'd be happy to discuss your specific needs.",
      "That's a great question! For detailed information about that topic, I'd recommend getting in touch with Abhishek directly. He can provide more specific insights based on your requirements.",
      "I appreciate your question! For comprehensive information about that, I'd suggest reaching out to Abhishek through the contact section. He's always happy to discuss his work and answer questions."
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Get dynamic response based on user input
    setTimeout(() => {
      const botResponse = getDynamicResponse(inputValue);

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 z-50 flex items-center justify-center"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${isMinimized
          ? 'bottom-6 right-6 w-80 h-16'
          : 'bottom-4 left-4 right-4 w-[calc(100vw-2rem)] h-[480px] md:bottom-4 md:right-4 md:left-auto md:w-[380px] md:h-[480px]'
          }`}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold">A</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Abhishek's Assistant</h3>
                  <p className="text-xs opacity-90">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  {isMinimized ? <FiMaximize2 size={16} /> : <FiMinimize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                            }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-line break-words">{message.text}</p>
                          <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>

                      {message.id === 1 && message.sender === 'bot' && (
                        <div className="flex flex-wrap gap-2 mt-2 justify-start">
                          {[
                            "What are your skills?",
                            "Tell me about your projects",
                            "How can I contact you?",
                            "What services do you offer?"
                          ].map((quickAction, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setInputValue(quickAction);
                                setTimeout(() => handleSendMessage(), 100);
                              }}
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
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-3 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                        rows="1"
                        style={{
                          minHeight: '44px',
                          maxHeight: '120px'
                        }}
                        onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
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
  );
};

export default Chatbot;
