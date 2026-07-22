import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import WordSearch from './pages/WordSearch/WordSearch';
import FindEmoji from './pages/FindEmoji/FindEmoji';
import TicTacToe from './pages/TicTacToe/TicTacToe';
import MentalMath from './pages/MentalMath/MentalMath';
import Othello from './pages/Othello/Othello';

import Billiards from './pages/Billiards/Billiards';
import ShadowHunter from './pages/ShadowHunter/ShadowHunter';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: 'black', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Game Crashed</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/word-search" element={<WordSearch />} />
            <Route path="/find-emoji" element={<FindEmoji />} />
            <Route path="/tic-tac-toe" element={<TicTacToe />} />
            <Route path="/mental-math" element={<MentalMath />} />
            <Route path="/othello" element={<Othello />} />
            <Route path="/billiards" element={<Billiards />} />
            <Route path="/shadow-hunter" element={<ShadowHunter />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
