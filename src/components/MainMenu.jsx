import React from 'react';

const MainMenu = ({ onSelectGame }) => {
    return (
        <div className="absolute-cover z-high flex-center"
            style={{
                backgroundImage: 'url(/assets/bg_main.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="modal-content glass-effect" style={{ maxWidth: '1400px', width: '95%', background: 'rgba(255,255,255,0.7)', paddingBottom: '3rem' }}>
                <h1 className="title-gradient main-title" style={{ marginBottom: '0.5rem' }}>MEGA QUIZ</h1>
                <p className="subtitle" style={{ color: '#1e293b', fontWeight: 'bold' }}>L'expérience géographique & culturelle ultime</p>

                <div className="menu-grid">
                    {/* Mode 1 */}
                    <div className="menu-card" onClick={() => onSelectGame('france')}>
                        <div className="card-icon" style={{ fontSize: '6rem' }}>🇫🇷</div>
                        <h3>Villes de France</h3>
                        <p>Trouvez les villes sur la carte de France.</p>
                    </div>

                    {/* Mode 2 */}
                    <div className="menu-card" onClick={() => onSelectGame('world')}>
                        <div className="card-icon" style={{ fontSize: '6rem' }}>🌍</div>
                        <h3>Capitales du Monde</h3>
                        <p>Trouvez la capitale + Bonus Drapeau.</p>
                    </div>

                    {/* Mode 3 */}
                    <div className="menu-card" onClick={() => onSelectGame('quiz')}>
                        <div className="card-icon" style={{ fontSize: '6rem' }}>⚡</div>
                        <h3>Quiz Personnages</h3>
                        <p>Disney, Pokémon... Deviens l'expert !</p>
                    </div>

                    {/* Mode 4 */}
                    <div className="menu-card" onClick={() => onSelectGame('countries')}>
                        <div className="card-icon" style={{ fontSize: '6rem' }}>🗺️</div>
                        <h3>Pays du Monde</h3>
                        <p>Trouvez les pays sur la carte du monde !</p>
                    </div>

                    {/* Mode 5 */}
                    <div className="menu-card" onClick={() => onSelectGame('history')}>
                        <div className="card-icon" style={{ fontSize: '6rem' }}>📜</div>
                        <h3>Histoire de France</h3>
                        <p>Jeanne d'Arc, Napoléon... Les lieux cultes !</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;

