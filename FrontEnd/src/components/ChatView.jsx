import { useEffect, useRef, useState } from 'react';

export default function ChatView({ messages, inputValue, setInputValue, onSendMessage, isLoading, onOpenSidebar }) {
  const chatAreaRef = useRef(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Array of dynamic tasks the AI performs to boost perceived UI/UX speed
  const loadingTasks = [
    "Thinking...",
    "Searching local database...",
    "Analyzing top-rated suppliers...",
    "Verifying available services...",
    "Formulating recommendations..."
  ];

  // Auto-scroll mechanism
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Rotates through loading tasks sequentially while isLoading is true
  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingStep(0); // Reset to first task when loading begins
      interval = setInterval(() => {
        setLoadingStep((prevStep) => (prevStep + 1) % loadingTasks.length);
      }, 1800); // Change tasks every 1.8 seconds for optimal readability
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
        {messages.length === 0 && (
          <div className="hero">
            <p className="intro-text">HI I'M</p>
            <h1>Nel Jay</h1>
            <h2>Connecting you with the exact local suppliers and services you need.</h2>
          </div>
        )}

        <div className="chat-area custom-scrollbar" ref={chatAreaRef} aria-live="polite">
          {messages.map((message) => (
            <div className={`message ${message.sender}`} key={message.id}>
              {message.text}
            </div>
          ))}
          
          {/* Dynamic, multi-task AI loading indicator */}
          {isLoading && (
            <div className="message bot ai-status-loading">
              <span className="status-pulse-dot"></span>
              <span className="status-text">{loadingTasks[loadingStep]}</span>
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