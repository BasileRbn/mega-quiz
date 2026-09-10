import React from 'react';
import TextQuizGame from './TextQuizGame';
import { DICTIONARY_LEVELS } from '../data/dictionary';

// Le Mot Mystère : une définition du dictionnaire, il faut trouver le mot
const WordGame = ({ onExit }) => (
    <TextQuizGame
        onExit={onExit}
        config={{
            emoji: '📖',
            title: 'LE MOT MYSTÈRE',
            subtitle: 'Lis la définition du dictionnaire et trouve le bon mot !',
            levels: DICTIONARY_LEVELS,
            gameMode: 'words',
        }}
    />
);

export default WordGame;
