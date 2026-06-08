import { Routes, Route, Navigate } from 'react-router-dom';
import { getStoredToken } from '@/lib/supabase';
import Home  from '@/pages/Home';
import Admin from '@/pages/Admin';
import Login from '@/pages/Login';

function RequireAuth({ children }: { children: React.ReactNode }) {
  return getStoredToken() ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<Home />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin"       element={<RequireAuth><Admin /></RequireAuth>} />
    </Routes>
  );
}
