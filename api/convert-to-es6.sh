#!/bin/bash

# Script de conversion CommonJS vers ES6 modules

echo "🔄 Conversion de tous les fichiers vers ES6 modules..."

# Fonction pour convertir un fichier
convert_file() {
    local file="$1"
    echo "  Converting: $file"
    
    # Remplacer les require par import
    sed -i '' "s/const \(.*\) = require('\(.*\)');/import \1 from '\2';/g" "$file"
    sed -i '' "s/const { \(.*\) } = require('\(.*\)');/import { \1 } from '\2';/g" "$file"
    sed -i '' "s/require('dotenv').config();/import dotenv from 'dotenv';\ndotenv.config();/g" "$file"
    
    # Remplacer module.exports par export
    sed -i '' "s/^module\.exports = /export default /g" "$file"
    sed -i '' "s/^module\.exports\./export /g" "$file"
    
    # Ajouter .js aux imports locaux
    sed -i '' "s/from '\.\/\([^']*\)';/from '.\/\1.js';/g" "$file"
    sed -i '' "s/from '\.\.\/\([^']*\)';/from '..\/\1.js';/g" "$file"
    sed -i '' "s/from '\.\.\/\.\.\/\([^']*\)';/from '..\/..\/\1.js';/g" "$file"
    sed -i '' "s/from '\.\.\/\.\.\/\.\.\/\([^']*\)';/from '..\/..\/..\/\1.js';/g" "$file"
    
    # Corriger les doubles .js.js
    sed -i '' "s/\.js\.js'/.js'/g" "$file"
}

# Convertir les fichiers principaux
convert_file "server.js"
convert_file "app.js"

# Convertir les fichiers de configuration
find src/config -name "*.js" -exec bash -c 'convert_file "$0"' {} \;

# Convertir les models
find src/api/models -name "*.js" -exec bash -c 'convert_file "$0"' {} \;

# Convertir les controllers
find src/api/controllers -name "*.js" -exec bash -c 'convert_file "$0"' {} \;

# Convertir les middlewares
find src/api/middlewares -name "*.js" -exec bash -c 'convert_file "$0"' {} \;

# Convertir les routes
find src/api/routes -name "*.js" -exec bash -c 'convert_file "$0"' {} \;

# Convertir le seeder
convert_file "database/seeders.js"

echo "✅ Conversion terminée!"
