/**
 * Script de empaquetado 100% Offline para Capacitor Android (APK)
 * Copia todos los recursos web (app.html, index.html, simbolos/, Diseños/ y copia ASCII Disenos/)
 * dentro de la carpeta www/ para compilar el APK sin dependencias externas.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const WWW = path.join(ROOT, 'www');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(WWW)) {
  fs.rmSync(WWW, { recursive: true, force: true });
}
fs.mkdirSync(WWW, { recursive: true });

const rootFiles = [
  'index.html',
  'app.html',
  'manifest.json',
  'sw.js',
  'CADELEC.png',
  'logo.png',
  'logo.ico'
];

for (const file of rootFiles) {
  const srcFile = path.join(ROOT, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(WWW, file));
  }
}

copyDirSync(path.join(ROOT, 'simbolos'), path.join(WWW, 'simbolos'));
copyDirSync(path.join(ROOT, 'Diseños'), path.join(WWW, 'Diseños'));
// Copia ASCII sin 'ñ' para máxima compatibilidad con el empaquetador aapt2 de Android
copyDirSync(path.join(ROOT, 'Diseños'), path.join(WWW, 'Disenos'));

console.log('✅ Carpeta www/ lista para compilar Cadelec Fast APK 100% Offline.');
