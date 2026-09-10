import React from 'react';
import TextQuizGame from './TextQuizGame';
import { CELEBRITIES_LEVELS } from '../data/celebrities';

// Qui suis-je ? : une description de personnage ou de célébrité, à deviner
const WhoGame = ({ onExit }) => (
    <TextQuizGame
        onExit={onExit}
        config={{
            emoji: '🕵️',
            title: 'QUI SUIS-JE ?',
            subtitle: 'Devine un maximum de personnages. À 3 erreurs, la partie est terminée !',
            levels: CELEBRITIES_LEVELS,
            gameMode: 'who',
            survival: true,
        }}
    />
);

export default WhoGame;
