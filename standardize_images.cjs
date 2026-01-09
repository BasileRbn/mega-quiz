const fs = require('fs');
const path = require('path');

const disneyDir = path.join(process.cwd(), 'public/images/quiz/disney');
const jsonPath = path.join(process.cwd(), 'src/data/characters.json');

if (!fs.existsSync(disneyDir)) {
    console.error("Dir not found");
    process.exit(1);
}

const files = fs.readdirSync(disneyDir).filter(f => !f.startsWith('.'));
const renames = {};

files.forEach(file => {
    if (file.endsWith('.jpeg')) {
        const newName = file.replace('.jpeg', '.jpg');
        fs.renameSync(path.join(disneyDir, file), path.join(disneyDir, newName));
        console.log(`Standardized: ${file} -> ${newName}`);
        renames[file] = newName;
    }
});

// Now update JSON to reflect any renaming (and ensure .png stays .png)
const finalFiles = fs.readdirSync(disneyDir).filter(f => !f.startsWith('.'));
let characterData = require(jsonPath);

// Rebuild Disney data from scratch based on current files
const disneyEntries = finalFiles.map(filename => {
    // Slug to display name
    const slug = path.basename(filename, path.extname(filename));
    const displayName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
        name: displayName,
        theme: 'disney',
        image: `/images/quiz/disney/${filename}`,
        options: [] // Filled below
    };
});

// Generate distractors
const allNames = disneyEntries.map(e => e.name);
disneyEntries.forEach(entry => {
    const others = allNames.filter(n => n !== entry.name);
    entry.options = others.sort(() => 0.5 - Math.random()).slice(0, 5);
});

// Merge
const otherData = characterData.filter(c => c.theme !== 'disney');
const finalData = [...disneyEntries, ...otherData];

fs.writeFileSync(jsonPath, JSON.stringify(finalData, null, 4));
console.log("JSON Updated with standardized paths.");
