import React, { useState, lazy, Suspense } from 'react';
import MainMenu from './components/MainMenu';
import './App.css';
import './styles/game.css';

// Chargement à la demande : chaque jeu n'est téléchargé qu'au premier lancement.
// Les gros jeux de carte (Leaflet + données géo) ne ralentissent plus l'accueil.
const FranceGame = lazy(() => import('./components/FranceGame'));
const WorldGame = lazy(() => import('./components/WorldGame'));
const QuizGame = lazy(() => import('./components/QuizGame'));
const CountriesGame = lazy(() => import('./components/CountriesGame'));
const HistoryGame = lazy(() => import('./components/HistoryGame'));
const MemoryGame = lazy(() => import('./components/MemoryGame'));
const MathGame = lazy(() => import('./components/MathGame'));
const SimonGame = lazy(() => import('./components/SimonGame'));
const SpaceInvadersGame = lazy(() => import('./components/SpaceInvadersGame'));
const WordGame = lazy(() => import('./components/WordGame'));
const WhoGame = lazy(() => import('./components/WhoGame'));

const GameLoader = () => (
  <div className="full-screen flex-center">
    <div className="game-loader">
      <span className="game-loader-emoji">🎮</span>
      <p>Chargement du jeu…</p>
    </div>
  </div>
);

function App() {
  const [currentScreen, setCurrentScreen] = useState('menu'); // menu, france, world, quiz, countries, history, memory, math, simon, action

  const renderScreen = () => {
    const exit = () => setCurrentScreen('menu');
    switch (currentScreen) {
      case 'france':
        return <FranceGame onExit={exit} />;
      case 'world':
        return <WorldGame onExit={exit} />;
      case 'quiz':
        return <QuizGame onExit={exit} />;
      case 'countries':
        return <CountriesGame onExit={exit} />;
      case 'history':
        return <HistoryGame onExit={exit} />;
      case 'memory':
        return <MemoryGame onExit={exit} />;
      case 'math':
        return <MathGame onExit={exit} />;
      case 'simon':
        return <SimonGame onExit={exit} />;
      case 'invaders':
        return <SpaceInvadersGame onExit={exit} />;
      case 'words':
        return <WordGame onExit={exit} />;
      case 'who':
        return <WhoGame onExit={exit} />;
      case 'menu':
      default:
        return <MainMenu onSelectGame={(mode) => setCurrentScreen(mode)} />;
    }
  };

  return (
    <Suspense fallback={<GameLoader />}>
      {renderScreen()}
    </Suspense>
  );
}

export default App;
