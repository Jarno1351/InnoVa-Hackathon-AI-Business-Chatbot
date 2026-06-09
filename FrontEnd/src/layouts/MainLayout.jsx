import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import ChatView from '../components/ChatView.jsx';
import ShopView from '../components/ShopView.jsx';
import MerchantDashboard from '../pages/MerchantDashboard.jsx';
import ProtectedRoute from '../routes/ProtectedRoute.jsx'; 
import RecommendationDrawer from '../components/RecommendationDrawer.jsx';
import SettingsModal from '../components/SettingsModal.jsx';
import { fallbackShops, initialChatHistory } from '../data/mockData.js';
import { logoutUser } from '../services/authService.js';
import { sendChatMessage } from '../services/chatService.js';
import { adaptChatMatchesToRecommendations, getFallbackRecommendations } from '../utils/recommendationAdapter.js';

export default function MainLayout({ user,setUser, isBooting }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeView = location.pathname.substring(1) || 'chat';

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(initialChatHistory);
  const [activeChatId, setActiveChatId] = useState(null);
  const [openHistoryMenuId, setOpenHistoryMenuId] = useState(null);

  const [currentRecommendations, setCurrentRecommendations] = useState([]);
  const [activeDrawerRecommendations, setActiveDrawerRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isRecommendationDrawerOpen, setIsRecommendationDrawerOpen] = useState(false);

  const hasRecommendations = currentRecommendations.length > 0;
  const showReopenButton = hasRecommendations && !isRecommendationDrawerOpen;

  const shops = useMemo(() => fallbackShops, []);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (!event.target.closest('.history-item-wrap')) setOpenHistoryMenuId(null);
    }

    function handleEscape(event) {
      if (event.key !== 'Escape') return;
      setOpenHistoryMenuId(null);
      setIsSettingsOpen(false);
      setIsRecommendationDrawerOpen(false);
      setSelectedRecommendation(null);
      setIsMobileSidebarOpen(false);
    }

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function handleLogout() {
    logoutUser();
    setUser(null);
    setMessages([]);
    setCurrentRecommendations([]);
    setIsRecommendationDrawerOpen(false);
    setSelectedRecommendation(null);
    navigate('/login');
  }

  function openMobileSidebar() {
    setSidebarExpanded(true);
    setIsMobileSidebarOpen(true);
  }

  function closeMobileSidebar() {
    setIsMobileSidebarOpen(false);
    setSidebarExpanded(false);
  }

  function startNewChat() {
    navigate('/chat');
    setIsMobileSidebarOpen(false);
    setActiveChatId(null);
    setOpenHistoryMenuId(null);
    setMessages([]);
    setMessageInput('');
    setCurrentRecommendations([]);
    setActiveDrawerRecommendations([]);
    setIsRecommendationDrawerOpen(false);
    setSelectedRecommendation(null);
  }

  function loadHistory(chatId) {
    const item = chatHistory.find((entry) => entry.id === chatId);
    if (!item) return;
    setActiveChatId(chatId);
    setOpenHistoryMenuId(null);
    setMessages(item.messages.map((message) => ({ ...message, id: crypto.randomUUID() })));
    navigate('/chat');
    setIsMobileSidebarOpen(false);
  }

  function deleteHistory(chatId) {
    const item = chatHistory.find((entry) => entry.id === chatId);
    if (!item) return;
    const shouldDelete = window.confirm(`Delete chat "${item.title}"?`);
    if (!shouldDelete) {
      setOpenHistoryMenuId(null);
      return;
    }

    setChatHistory((prev) => {
      const next = prev.filter((entry) => entry.id !== chatId);
      if (activeChatId === chatId) {
        if (next.length > 0) {
          const fallback = next[0];
          setActiveChatId(fallback.id);
          setMessages(fallback.messages.map((message) => ({ ...message, id: crypto.randomUUID() })));
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
      return next;
    });
    setOpenHistoryMenuId(null);
  }

  function saveCurrentConversation(userText, botText) {
    const newMessages = [
      ...messages,
      { id: crypto.randomUUID(), sender: 'user', text: userText },
      { id: crypto.randomUUID(), sender: 'bot', text: botText }
    ];
    setMessages(newMessages);

    if (activeChatId) {
      setChatHistory((prev) => prev.map((item) => item.id === activeChatId ? {
        ...item,
        messages: newMessages.map(({ sender, text }) => ({ sender, text }))
      } : item));
      return;
    }

    const newHistoryItem = {
      id: crypto.randomUUID(),
      title: userText.slice(0, 32) || 'New chat',
      time: 'Just now',
      messages: newMessages.map(({ sender, text }) => ({ sender, text }))
    };
    setActiveChatId(newHistoryItem.id);
    setChatHistory((prev) => [newHistoryItem, ...prev]);
  }

  async function handleSendMessage(rawMessage) {
    const message = rawMessage.trim();
    if (!message || isChatLoading) return;

    setMessageInput('');
    setIsChatLoading(true);

    const userMessageId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: userMessageId, sender: 'user', text: message }]);

    try {
      const result = await sendChatMessage(message);
      const reply = result.reply || 'I processed your message, but no reply text was returned.';
      const backendRecommendations = adaptChatMatchesToRecommendations(result, message);

      setMessages((prev) => {
        const next = [...prev, { id: crypto.randomUUID(), sender: 'bot', text: reply }];
        const formattedHistoryMessages = next.map(({ sender, text }) => ({ sender, text }));

        if (user) {
          if (!activeChatId) {
            const historyItem = {
              id: crypto.randomUUID(),
              title: message.slice(0, 32) || 'New chat',
              time: 'Just now',
              messages: formattedHistoryMessages 
            };
            setActiveChatId(historyItem.id);
            setChatHistory((history) => [historyItem, ...history]);
          } else {
            setChatHistory((history) => 
              history.map((item) => 
                item.id === activeChatId ? { ...item, messages: formattedHistoryMessages } : item
              )
            );
          }
        }
        return next;
      });

      if (backendRecommendations && backendRecommendations.length > 0) {
        openRecommendationDrawer(backendRecommendations, { storeAsAiRecommendation: true });
      }
    } catch (error) {
      console.error("📋 Frontend Pipeline Catch Block Redirection:", error);
      const fallbackReply = 'I could not reach the backend right now, so I opened local prototype recommendations instead.';
      const fallbackRecommendations = getFallbackRecommendations(message);
      
      saveCurrentConversation(message, fallbackReply);
      openRecommendationDrawer(fallbackRecommendations, { storeAsAiRecommendation: true });
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: 'bot', text: fallbackReply }]);
    } finally {
      setIsChatLoading(false);
    }
  }

  function openRecommendationDrawer(recommendations = currentRecommendations, options = {}) {
    const nextRecommendations = Array.isArray(recommendations) ? recommendations.filter(Boolean) : [recommendations].filter(Boolean);
    setActiveDrawerRecommendations(nextRecommendations);
    setSelectedRecommendation(null);
    setIsRecommendationDrawerOpen(true);
    if (options.storeAsAiRecommendation) setCurrentRecommendations(nextRecommendations);
  }

  return (
    <>
      <div className={`mobile-sidebar-backdrop ${isMobileSidebarOpen ? 'active' : ''}`} onClick={closeMobileSidebar}></div>

      {/* 🛠️ CONDITIONAL SIDEBAR: Render only if a valid user profile exists */}
      {user ? (
        <Sidebar
          isExpanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded(prev => !prev)}
          activeView={activeView}
          onShowChat={() => { navigate('/chat'); setIsMobileSidebarOpen(false); }}
          onShowShop={() => { navigate('/shop'); setIsMobileSidebarOpen(false); }}
          onNewChat={startNewChat}
          chatHistory={chatHistory}
          activeChatId={activeChatId}
          openHistoryMenuId={openHistoryMenuId}
          onToggleHistoryMenu={(id) => setOpenHistoryMenuId((prev) => prev === id ? null : id)}
          onLoadHistory={loadHistory}
          onDeleteHistory={deleteHistory}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
          user={user}
        />
      ) : (
        /* Optional: CSS styling class layout spacer for a full-screen standalone guest page experience */
        <div className="guest-layout-spacer" />
      )}

      {/* ✨ Added layout class adjustments dynamically if guest mode is ongoing */}
      <main className={`app-shell ${!user ? 'public-guest-mode' : ''}`}>
        {showReopenButton && (
          <button className="recommendation-reopen-button" type="button" onClick={() => openRecommendationDrawer(currentRecommendations)}>
            Recommendations
          </button>
        )}

        <Routes>
          <Route path="/chat" element={
            <ChatView
              messages={messages}
              inputValue={messageInput}
              setInputValue={setMessageInput}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              onOpenSidebar={user ? openMobileSidebar : undefined} // Disable sidebar burger trigger if guest
            />
          } />

          <Route path="/shop" element={
            <ShopView 
              shops={shops} 
              onBrowseShop={(shop) => openRecommendationDrawer([shop])} 
              onOpenSidebar={user ? openMobileSidebar : undefined} 
            />
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute user={user} isBooting={isBooting}>
              <MerchantDashboard user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>

        {/* 🛠️ CONDITIONAL DASHBOARD BUTTON: Only visible to authenticated vendors */}
        {user && (
          <button className="dashboard-floating-button" onClick={() => { navigate('/dashboard'); setIsMobileSidebarOpen(false); }} type="button">
            Dashboard
          </button>
        )}
      </main>

      <RecommendationDrawer
        isOpen={isRecommendationDrawerOpen}
        recommendations={activeDrawerRecommendations}
        selectedRecommendation={selectedRecommendation}
        onClose={() => { setIsRecommendationDrawerOpen(false); setSelectedRecommendation(null); }}
        onShowDetails={setSelectedRecommendation}
        onBackToList={() => setSelectedRecommendation(null)}
        onContactSupplier={() => alert('Contact supplier action simulated.')}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}