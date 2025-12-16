import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour convertir un fichier
function convertFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip si déjà en ES6
        if (content.includes('import ') && !content.includes('require(')) {
            console.log(`⏭️  Déjà en ES6: ${filePath}`);
            return;
        }
        
        // Remplacer require('dotenv').config()
        content = content.replace(
            /require\('dotenv'\)\.config\(\);?/g,
            "import dotenv from 'dotenv';\ndotenv.config();"
        );
        
        // Remplacer const { x, y } = require('module')
        content = content.replace(
            /const\s+{\s*([^}]+)\s*}\s*=\s*require\(['"]([^'"]+)['"]\);?/g,
            "import { $1 } from '$2';"
        );
        
        // Remplacer const x = require('module')
        content = content.replace(
            /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g,
            "import $1 from '$2';"
        );
        
        // Remplacer module.exports = 
        content = content.replace(
            /^module\.exports\s*=\s*/gm,
            'export default '
        );
        
        // Remplacer module.exports.x =
        content = content.replace(
            /^module\.exports\.(\w+)\s*=/gm,
            'export const $1 ='
        );
        
        // Ajouter .js aux imports locaux (chemins relatifs)
        content = content.replace(
            /from\s+['"](\.\.[\/\\][^'"]+)['"];?/g,
            (match, p1) => {
                if (!p1.endsWith('.js') && !p1.endsWith('.json')) {
                    return `from '${p1}.js';`;
                }
                return match;
            }
        );
        
        content = content.replace(
            /from\s+['"](\.[\/\\][^'"]+)['"];?/g,
            (match, p1) => {
                if (!p1.endsWith('.js') && !p1.endsWith('.json')) {
                    return `from '${p1}.js';`;
                }
                return match;
            }
        );
        
        // Écrire le fichier modifié
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Converti: ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Erreur sur ${filePath}:`, error.message);
    }
}

// Fonction récursive pour parcourir les dossiers
function convertDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                convertDirectory(filePath);
            }
        } else if (file.endsWith('.js')) {
            convertFile(filePath);
        }
    }
}

console.log('🔄 Début de la conversion vers ES6 modules...\n');

// Convertir les fichiers racine
convertFile(path.join(__dirname, 'server.js'));
convertFile(path.join(__dirname, 'app.js'));

// Convertir les dossiers
convertDirectory(path.join(__dirname, 'src'));
convertDirectory(path.join(__dirname, 'database'));

console.log('\n✅ Conversion terminée!');
console.log('\n📝 N\'oubliez pas de vérifier manuellement:');
console.log('   - Les exports nommés vs default');
console.log('   - Les chemins d\'import avec .js');
console.log('   - Le package.json doit avoir "type": "module"');
