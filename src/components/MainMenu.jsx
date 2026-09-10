import React from 'react';
import HallOfFame from './HallOfFame';

const GAMES = [
    { id: 'france', icon: '🇫🇷', title: 'Villes de France', desc: 'Trouve les villes sur la carte de France.', color: 'card-france' },
    { id: 'world', icon: '🌍', title: 'Capitales du Monde', desc: 'Trouve la capitale + Bonus Drapeau.', color: 'card-world' },
    { id: 'quiz', icon: '⚡', title: 'Quiz Personnages', desc: 'Disney, Pokémon… Deviens un expert !', color: 'card-quiz' },
    { id: 'countries', icon: '🗺️', title: 'Pays du Monde', desc: 'Trouve les pays sur la carte du monde !', color: 'card-countries' },
    { id: 'history', icon: '📜', title: 'Histoire de France', desc: "Jeanne d'Arc, Napoléon… Les lieux cultes !", color: 'card-history' },
    { id: 'memory', icon: '🃏', title: 'Memory', desc: 'Retrouve les paires Disney et Pokémon !', color: 'card-memory', badge: 'Nouveau' },
    { id: 'math', icon: '🧮', title: 'Calcul Magique', desc: 'Additions, soustractions, multiplications !', color: 'card-math', badge: 'Nouveau' },
    { id: 'simon', icon: '🌈', title: 'Simon des Couleurs', desc: 'Mémorise la suite de couleurs !', color: 'card-simon', badge: 'Nouveau' },
    { id: 'invaders', icon: '👾', title: 'Space Invaders', desc: 'Repousse les vagues d’aliens, toujours plus vite !', color: 'card-action', badge: 'Nouveau' },
    { id: 'words', icon: '📖', title: 'Le Mot Mystère', desc: 'Devine le mot grâce à sa définition !', color: 'card-words', badge: 'Nouveau' },
    { id: 'who', icon: '🕵️', title: 'Qui suis-je ?', desc: 'Devine le personnage ou la célébrité !', color: 'card-who', badge: 'Nouveau' },
];

const MainMenu = ({ onSelectGame }) => {
    return (
        <div className="absolute-cover z-high flex-center">
            <div className="bg-bubbles">
                <span /><span /><span /><span /><span /><span /><span />
            </div>
            <div className="modal-content glass-effect" style={{ maxWidth: '1400px', width: '95%', paddingBottom: '2.5rem', position: 'relative', zIndex: 2 }}>
                <div className="menu-hero">
                    <div style={{ fontSize: '3rem', lineHeight: 1 }} className="floaty">🎮</div>
                    <h1 className="title-gradient main-title" style={{ marginBottom: '0.25rem' }}>MÉGA QUIZ</h1>
                    <p className="subtitle" style={{ marginBottom: '0.5rem' }}>11 jeux pour devenir un super champion !</p>
                </div>

                <HallOfFame />

                <div className="menu-grid">
                    {GAMES.map(game => (
                        <div key={game.id} className={`menu-card ${game.color}`} onClick={() => onSelectGame(game.id)}>
                            {game.badge && <span className="card-badge">{game.badge}</span>}
                            <div className="card-icon">{game.icon}</div>
                            <div>
                                <h3>{game.title}</h3>
                                <p>{game.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
