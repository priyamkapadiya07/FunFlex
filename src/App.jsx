import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import WordSearch from './pages/WordSearch/WordSearch';
import FindEmoji from './pages/FindEmoji/FindEmoji';
import TicTacToe from './pages/TicTacToe/TicTacToe';
import MentalMath from './pages/MentalMath/MentalMath';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word-search" element={<WordSearch />} />
          <Route path="/find-emoji" element={<FindEmoji />} />
          <Route path="/tic-tac-toe" element={<TicTacToe />} />
          <Route path="/mental-math" element={<MentalMath />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
