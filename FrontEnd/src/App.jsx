import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import { getProfile, logoutUser } from './services/authService.js';
import { getToken } from './services/httpClient.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    async function boot() {
      const token = getToken();
      if (!token) {
        setIsBooting(false);
        return;
      }
      try {
        const profile = await getProfile();
        setUser(profile.data);
      } catch {
        logoutUser();
      } finally {
        setIsBooting(false);
      }
    }
    boot();
  }, []);

  // ✨ Handle loading guard strictly here so MainLayout is guaranteed structural data
  if (isBooting) {
    return <div className="boot-screen">Loading Nel-Jay...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Route */}
        <Route 
          path="/login" 
          element={!user ? <AuthPage onAuthenticated={setUser} /> : <Navigate to="/chat" replace />} 
        />

        {/* Dynamic Catch-All Architecture */}
        <Route 
          path="/*" 
          element={<MainLayout user={user} setUser={setUser} isBooting={isBooting} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}