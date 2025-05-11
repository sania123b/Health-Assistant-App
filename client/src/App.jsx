import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './components/SignupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        {/* You can add other routes for login, dashboard, etc. */}
      </Routes>
    </Router>
  );
}

export default App;
