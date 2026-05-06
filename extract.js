#!/usr/bin/env node

/**
 * Script para extraer toda la estructura y contenido de un proyecto a un solo archivo de texto.
 * Uso: node extract-project.js [ruta-del-proyecto]
 * Si no se especifica ruta, usa el directorio actual.
 */

const fs = require('fs').promises;
const path = require('path');

// ========== CONFIGURACIÓN ==========
// Carpetas y archivos a ignorar (expresiones regulares o strings exactos)
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.next/,
  /out/,
  /\.cache/,
  /\.vscode/,
  /\.idea/,
  /\.DS_Store/,
  /Thumbs\.db/,
  /\.log$/,
  /\.lock$/,
  /package-lock\.json/,
  /yarn\.lock/,
  /pnpm-lock\.yaml/
];

// Extensiones consideradas como archivos de texto (por defecto se intenta leer como UTF-8)
// Si quieres incluir cualquier archivo, deja el array vacío y se intentará leer todo.
const TEXT_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.json', '.html', '.htm', '.css', '.scss', '.sass', '.less',
  '.md', '.markdown', '.txt', '.text', '.xml', '.svg', '.yaml', '.yml',
  '.toml', '.ini', '.cfg', '.conf', '.sh', '.bash', '.zsh', '.ps1',
  '.py', '.rb', '.go', '.java', '.c', '.cpp', '.h', '.hpp', '.cs',
  '.php', '.sql', '.vue', '.svelte', '.astro'
];

const OUTPUT_FILE = 'proyecto_completo.txt';
// ===================================

/**
 * Verifica si una ruta debe ser ignorada.
 */
function shouldIgnore(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const baseName = path.basename(filePath);
  return IGNORE_PATTERNS.some(pattern => {
    if (typeof pattern === 'string') {
      return relativePath.includes(pattern) || baseName === pattern;
    }
    return pattern.test(relativePath) || pattern.test(baseName);
  });
}

/**
 * Determina si un archivo es probablemente texto basado en su extensión.
 * Si no hay extensiones definidas, asume que todos son texto (puede fallar con binarios).
 */
function isTextFile(filePath) {
  if (TEXT_EXTENSIONS.length === 0) return true;
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.includes(ext);
}

/**
 * Recorre el directorio y devuelve lista de archivos (rutas absolutas) y estructura de árbol.
 */
async function walkDirectory(dir, relativeRoot = '') {
  const files = [];
  const treeLines = [];

  async function walk(currentDir, prefix = '', isLast = true) {
    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch (err) {
      console.error(`Error leyendo ${currentDir}: ${err.message}`);
      return;
    }

    // Filtrar entradas ignoradas
    const visibleEntries = entries.filter(entry => {
      const fullPath = path.join(currentDir, entry.name);
      return !shouldIgnore(fullPath);
    });

    for (let i = 0; i < visibleEntries.length; i++) {
      const entry = visibleEntries[i];
      const fullPath = path.join(currentDir, entry.name);
      const isLastEntry = i === visibleEntries.length - 1;
      const connector = isLastEntry ? '└── ' : '├── ';
      const linePrefix = prefix + connector;
      const fileName = entry.name + (entry.isDirectory() ? '/' : '');

      if (entry.isDirectory()) {
        treeLines.push(linePrefix + fileName);
        const newPrefix = prefix + (isLastEntry ? '    ' : '│   ');
        await walk(fullPath, newPrefix, true);
      } else {
        treeLines.push(linePrefix + fileName);
        files.push(fullPath);
      }
    }
  }

  const rootName = path.basename(dir) + '/';
  treeLines.push(rootName);
  await walk(dir, '', true);
  return { files, tree: treeLines.join('\n') };
}

/**
 * Lee el contenido de un archivo si es texto; si falla, devuelve un mensaje de error.
 */
async function readFileContent(filePath) {
  if (!isTextFile(filePath)) {
    return `[ARCHIVO BINARIO O NO TEXTUAL: ${path.basename(filePath)}]`;
  }

  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (err) {
    // Si falla la lectura UTF-8, probablemente sea binario
    return `[NO SE PUDO LEER COMO TEXTO: ${err.message}]`;
  }
}

/**
 * Función principal.
 */
async function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  console.log(`📁 Extrayendo proyecto desde: ${rootDir}`);
  console.log(`📄 Archivo de salida: ${OUTPUT_FILE}`);
  console.log('⏳ Recorriendo directorios...');

  const { files, tree } = await walkDirectory(rootDir);
  console.log(`✅ Encontrados ${files.length} archivos no ignorados.`);

  const outputStream = [];
  // Agregar cabecera
  outputStream.push('='.repeat(80));
  outputStream.push(`EXTRACCIÓN COMPLETA DEL PROYECTO: ${rootDir}`);
  outputStream.push(`Fecha: ${new Date().toLocaleString()}`);
  outputStream.push('='.repeat(80));
  outputStream.push('');
  outputStream.push('📁 ESTRUCTURA DE CARPETAS');
  outputStream.push('─'.repeat(40));
  outputStream.push(tree);
  outputStream.push('');
  outputStream.push('='.repeat(80));
  outputStream.push('📄 CONTENIDO DE ARCHIVOS');
  outputStream.push('='.repeat(80));
  outputStream.push('');

  // Procesar cada archivo
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const relativePath = path.relative(rootDir, filePath);
    console.log(`📝 Leyendo: ${relativePath} (${i+1}/${files.length})`);

    const content = await readFileContent(filePath);
    outputStream.push('');
    outputStream.push(`>>> ARCHIVO: ${relativePath}`);
    outputStream.push('─'.repeat(60));
    outputStream.push(content);
    outputStream.push(''); // línea en blanco después del contenido
  }

  // Escribir archivo de salida
  try {
    await fs.writeFile(OUTPUT_FILE, outputStream.join('\n'), 'utf8');
    console.log(`\n✨ ¡Extracción completada! Resultado guardado en: ${OUTPUT_FILE}`);
  } catch (err) {
    console.error(`❌ Error escribiendo el archivo de salida: ${err.message}`);
    process.exit(1);
  }
}

// Ejecutar y manejar errores globales
main().catch(err => {
  console.error('Error inesperado:', err);
  process.exit(1);
});