import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle clicks and map bounds
const MapEvents = ({ onGuess, bounds, trigger }) => {
    const map = useMap();

    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map, trigger]); // Trigger reset when round changes

    useMapEvents({
        click(e) {
            onGuess(e.latlng);
        },
    });
    return null;
};

const MapGame = ({ target, result, onGuess, bounds }) => {
    const [guessMarker, setGuessMarker] = useState(null);

    // Reset marker when round changes
    useEffect(() => {
        if (!result) {
            setGuessMarker(null);
        }
    }, [target]);

    const handleMapClick = (latlng) => {
        if (result) return; // Prevent guessing if round already over
        setGuessMarker(latlng);
        onGuess(latlng); // Immediate guess
    };

    return (
        <div className="absolute-cover">
            <MapContainer
                zoomControl={false}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                // Center/Zoom will be handled by MapEvents via fitBounds
                center={[46.603354, 1.888334]} // Fallback center (France)
                zoom={6} // Fallback zoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
                />

                <MapEvents onGuess={handleMapClick} bounds={bounds} trigger={target} />

                {/* Show Guess Marker */}
                {guessMarker && <Marker position={guessMarker} />}

                {/* Show Target Marker (only after result) */}
                {result && target && (
                    <Marker position={[target.lat, target.lng]} icon={DefaultIcon} /> // You might want a different icon for correct location
                )}

                {/* Draw Line */}
                {result && guessMarker && target && (
                    <Polyline
                        positions={[
                            [guessMarker.lat, guessMarker.lng],
                            [target.lat, target.lng]
                        ]}
                        color="red"
                        dashArray="10, 10"
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapGame;
