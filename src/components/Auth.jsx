import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Set default display name and avatar
                await updateProfile(userCredential.user, {
                    displayName: username || 'Joueur',
                    photoURL: '/images/avatars/default_user.png'
                });
            }
            onLogin(); // Callback to parent
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="absolute-cover z-max flex-center modal-overlay">
            <div className="modal-content glass-effect" style={{ maxWidth: '400px' }}>
                <h2 className="title-gradient">{isLogin ? 'Connexion' : 'Inscription'}</h2>

                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Pseudo"
                            className="leaderboard-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="leaderboard-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        className="leaderboard-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        {isLogin ? 'Se Connecter' : "S'inscrire"}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', color: '#64748b' }}>
                    {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <span
                        style={{ color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', marginLeft: '0.5rem' }}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Créer un compte" : "Se connecter"}
                    </span>
                </p>

                <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8', cursor: 'pointer' }} onClick={onLogin}>
                    Continuer en Invité (Sans sauvegarde)
                </p>
            </div>
        </div>
    );
};

export default Auth;
