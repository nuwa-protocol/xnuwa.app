import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotePage from './pages/NotePage';

function App() {
  return (
    <Router>
      <div className="font-sans antialiased bg-background">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/note" element={<NotePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
