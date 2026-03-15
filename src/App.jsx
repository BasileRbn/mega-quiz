import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import FranceGame from './components/FranceGame';
import WorldGame from './components/WorldGame';
import QuizGame from './components/QuizGame';
import CountriesGame from './components/CountriesGame';
import HistoryGame from './components/HistoryGame';
import StatsPanel from './components/StatsPanel';
import AchievementToast from './components/AchievementToast';
import './App.css';
import './styles/game.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [showStats, setShowStats] = useState(false);
  const [achievementToast, setAchievementToast] = useState(null);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'france':
        return <FranceGame onExit={() => setCurrentScreen('menu')} />;
      case 'world':
        return <WorldGame onExit={() => setCurrentScreen('menu')} />;
      case 'quiz':
        return <QuizGame onExit={() => setCurrentScreen('menu')} />;
      case 'countries':
        return <CountriesGame onExit={() => setCurrentScreen('menu')} />;
      case 'history':
        return <HistoryGame onExit={() => setCurrentScreen('menu')} />;
      case 'menu':
      default:
        return <MainMenu onSelectGame={(mode) => setCurrentScreen(mode)} onShowStats={() => setShowStats(true)} />;
    }
  };

  return (
    <>
      {renderScreen()}
      {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
      {achievementToast && (
        <AchievementToast
          achievement={achievementToast}
          onDone={() => setAchievementToast(null)}
        />
      )}
    </>
  );
}

export default App;
