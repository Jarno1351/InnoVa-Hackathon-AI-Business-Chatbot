import { useEffect, useRef, useState } from 'react';

// 🧪 STATIC TEST DATA: Simulates your real backend endpoint structures
const STATIC_TEST_MESSAGES = [
  {
    id: "test-1",
    sender: "user",
    text: "hi"
  },
  {
    id: "test-2",
    sender: "bot",
    text: "Hello! How can I assist you today with finding businesses or services in Valencia City?",
    recommendations: null // Normal conversation state
  },
  {
    id: "test-3",
    sender: "user",
    text: "hi im looking for a keyboard, however my budget is only 7k php"
  },
  {
    id: "test-4",
    sender: "bot",
    text: "Yes, we have a black keyboard available at CMU Depot Main, Valencia City p9 Branch, for 5450 PHP. This is within your budget of 7000 PHP.",
    // Mocking an adapted recommendation object layout for your drawer component
    recommendations: [
      {
        id: "6a27b6c519056c43945c7d62",
        name: "CMU Depot Main",
        match: "Keyboard Black",
        category: "Electronics",
        description: "Premium mechanical and office keyboards located near Valencia City P9 Branch.",
        address: "Valencia City, P9 Branch, Bukidnon",
        rating: "4.8",
        reviews: "124",
        availability: "In Stock",
        icon: "⌨️",
        product: {
          name: "Keyboard Black",
          description: "High durability layout, sleek matte black finish.",
          price: "5450 PHP",
          oldPrice: "6200 PHP",
          rating: "4.8",
          reviews: "124",
          specs: ["Color: Black", "Connection: Wired USB", "Layout: Full Size"],
          supplierContact: "Contact CMU Depot desk for institutional reservation."
        }
      }
    ]
  }
];

export default function ChatView({ messages, inputValue, setInputValue, onSendMessage, isLoading, onOpenSidebar, onViewRecommendations }) {
  const chatAreaRef = useRef(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // 🧪 Local fallback state switch: uses parent live hook unless it is an empty run, then uses static messages
  const displayMessages = messages.length > 0 ? messages : messages;

  const loadingTasks = [
    "Thinking...",
    "Searching local database...",
    "Analyzing top-rated suppliers...",
    "Verifying available services...",
    "Formulating recommendations..."
  ];

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [displayMessages, isLoading]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prevStep) => (prevStep + 1) % loadingTasks.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  function handleSubmit(event) {
    event.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (inputValue.trim()) {
        onSendMessage(inputValue);
      }
    }
  }

  const hasText = inputValue.trim().length > 0;

  return (
    <section className="view-panel chat-view active-view" aria-label="Chat homepage">
      <header className="top-bar">
        <button className="mobile-menu-button" type="button" aria-label="Open sidebar" onClick={onOpenSidebar}>
          <span></span><span></span><span></span>
        </button>
        <div>
          <p className="top-kicker">AI Local Assistant</p>
          <h2>Local shop recommendations</h2>
        </div>
      </header>

      <div className="chat-stage">
        {displayMessages.length === 0 && (
          <div className="hero">
            <p className="intro-text">HI I'M</p>
            <h1>Nel Jay</h1>
            <h2>Connecting you with the exact local suppliers and services you need.</h2>
          </div>
        )}

        <div className="chat-area custom-scrollbar" ref={chatAreaRef} aria-live="polite">
            {displayMessages.map((message) => (
              /* Outer wrapper controls row alignment (left vs right) */
              <div className={`message-wrapper ${message.sender}`} key={message.id}>
                <div className={`message ${message.sender}`}>
                  {message.text}
                  
                  {message.sender === 'bot' && message.recommendations && (
                    <div className="message-actions-wrapper">
                      <button 
                        type="button" 
                        className="inline-view-businesses-btn"
                        onClick={() => onViewRecommendations?.(message.recommendations)}
                      >
                        🏬 View Businesses ({message.recommendations.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-wrapper bot">
                <div className="message bot ai-status-loading">
                  <span className="status-pulse-dot"></span>
                  <span className="status-text">{loadingTasks[loadingStep]}</span>
                </div>
              </div>
            )}
          </div>
      </div>

      <form className={`chat-input-card ${hasText ? 'has-text' : ''}`} onSubmit={handleSubmit}>
        <label htmlFor="messageInput" className="visually-hidden">Type your message</label>
        <textarea
          id="messageInput"
          rows="1"
          placeholder="Type your query for Nel-Jay here..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="input-actions">
          <div className="left-actions">
            <button type="button" className="input-icon" aria-label="Add item">+</button>
            <button type="button" className="input-icon upload-icon" aria-label="Upload file">⇧</button>
          </div>

          <div className="right-actions">
            <button type="button" className="input-icon image-icon" aria-label="Add image">▧</button>
            <button type="button" className="input-icon mic-icon" aria-label="Voice input">🎙</button>
            <button type="submit" className="send-button" disabled={!hasText || isLoading} aria-label="Send message">➤</button>
          </div>
        </div>
      </form>
    </section>
  );
}