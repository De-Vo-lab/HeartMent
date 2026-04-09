import Auth from './pages/Auth';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/app" element={<HeartMendApp />} />
    </Routes>
  );
}

export default App;
