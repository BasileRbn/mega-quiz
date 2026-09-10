import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Le découpage du bundle se fait naturellement grâce aux imports lazy()
  // des jeux dans App.jsx (les cartes Leaflet et les données géo ne sont
  // chargées qu'à l'ouverture d'un jeu de carte). Pas de manualChunks :
  // un découpage manuel react/leaflet créait une dépendance circulaire
  // entre chunks qui plantait l'app en production.
})
