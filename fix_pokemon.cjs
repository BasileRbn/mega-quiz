const fs = require("fs");
const path = require("path");

const imagesDir = path.join(__dirname, "public/images/quiz/pokemon");
const charactersPath = path.join(__dirname, "src/data/characters.json");

// 1. Read and Clean Files
const files = fs.readdirSync(imagesDir);
const pokemonList = [];

files.forEach(file => {
    if (file.startsWith(".")) return; // Skip .DS_Store

    let newName = file
        .normalize("NFC") // Fix decomposed accents
        .trim()
        .replace(/\s+/g, "_"); // Spaces to underscores
    
    // Rename if different
    if (newName !== file) {
        fs.renameSync(path.join(imagesDir, file), path.join(imagesDir, newName));
        console.log(`Renamed: "${file}" -> "${newName}"`);
    }

    // Build Entry
    const nameWithoutExt = path.parse(newName).name.replace(/_/g, " "); // Name for UI
    pokemonList.push({
        name: nameWithoutExt,
        theme: "pokemon",
        image: `/images/quiz/pokemon/${newName}`,
        options: [] // Will fill later
    });
});

// 2. Generate Options
pokemonList.forEach(p => {
    const others = pokemonList.filter(o => o.name !== p.name);
    p.options = others
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .map(o => o.name);
});

// 3. Update characters.json
const existingData = JSON.parse(fs.readFileSync(charactersPath, "utf8"));
const disneyData = existingData.filter(c => c.theme === "disney" && c.theme !== "starwars" && c.theme !== "dinosaures" && c.theme !== "pokemon");

const finalData = [...disneyData, ...pokemonList];

fs.writeFileSync(charactersPath, JSON.stringify(finalData, null, 4));
console.log(`Updated characters.json with ${pokemonList.length} Pokemon entries.`);

