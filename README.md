# Ville de France V1 - Mega Quiz 🇫🇷🌍

Bienvenue dans **Ville de France V1**, l'application de quiz géographique et culturel ultime !
Testez vos connaissances sur la France, le monde, et la pop culture à travers 5 modes de jeu passionnants.

## 🎮 Modes de Jeu

### 1. 🇫🇷 Villes de France

* **Objectif :** Localiser précisément une ville française donnée sur la carte vierge.
* **Règles :** 20 manches.
* **Chrono :** 15 secondes par manche.
* **Score :** Basé sur la distance (plus vous êtes près, plus vous marquez) + Multiplicateur de temps.

### 2. 🌍 Capitales du Monde

* **Objectif :** Trouver la capitale d'un pays sur la carte du monde.
* **Bonus :** Après la carte, devinez le drapeau du pays pour un bonus de **500 points**.
* **Règles :** 20 manches.
* **Chrono :** 15 secondes (phase carte).

### 3. 🗺️ Pays du Monde

* **Objectif :** Localiser un pays entier sur la carte du monde.
* **Phase 2 :** Identifier le drapeau associé.
* **Aide :** Joker 50/50 disponible pour les drapeaux.
* **Règles :** 20 manches.
* **Chrono :** 15 secondes.

### 4. 📜 Histoire de France

* **Objectif :** Retrouver le lieu d'un événement historique majeur (ex: "Sacre de Napoléon").
* **Anti-Spoiler :** Les noms de villes dans les questions sont masqués (ex: *"Siège de La R..."*).
* **Règles :** 20 manches.
* **Chrono :** 20 secondes (temps de lecture inclus).
* **Feedback :** La réponse s'affiche en haut à droite pour ne pas gêner la vue sur la carte.

### 5. ⚡ Quiz Personnages

* **Thèmes :** Disney, Pokémon.
* **Objectif :** Identifier le personnage à partir d'une image.
* **Aide :** Joker 50/50 (enlève la moitié des mauvaises réponses).
* **Règles :** 20 manches.
* **Chrono :** 15 secondes.

---

## 🏆 Système de Score & Règles

### Calcul des Points (Jeux de Carte)

Le score de base (max 1000 pts) est calculé en fonction de la distance entre votre clic et la cible réelle.

* **< 5 km** : 1000 points (Perfect !)
* **> 500 km** : 0 point.

### ⏱️ Multiplicateur de Vitesse

La rapidité est récompensée sur tous les jeux !

* **x3 Points** : Si vous répondez dans le **1er tiers** du temps imparti.
* **x2 Points** : Si vous répondez dans le **2ème tiers** du temps.
* **x1 Point** : Si vous répondez dans le **dernier tiers** (pas de bonus).
*(Le bonus ne s'applique que si la réponse est correcte).*

### Classement

À la fin de chaque partie, votre score est enregistré dans le **Leaderboard** global via Firebase.

---

## 🛠️ Stack Technique

* **Frontend :** React, Vite
* **Styles :** TailwindCSS, Vanilla CSS (Glassmorphism UI)
* **Carte :** Leaflet, React-Leaflet, GeoJSON
* **Backend / Hébergement :** Firebase (Hosting & Firestore)

## 🚀 Installation & Lancement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Déployer sur Firebase
firebase deploy
```

---
*Développé avec ❤️ pour les amateurs de géo et d'histoire.*
