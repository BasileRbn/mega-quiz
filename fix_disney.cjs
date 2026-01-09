const fs = require("fs");
const path = require("path");

const disneyDir = path.join(__dirname, "public/images/quiz/disney");
const charactersPath = path.join(__dirname, "src/data/characters.json");

// 1. Read and Clean Files
const files = fs.readdirSync(disneyDir);
const disneyList = [];

files.forEach(file => {
    if (file.startsWith(".")) return; // Skip .DS_Store
    if (file.toLowerCase().endsWith(".json")) return;

    // Normalization
    let newName = file
        .normalize("NFC")
        .trim()
        .replace(/\s+/g, "_"); // Spaces to underscores
    
    // Rename if needed
    if (newName !== file) {
        fs.renameSync(path.join(disneyDir, file), path.join(disneyDir, newName));
        console.log(`Renamed: "${file}" -> "${newName}"`);
    }

    // Build Entry
    const ext = path.extname(newName);
    // Prefer PNG/JPG/WEBP
    if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext.toLowerCase())) return;

    const nameWithoutExt = path.parse(newName).name.replace(/_/g, " "); // Name for UI (Space instead of underscore)
    
    // Check if we already have this name (avoid duplicates like "Mickey Mouse" vs "Mickey Mouse 2" if we want distinct questions?)
    // Actually, "Mickey Mouse 2" is fine as a name if the user wants variety. 
    // But ideally we might want to group them? 
    // Let's just add them all for now.
    
    disneyList.push({
        name: nameWithoutExt,
        theme: "disney",
        image: `/images/quiz/disney/${newName}`,
        options: [] // Will fill later
    });
});

// 2. Generate Options (Use names from the list itself as distractors)
disneyList.forEach(p => {
    const others = disneyList.filter(o => o.name !== p.name);
    p.options = others
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .map(o => o.name);
});

// 3. Update characters.json
// Read existing data to preserve Pokemon
const existingData = JSON.parse(fs.readFileSync(charactersPath, "utf8"));
const pokemonData = existingData.filter(c => c.theme === "pokemon");

// Filter out old disney/starwars/dino, keep pokemon, add new disney
const finalData = [...pokemonData, ...disneyList];

fs.writeFileSync(charactersPath, JSON.stringify(finalData, null, 4));
console.log(`Updated characters.json with ${disneyList.length} Disney entries.`);

