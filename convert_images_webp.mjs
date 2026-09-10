// Convertit les images du quiz en WebP (plus léger, transparence conservée)
// Usage: node convert_images_webp.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const DIRS = [
    'public/images/quiz/disney',
    'public/images/quiz/pokemon',
];

for (const dir of DIRS) {
    const files = fs.readdirSync(dir).filter(f => /\.(png|jpe?g)$/i.test(f));
    let before = 0, after = 0;
    for (const file of files) {
        const src = path.join(dir, file);
        const out = path.join(dir, file.replace(/\.(png|jpe?g)$/i, '.webp'));
        before += fs.statSync(src).size;
        await sharp(src)
            .resize({ width: 700, height: 700, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82 })
            .toFile(out);
        after += fs.statSync(out).size;
        fs.unlinkSync(src);
    }
    console.log(`${dir}: ${files.length} images, ${(before / 1e6).toFixed(1)} Mo -> ${(after / 1e6).toFixed(1)} Mo`);
}
