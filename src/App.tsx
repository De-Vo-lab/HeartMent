import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import HeartMendApp from './pages/HeartMendApp';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/app" element={<HeartMendApp />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
