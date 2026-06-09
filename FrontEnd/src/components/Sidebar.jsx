export default function Sidebar({
  isExpanded,
  onToggle,
  activeView,
  onShowChat,
  onShowShop,
  onNewChat,
  chatHistory,
  activeChatId,
  openHistoryMenuId,
  onToggleHistoryMenu,
  onLoadHistory,
  onDeleteHistory,
  onOpenSettings,
  onLogout,
  user
}) {
  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : ''}`} id="sidebar">
      <div className="sidebar-main">
        <div className="sidebar-header">
          <button className="icon-button menu-button" onClick={onToggle} aria-label="Toggle sidebar" aria-expanded={isExpanded}>
            <span></span><span></span><span></span>
          </button>

          <button className="new-chat-button" onClick={onNewChat} aria-label="New chat">
            <span className="plus-icon">+</span>
            <span className="sidebar-label">New Chat</span>
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <button className={`sidebar-link ${activeView === 'chat' ? 'active' : ''}`} onClick={onShowChat} type="button">
            <span className="link-icon">✦</span>
            <span className="sidebar-label">Chat</span>
          </button>
          <button className={`sidebar-link ${activeView === 'shop' ? 'active' : ''}`} onClick={onShowShop} type="button">
            <span className="link-icon">🛍</span>
            <span className="sidebar-label">Shops</span>
          </button>
        </nav>

        <section className="history-section" aria-label="Chat history">
          <div className="section-title-row">
            <h3 className="section-heading">History</h3>
            <span className="history-count">{chatHistory.length}</span>
          </div>
          <p className="history-day">Today</p>
          <div className="chat-history-list custom-scrollbar">
            {chatHistory.length === 0 ? (
              <div className="history-empty">No chat history yet</div>
            ) : (
              chatHistory.map((item) => (
                <div className={`history-item-wrap ${activeChatId === item.id ? 'active-chat' : ''}`} key={item.id}>
                  <button className="history-item" type="button" onClick={() => onLoadHistory(item.id)} aria-label={`Open ${item.title}`}>
                    <span className="history-text">
                      <span className="history-title">{item.title}</span>
                      <span className="history-time">{item.time}</span>
                    </span>
                  </button>
                  <button className="history-menu-button" type="button" onClick={(event) => { event.stopPropagation(); onToggleHistoryMenu(item.id); }} aria-label={`Chat options for ${item.title}`}>⋮</button>
                  <div className={`history-dropdown ${openHistoryMenuId === item.id ? 'open' : ''}`}>
                    <button type="button" className="delete-history-button" onClick={(event) => { event.stopPropagation(); onDeleteHistory(item.id); }}>Delete Chat</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="sidebar-bottom">
        <p className="account-heading sidebar-label">Account & Settings</p>

        <button className="profile-button" type="button" aria-label="Profile">
          <span className="avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z"></path>
              <path d="M4.7 20.2c.9-3.7 3.6-5.6 7.3-5.6s6.4 1.9 7.3 5.6"></path>
            </svg>
          </span>
          <span className="sidebar-label">{user?.name || 'Profile'}</span>
        </button>

        <button className="settings-button" onClick={onOpenSettings} type="button" aria-label="Settings">
          <span className="settings-icon">⚙</span>
          <span className="sidebar-label">Settings</span>
        </button>
        <button className="settings-button logout-button" onClick={onLogout} type="button" aria-label="Logout">
          <span className="settings-icon">⇥</span>
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
