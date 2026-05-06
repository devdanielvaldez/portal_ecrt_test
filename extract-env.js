const fs = require('fs').promises;
const path = require('path');

// Configuración
const ROOT_DIR = '.'; // Directorio actual (cambia si necesitas otra raíz)
const OUTPUT_FILE = '.env.extracted'; // Archivo .env de salida (puedes renombrarlo a .env después)
const EXCLUDE_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', 'coverage', '.next',
    'out', '.cache', 'tmp', '.env', '.idea', '.vscode', 'logs'
]);
const EXCLUDE_FILES = new Set([
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.env', '.env.example'
]);

// Extensiones de archivo a analizar (texto/JS/TS/json, etc.)
const INCLUDE_EXTENSIONS = new Set([
    '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.json', '.vue',
    '.html', '.htm', '.ejs', '.pug', '.hbs'
]);

// Regex para encontrar process.env.VAR y process.env['VAR']
const PATTERNS = [
    /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g,                     // process.env.NOMBRE
    /process\.env\[['"]([A-Za-z_][A-Za-z0-9_]*)['"]\]/g           // process.env['NOMBRE'] o process.env["NOMBRE"]
];

const envVariables = new Set(); // Almacenará nombres únicos

// Escanea un archivo y añade variables encontradas al Set
async function scanFile(filePath, relativePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        for (const pattern of PATTERNS) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const varName = match[1];
                envVariables.add(varName);
            }
        }
    } catch (err) {
        // Archivo no legible como texto (binario) → ignorar
    }
}

// Recorrido iterativo (sin recursión profunda) para evitar stack overflow
async function walkDirectory(rootDir) {
    const stack = [rootDir];
    while (stack.length > 0) {
        const currentDir = stack.pop();
        let entries;
        try {
            entries = await fs.readdir(currentDir, { withFileTypes: true });
        } catch (err) {
            continue; // Si no se puede leer, saltar
        }
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            const relativePath = path.relative(ROOT_DIR, fullPath);
            if (EXCLUDE_DIRS.has(entry.name)) continue;
            if (entry.isDirectory()) {
                stack.push(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (EXCLUDE_FILES.has(entry.name)) continue;
                if (INCLUDE_EXTENSIONS.has(ext)) {
                    await scanFile(fullPath, relativePath);
                }
            }
        }
    }
}

// Genera el archivo .env con las variables encontradas
async function generateDotEnv() {
    // Ordenar alfabéticamente
    const sortedVars = Array.from(envVariables).sort();
    let output = '# Variables de entorno extraídas automáticamente del código\n';
    output += '# (sin valores, edítalos según tu entorno)\n\n';
    for (const varName of sortedVars) {
        output += `${varName}=\n`;
    }
    await fs.writeFile(OUTPUT_FILE, output, 'utf8');
    console.log(`✅ Archivo generado: ${OUTPUT_FILE} con ${envVariables.size} variables únicas.`);
}

// Función principal
async function main() {
    console.log('🔍 Escaneando todo el proyecto en busca de process.env...');
    console.log(`Directorio raíz: ${path.resolve(ROOT_DIR)}`);
    console.log('Excluyendo carpetas: ' + Array.from(EXCLUDE_DIRS).join(', '));
    console.log('');

    await walkDirectory(ROOT_DIR);

    if (envVariables.size === 0) {
        console.log('⚠️ No se encontraron variables process.env en ningún archivo.');
        console.log('   Revisa que los archivos tengan extensiones incluidas y que no estén excluidos.');
    } else {
        await generateDotEnv();
        console.log('\n📝 Puedes renombrar el archivo a .env y completar los valores.');
    }
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});