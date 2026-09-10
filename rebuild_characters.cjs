// Régénère src/data/characters.json à partir des images, avec des noms propres
// et des options de réponse cohérentes (5 mauvaises réponses par question).
// Usage: node rebuild_characters.cjs
const fs = require("fs");
const path = require("path");

const DISNEY_DIR = path.join(__dirname, "public/images/quiz/disney");
const POKEMON_DIR = path.join(__dirname, "public/images/quiz/pokemon");
const OUT = path.join(__dirname, "src/data/characters.json");

// Noms d'affichage corrects pour les fichiers Disney (fichier -> nom)
const DISNEY_NAMES = {
    "Capitaine_crochet": "Capitaine Crochet",
    "Colonel": "Le Colonel",
    "Flêche_parr": "Flèche Parr",
    "Generalli": "Général Li",
    "La_bête": "La Bête",
    "La_reine_de_coeur": "La Reine de Cœur",
    "Marraine_la_bonne_fée": "Marraine la Bonne Fée",
    "aladdin": "Aladdin",
    "anna": "Anna",
    "ariel": "Ariel",
    "arlo": "Arlo",
    "arthur": "Arthur",
    "atchoum": "Atchoum",
    "belle": "Belle",
    "blanche-neige": "Blanche-Neige",
    "buzz_éclair": "Buzz l'Éclair",
    "cendrillon": "Cendrillon",
    "clochard": "Clochard",
    "cruella_enfer": "Cruella d'Enfer",
    "crush": "Crush",
    "dingo": "Dingo",
    "donald_duck": "Donald Duck",
    "donald_duck_2": "Donald Duck",
    "dormeur": "Dormeur",
    "duchesse": "Duchesse",
    "dumbo": "Dumbo",
    "elsa": "Elsa",
    "flash_slothmore": "Flash",
    "gaston": "Gaston",
    "grincheux": "Grincheux",
    "hans": "Hans",
    "henry_blaise": "Henry Blaise",
    "jafar": "Jafar",
    "jane_porter": "Jane",
    "jasmine": "Jasmine",
    "jiminy_cricket": "Jiminy Cricket",
    "kaa": "Kaa",
    "kuzco": "Kuzco",
    "le_genie": "Le Génie",
    "le_prince_jean": "Prince Jean",
    "le_roi_leonidas": "Le Roi Léonidas",
    "le_sherif_de_nottingham": "Le Shérif de Nottingham",
    "les_vautours": "Les Vautours",
    "lilo": "Lilo",
    "maléfique": "Maléfique",
    "merlin": "Merlin",
    "mickey_mouse": "Mickey Mouse",
    "mickey_mouse_3": "Mickey Mouse",
    "mini": "Minnie",
    "mufasa": "Mufasa",
    "mulan": "Mulan",
    "mushu": "Mushu",
    "narcisse": "Narcisse",
    "olaf": "Olaf",
    "pat_hibulaire": "Pat Hibulaire",
    "picsou": "Picsou",
    "picsou_2": "Picsou",
    "pinochio": "Pinocchio",
    "plutot": "Pluto",
    "pocahontas": "Pocahontas",
    "pongo": "Pongo",
    "prof": "Prof",
    "pumbaa": "Pumbaa",
    "pégase": "Pégase",
    "quasimodo": "Quasimodo",
    "rafiki": "Rafiki",
    "raja": "Rajah",
    "remy": "Rémy",
    "robert-bob-parr": "Bob Parr",
    "scar": "Scar",
    "shere_khan": "Shere Khan",
    "simba": "Simba",
    "sonic": "Sonic",
    "stitch": "Stitch",
    "stitch_2": "Stitch",
    "sven": "Sven",
    "sébastien": "Sébastien",
    "tarzan": "Tarzan",
    "thomas": "Thomas",
    "tic_et_tac": "Tic et Tac",
    "timide": "Timide",
    "ursula": "Ursula",
    "winnie_l_ourson": "Winnie l'Ourson",
    "zazu": "Zazu",
};

// Corrections de noms Pokémon (fichier -> nom). Les autres gardent le nom du fichier.
const POKEMON_FIXES = {
    "Couafarel_Sauvage_": "Couafarel",
    "Floette_Rouge_": "Floette",
    "Dracaufeu_2": "Dracaufeu",
    "Démolosse_2": "Démolosse",
    "Debugant": "Débugant",
};

function buildTheme(dir, theme, urlPrefix, nameMap, fixes) {
    const files = fs.readdirSync(dir).filter(f => !f.startsWith(".") && /\.(png|jpe?g|webp)$/i.test(f));
    const entries = files.map(file => {
        const base = path.parse(file).name.normalize("NFC");
        let name;
        if (nameMap) {
            name = nameMap[base];
            if (!name) {
                console.warn(`⚠️  nom manquant pour ${theme}/${file}, nom généré automatiquement`);
                name = base.replace(/_/g, " ").trim();
            }
        } else {
            name = (fixes && fixes[base]) || base.replace(/_/g, " ").trim();
        }
        return { name, theme, image: `${urlPrefix}/${file}`, options: [] };
    });

    // 5 mauvaises réponses uniques, différentes du nom correct
    entries.forEach(e => {
        const distractors = [...new Set(entries.map(o => o.name))].filter(n => n !== e.name);
        e.options = distractors.sort(() => 0.5 - Math.random()).slice(0, 5);
    });
    return entries;
}

const disney = buildTheme(DISNEY_DIR, "disney", "/images/quiz/disney", DISNEY_NAMES, null);
const pokemon = buildTheme(POKEMON_DIR, "pokemon", "/images/quiz/pokemon", null, POKEMON_FIXES);

const all = [...disney, ...pokemon];
fs.writeFileSync(OUT, JSON.stringify(all, null, 4));
console.log(`✅ characters.json régénéré : ${disney.length} Disney + ${pokemon.length} Pokémon = ${all.length}`);
