const fs = require('fs');
const path = require('path');

const disneyDir = path.join(process.cwd(), 'public/images/quiz/disney');
const jsonPath = path.join(process.cwd(), 'src/data/characters.json');

// Helper to slugify
const toSafeName = (str) => {
    return str
        .toLowerCase()
        .replace(/['’]/g, '') // remove apostrophes
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9.]/g, '-') // replace non-alphanum with hyphen
        .replace(/-+/g, '-') // collapse hyphens
        .replace(/^-|-$/g, ''); // trim hyphens
};

if (!fs.existsSync(disneyDir)) {
    console.error("Disney dir not found:", disneyDir);
    process.exit(1);
}

const files = fs.readdirSync(disneyDir).filter(f => !f.startsWith('.'));
let characterData = require(jsonPath);

// Create a map of old -> new filenames
const renames = {};

files.forEach(file => {
    const ext = path.extname(file);
    const name = path.basename(file, ext);
    const safeName = toSafeName(name) + ext.toLowerCase();

    if (file !== safeName) {
        fs.renameSync(path.join(disneyDir, file), path.join(disneyDir, safeName));
        console.log(`Renamed: "${file}" -> "${safeName}"`);
    }

    // Store mapping for JSON update (using original name as key roughly)
    // We need to match the "name" field in JSON to this file.
    // The previous script set name = cleanName(filename).
    // So if file was "Mickey Mouse .png", name was "Mickey Mouse".
    // We should try to find the JSON entry that matches this file.

    // Actually, asking the script to rebuild the disney section is safer.
    renames[safeName] = true;
});

// Re-read dir to get final list
const newFiles = fs.readdirSync(disneyDir).filter(f => !f.startsWith('.'));

// Rebuild Disney section of JSON
const disneyEntries = newFiles.map(filename => {
    // Reconstruct a nice display name from the slug?
    // Or try to keep the old one?
    // Better: just format the slug back to Title Case
    const slug = path.basename(filename, path.extname(filename));
    const displayName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Generate distractors
    const allNames = newFiles.map(f => {
        const s = path.basename(f, path.extname(f));
        return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    });

    const otherNames = allNames.filter(n => n !== displayName);
    const distractors = otherNames.sort(() => 0.5 - Math.random()).slice(0, 5);

    return {
        name: displayName,
        theme: 'disney',
        image: `/images/quiz/disney/${filename}`,
        options: distractors
    };
});

// Filter out old Disney, keep Star Wars & Dino
const otherData = characterData.filter(c => c.theme !== 'disney');
const finalData = [...disneyEntries, ...otherData];

fs.writeFileSync(jsonPath, JSON.stringify(finalData, null, 4));
console.log("Done.");
