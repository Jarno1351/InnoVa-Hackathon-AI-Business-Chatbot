import { Navigate } from 'react-router-dom';

/**
 * Reusable Route Guard
 * Handles system booting screens and secures paths from unauthenticated users.
 */
export default function ProtectedRoute({ user, isBooting, children }) {
  if (isBooting) {
    return <div className="boot-screen">Loading Nel-Jay...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}