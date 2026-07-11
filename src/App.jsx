import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import WordSearch from './pages/WordSearch/WordSearch';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word-search" element={<WordSearch />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
