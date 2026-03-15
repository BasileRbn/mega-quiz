import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import capitalsData from '../data/capitals.json';
import worldGeoJSON from '../data/world.geo.json';
import { shuffleArray, calculateTimeMultiplier } from '../utils/gameUtils';
import { useTimer } from '../hooks/useTimer';
import ScoreBoard from './ScoreBoard';
import Leaderboard from './Leaderboard';
import { ROUNDS_PER_GAME, TIME_LIMITS, FLAG_BONUS } from '../utils/constants';

const MapEffect = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [bounds, map]);
    return null;
};

const FlagQuiz = ({ targetCountry, onAnswer, onJoker, jokerUsed }) => {
    const [options, setOptions] = useState([]);
    const [disabledOptions, setDisabledOptions] = useState([]);
    const [step, setStep] = useState('choose');
    const [userChoiceIso, setUserChoiceIso] = useState(null);

    useEffect(() => {
        const distractors = shuffleArray(
            capitalsData.filter(c => c.iso !== targetCountry.iso)
        ).slice(0, 3);
        const allOptions = shuffleArray([targetCountry, ...distractors]);
        setOptions(allOptions);
    }, [targetCountry]);

    const handleJoker = () => {
        if (jokerUsed) return;
        const wrongOptions = options.filter(o => o.iso !== targetCountry.iso);
        const toDisable = wrongOptions.slice(0, 2).map(o => o.iso);
        setDisabledOptions(toDisable);
        onJoker();
    };

    const handleSelect = (iso) => {
        if (step !== 'choose' || disabledOptions.includes(iso)) return;
        setUserChoiceIso(iso);
        setStep('feedback');
        setTimeout(() => {
            onAnswer(iso);
        }, 1000);
    };

    return (
        <div className="absolute-cover z-max flex-center bg-black bg-opacity-80 backdrop-blur-md">
            <div className="modal-content glass-effect" style={{ maxWidth: '900px', background: 'rgba(255,255,255,0.95)' }}>
                <h2 className="title-gradient" style={{ fontSize: '2.5rem' }}>Bonus : Le Drapeau !</h2>
                <p className="subtitle mb-8 text-xl">Quel est le drapeau de : <strong className="text-blue-600">{targetCountry.country}</strong> ?</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                    {options.map((opt, i) => {
                        const isSelected = userChoiceIso === opt.iso;
                        const isCorrect = opt.iso === targetCountry.iso;
                        const isDisabled = disabledOptions.includes(opt.iso);

                        let cardStyle = {
                            width: '100%',
                            height: '140px',
                            borderRadius: '12px',
                            cursor: (step === 'choose' && !isDisabled) ? 'pointer' : 'default',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            border: '4px solid transparent',
                            transition: 'all 0.3s',
                            opacity: isDisabled ? 0.1 : 1,
                            objectFit: 'contain',
                            backgroundColor: '#f8fafc'
                        };

                        if (step === 'feedback') {
                            if (isCorrect) {
                                cardStyle.border = '4px solid #22c55e';
                                cardStyle.transform = 'scale(1.05)';
                                cardStyle.boxShadow = '0 0 20px #22c55e';
                                cardStyle.zIndex = 10;
                            } else if (isSelected) {
                                cardStyle.border = '4px solid #ef4444';
                                cardStyle.opacity = 0.8;
                            } else {
                                cardStyle.opacity = 0.5;
                            }
                        }

                        return (
                            <div key={i} className="flag-card-container" style={{ position: 'relative' }}>
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <img
                                        src={`https://flagcdn.com/w640/${opt.iso}.png`}
                                        alt={`Option ${i + 1}`}
                                        className={step === 'choose' && !isDisabled ? "flag-option hover:scale-105" : ""}
                                        style={cardStyle}
                                        onClick={() => handleSelect(opt.iso)}
                                    />
                                    {step === 'feedback' && isCorrect && (
                                        <div className="absolute-cover flex-center" style={{ background: 'rgba(34, 197, 94, 0.4)', borderRadius: '12px', pointerEvents: 'none' }}>
                                            <span style={{ fontSize: '3rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>✅</span>
                                        </div>
                                    )}
                                    {step === 'feedback' && isSelected && !isCorrect && (
                                        <div className="absolute-cover flex-center" style={{ background: 'rgba(239, 68, 68, 0.4)', borderRadius: '12px', pointerEvents: 'none' }}>
                                            <span style={{ fontSize: '3rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>❌</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center mt-8">
                    {!jokerUsed ? (
                        <button
                            onClick={handleJoker}
                            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-8 py-3 rounded-full text-xl font-bold shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <span>🃏</span> Joker 50/50
                        </button>
                    ) : (
                        <span className="text-gray-300 font-bold text-lg italic">Joker utilisé</span>
                    )}
                </div>
            </div>
        </div>
    );
};

const RoundFeedback = ({ mapResult, flagResult, targetCountry, onNext }) => {
    useEffect(() => {
        const timer = setTimeout(onNext, 4000);
        return () => clearTimeout(timer);
    }, [onNext]);

    const totalPoints = (mapResult?.points || 0) + (flagResult?.points || 0);

    return (
        <div className="absolute-cover z-max flex-center bg-black bg-opacity-90 backdrop-blur-xl">
            <div className="text-center animate-zoomIn space-y-6">
                <h1 className="text-5xl font-black text-white mb-4">Résultat du Round</h1>

                <div className="flex gap-8 justify-center">
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
                        <p className="text-gray-400 uppercase text-sm font-bold">Carte</p>
                        <p className={`text-3xl font-black ${mapResult.outcome === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                            {mapResult.outcome === 'correct' ? 'TROUVÉ' : 'RATÉ'}
                        </p>
                        <p className="text-xl text-white">+{mapResult.points} pts</p>
                    </div>

                    <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
                        <p className="text-gray-400 uppercase text-sm font-bold">Drapeau</p>
                        <p className={`text-3xl font-black ${flagResult?.outcome === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                            {flagResult?.outcome === 'correct' ? 'TROUVÉ' : 'RATÉ'}
                        </p>
                        <p className="text-xl text-white">+{flagResult?.points || 0} pts</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl shadow-2xl mt-8">
                    <p className="text-white text-lg font-medium">Pays Correct</p>
                    <h2 className="text-4xl font-black text-white mb-4">{targetCountry.country}</h2>
                    <img
                        src={`https://flagcdn.com/w640/${targetCountry.iso}.png`}
                        alt={`Drapeau de ${targetCountry.country}`}
                        className="w-48 mx-auto rounded-lg shadow-lg border-2 border-white/50"
                    />
                </div>
            </div>
        </div>
    );
};

const CountriesGame = ({ onExit }) => {
    const [gameStatus, setGameStatus] = useState('intro');
    const [rounds, setRounds] = useState([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedIso, setSelectedIso] = useState(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [mapResult, setMapResult] = useState(null);
    const [flagResult, setFlagResult] = useState(null);
    const [jokerUsed, setJokerUsed] = useState(false);

    useEffect(() => {
        setGeoJsonData(worldGeoJSON);
    }, []);

    const handleTimeout = useCallback(() => {
        if (gameStatus === 'playing_map') {
            submitResult(null);
        }
    }, [gameStatus]);

    const { timeLeft, resetTimer } = useTimer(
        TIME_LIMITS.countries,
        gameStatus === 'playing_map',
        handleTimeout
    );

    useEffect(() => {
        let timer;
        if (gameStatus === 'feedback_map') {
            timer = setTimeout(() => {
                setGameStatus('playing_flag');
            }, 4000);
        }
        return () => clearTimeout(timer);
    }, [gameStatus]);

    const startGame = () => {
        const shuffled = shuffleArray([...capitalsData]);
        setRounds(shuffled.slice(0, ROUNDS_PER_GAME));
        setCurrentRoundIndex(0);
        setScore(0);
        setGameStatus('playing_map');
        resetRound();
    };

    const resetRound = () => {
        setMapResult(null);
        setFlagResult(null);
        setJokerUsed(false);
        setSelectedIso(null);
        resetTimer(TIME_LIMITS.countries);
    };

    const handleCountryClick = (feature, layer, latlng) => {
        if (gameStatus !== 'playing_map') return;
        const clickedIso = feature ? feature.properties['ISO3166-1-Alpha-2']?.toLowerCase() : null;
        if (clickedIso) {
            setSelectedIso(clickedIso);
        }
    };

    const handleConfirm = () => {
        if (!selectedIso || gameStatus !== 'playing_map') return;
        submitResult(selectedIso);
    };

    const submitResult = (finalIso) => {
        const target = rounds[currentRoundIndex];
        const isCorrect = finalIso === target.iso.toLowerCase();
        const points = isCorrect ? calculateTimeMultiplier(1000, timeLeft) : 0;

        setScore(s => s + points);
        setMapResult({
            outcome: isCorrect ? 'correct' : 'wrong',
            points,
            clickedIso: finalIso,
            clickedPos: null,
            correctIso: target.iso
        });
        setGameStatus('feedback_map');
    };

    const handleFlagAnswer = (selectedFlagIso) => {
        const target = rounds[currentRoundIndex];
        const isCorrect = selectedFlagIso === target.iso;
        const points = isCorrect ? FLAG_BONUS : 0;

        setScore(s => s + points);
        setFlagResult({
            outcome: isCorrect ? 'correct' : 'wrong',
            points
        });
        setGameStatus('feedback_round');
    };

    const handleNextRound = () => {
        if (currentRoundIndex + 1 >= ROUNDS_PER_GAME) {
            setGameStatus('summary');
        } else {
            setCurrentRoundIndex(i => i + 1);
            resetRound();
            setGameStatus('playing_map');
        }
    };

    const style = (feature) => {
        const iso = feature.properties['ISO3166-1-Alpha-2']?.toLowerCase();
        let fillColor = '#1e293b';
        let className = "";
        let fillOpacity = 0.6;
        let weight = 1;
        let color = 'white';

        if (gameStatus === 'playing_map' && selectedIso && iso === selectedIso) {
            fillColor = '#3b82f6';
            fillOpacity = 0.8;
            weight = 2;
            color = '#60a5fa';
        }

        if (gameStatus === 'feedback_map' && mapResult) {
            const targetIso = mapResult.correctIso.toLowerCase();
            if (iso === targetIso) {
                className = "map-glow-green";
                fillColor = '#22c55e';
                fillOpacity = 0.9;
            } else if (mapResult.outcome === 'wrong' && iso === mapResult.clickedIso) {
                fillColor = '#ef4444';
                fillOpacity = 0.9;
            }
        }

        return { fillColor, weight, opacity: 1, color, fillOpacity, className };
    };

    const onEachFeature = (feature, layer) => {
        layer.on({
            click: (e) => handleCountryClick(feature, e.target, e.latlng),
            mouseover: (e) => {
                if (gameStatus === 'playing_map') {
                    e.target.setStyle({ weight: 3, color: '#facc15', fillOpacity: 0.8 });
                    e.target.bringToFront();
                }
            },
            mouseout: (e) => {
                if (gameStatus === 'playing_map') {
                    geoJsonLayer.current?.resetStyle(e.target);
                }
            }
        });
    };

    const geoJsonLayer = React.useRef();

    return (
        <div className="full-screen">
            <button className="btn-primary btn-menu" onClick={onExit}>
                🏠 Menu
            </button>

            {(gameStatus === 'playing_map' || gameStatus === 'feedback_map' || gameStatus === 'playing_flag' || gameStatus === 'feedback_round') && (
                <>
                    <div className="absolute-cover">
                        <MapContainer
                            style={{ height: '100%', width: '100%', backgroundColor: '#a5f3fc' }}
                            center={[20, 0]}
                            zoom={2}
                            zoomControl={false}
                            minZoom={2}
                            maxZoom={5}
                            maxBounds={[[-90, -180], [90, 180]]}
                        >
                            <MapEffect bounds={null} />
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                                attribution='&copy; OpenStreetMap'
                                opacity={0.6}
                            />
                            {geoJsonData && (
                                <GeoJSON
                                    key={`geojson-${currentRoundIndex}`}
                                    ref={geoJsonLayer}
                                    data={geoJsonData}
                                    style={style}
                                    onEachFeature={onEachFeature}
                                />
                            )}

                            {gameStatus === 'feedback_map' && mapResult && (
                                <>
                                    {mapResult.outcome === 'wrong' && mapResult.clickedPos && (
                                        <Marker
                                            position={mapResult.clickedPos}
                                            icon={L.divIcon({
                                                className: 'custom-icon',
                                                html: '<div style="font-size: 40px; filter: drop-shadow(0 0 4px white);">❌</div>',
                                                iconSize: [40, 40],
                                                iconAnchor: [20, 20]
                                            })}
                                        >
                                            <Tooltip permanent direction="top" offset={[0, -20]} className="font-bold text-red-600 bg-white border-2 border-red-500 rounded-lg shadow-lg">
                                                Mauvaise réponse
                                            </Tooltip>
                                        </Marker>
                                    )}
                                    {mapResult.outcome === 'wrong' && rounds[currentRoundIndex] && (
                                        <Marker
                                            position={[rounds[currentRoundIndex].lat, rounds[currentRoundIndex].lng]}
                                            icon={L.divIcon({
                                                className: 'custom-icon',
                                                html: '<div style="font-size: 50px; filter: drop-shadow(0 0 4px white);">📍</div>',
                                                iconSize: [50, 50],
                                                iconAnchor: [25, 50]
                                            })}
                                        >
                                            <Tooltip permanent direction="top" offset={[0, -45]} className="font-bold text-green-600 bg-white border-2 border-green-500 rounded-lg shadow-lg">
                                                Le pays était ici
                                            </Tooltip>
                                        </Marker>
                                    )}
                                </>
                            )}
                        </MapContainer>
                    </div>

                    {gameStatus === 'playing_map' && selectedIso && (
                        <div style={{
                            position: 'absolute',
                            bottom: '140px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 999
                        }}>
                            <button
                                onClick={handleConfirm}
                                className="btn-primary confirm-btn"
                                style={{
                                    fontSize: '1.5rem',
                                    padding: '1rem 3rem',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                    border: '3px solid white',
                                    backgroundColor: '#22c55e'
                                }}
                            >
                                VALIDER ✅
                            </button>
                        </div>
                    )}

                    <ScoreBoard
                        score={score}
                        round={currentRoundIndex + 1}
                        totalRounds={ROUNDS_PER_GAME}
                        targetCity={{ name: rounds[currentRoundIndex]?.country }}
                        timer={gameStatus === 'playing_map' ? timeLeft : null}
                        maxTime={TIME_LIMITS.countries}
                        lastResult={null}
                        containerClassName="hud-bottom-left"
                    />

                    {gameStatus === 'playing_flag' && (
                        <FlagQuiz
                            targetCountry={rounds[currentRoundIndex]}
                            onAnswer={handleFlagAnswer}
                            onJoker={() => setJokerUsed(true)}
                            jokerUsed={jokerUsed}
                        />
                    )}

                    {gameStatus === 'feedback_round' && (
                        <RoundFeedback
                            mapResult={mapResult}
                            flagResult={flagResult}
                            targetCountry={rounds[currentRoundIndex]}
                            onNext={handleNextRound}
                        />
                    )}
                </>
            )}

            {gameStatus === 'intro' && (
                <div className="absolute-cover modal-overlay z-high">
                    <div className="modal-content glass-effect">
                        <span className="text-6xl mb-4">🌍</span>
                        <h1 className="title-gradient">PAYS DU MONDE</h1>
                        <p className="subtitle">Trouvez les pays sur la carte !</p>
                        <p className="mb-4 text-sm text-gray-500">Localisez le pays (Phase 1) puis son drapeau (Phase 2)</p>
                        <button onClick={startGame} className="btn-primary">Commencer</button>
                    </div>
                </div>
            )}

            {gameStatus === 'summary' && (
                <div className="absolute-cover modal-overlay z-high">
                    <Leaderboard finalScore={score} onRestart={startGame} gameMode="countries" />
                </div>
            )}
        </div>
    );
};

export default CountriesGame;
