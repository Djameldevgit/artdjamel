// node crearmuchascarpetas.js
// Script para CREAR MÚLTIPLES CARPETAS Y SUBCARPETAS en Cloudinary

const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// =============================================
// CONFIGURACIÓN
// =============================================
const CLOUD_NAME = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('\n🔧 CONFIGURACIÓN CLOUDINARY:');
console.log('============================');
console.log(`   • Cloud Name: ${CLOUD_NAME}`);
console.log(`   • API Key: ${API_KEY ? '✓ Configurada' : '❌ No definida'}`);
console.log(`   • API Secret: ${API_SECRET ? '✓ Configurado' : '❌ No definido'}`);

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('\n❌ ERROR: Faltan credenciales');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
});

// =============================================
// CONFIGURACIÓN DE CARPETAS - ¡MODIFICA AQUÍ!
// =============================================

// LISTA DE CARPETAS A CREAR
// Formato: 'ruta/completa/de/la/carpeta'
const newFolders = [
    // ========================================
    // EJEMPLO 1: Estructura para DJAMEL
    // ========================================
    'djamel/paginaprincipal/otrapagina',     // Crea: djamel/paginaprincipal/otrapagina
    'djamel/ejemplo/gra',                      // Crea: djamel/ejemplo/gra
    'djamel/categoria/carpeta',                 // Crea: djamel/categoria/carpeta
    
    // ========================================
    // EJEMPLO 2: Estructura para HEADER
    // ========================================
    'header/home/seccion1',                     // Crea: header/home/seccion1
    'header/home/seccion2',                      // Crea: header/home/seccion2
    'header/categoryPage/principal',             // Crea: header/categoryPage/principal
    'header/categoryPage/secundaria',            // Crea: header/categoryPage/secundaria
    
    // ========================================
    // EJEMPLO 3: Estructura para PRODUCTOS
    // ========================================
    'productos/electronica/telefonos',           // Crea: productos/electronica/telefonos
    'productos/electronica/tablets',              // Crea: productos/electronica/tablets
    'productos/ropa/hombre/camisas',              // Crea: productos/ropa/hombre/camisas
    'productos/ropa/mujer/vestidos',              // Crea: productos/ropa/mujer/vestidos
    
    // ========================================
    // EJEMPLO 4: Tu estructura específica
    // ========================================
    'djamel/paginaprincipal/otrapagina',          // Ya existe arriba, pero puedes modificar
    'djamel/ejemplo/gra',                          // Ya existe arriba
    'djamel/categoria/carpeta'                     // Ya existe arriba
];

// =============================================
// FUNCIÓN: Crear una carpeta (y todas sus subcarpetas)
// =============================================
async function createFolder(folderPath) {
    console.log(`\n📁 Procesando: ${folderPath}`);
    
    try {
        // MÉTODO 1: Intentar con create_folder (si está disponible)
        try {
            await cloudinary.api.create_folder(folderPath);
            console.log(`   ✅ Creada: ${folderPath}`);
            return true;
        } catch (error) {
            // Si el error es porque el método no está disponible, usamos método alternativo
            if (error.message && error.message.includes('not supported')) {
                // MÉTODO 2: Crear subiendo un archivo placeholder
                const result = await cloudinary.uploader.upload(
                    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                    {
                        folder: folderPath,
                        public_id: '.folder_placeholder',
                        resource_type: 'image',
                        overwrite: false
                    }
                );
                
                console.log(`   ✅ Creada (método alternativo): ${folderPath}`);
                
                // Eliminar el archivo placeholder para dejar la carpeta vacía
                await cloudinary.api.delete_resources([`${folderPath}/.folder_placeholder`], {
                    resource_type: 'image'
                });
                
                return true;
            } else {
                throw error;
            }
        }
    } catch (error) {
        if (error.message && error.message.includes('already exists')) {
            console.log(`   📂 Ya existe: ${folderPath}`);
            return true;
        } else {
            console.log(`   ❌ Error: ${folderPath} - ${error.message}`);
            return false;
        }
    }
}

// =============================================
// FUNCIÓN: Verificar estructura creada
// =============================================
async function verifyFolders() {
    console.log('\n🔍 VERIFICANDO ESTRUCTURA CREADA');
    console.log('===============================');
    
    // Extraer carpetas padre únicas para verificar
    const parentFolders = [...new Set(newFolders.map(f => f.split('/')[0]))];
    
    for (const parent of parentFolders) {
        try {
            console.log(`\n📂 Contenido de: ${parent}`);
            
            // Verificar subcarpetas del padre
            const subfolders = await cloudinary.api.sub_folders(parent);
            
            if (subfolders.folders.length === 0) {
                console.log(`   📁 No hay subcarpetas`);
            } else {
                subfolders.folders.forEach(f => {
                    console.log(`   📁 ${f.name}`);
                });
            }
            
            // Verificar archivos (deberían estar vacías)
            const resources = await cloudinary.api.resources({
                type: 'upload',
                prefix: parent,
                max_results: 10
            });
            
            if (resources.resources.length > 0) {
                console.log(`   📸 Archivos encontrados: ${resources.resources.length}`);
            }
            
        } catch (error) {
            console.log(`   ⚠️ No se pudo verificar ${parent}: ${error.message}`);
        }
    }
}

// =============================================
// FUNCIÓN PRINCIPAL
// =============================================
async function main() {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 CREANDO MÚLTIPLES CARPETAS EN CLOUDINARY');
    console.log('='.repeat(70));
    
    console.log('\n📋 Carpetas a crear:');
    newFolders.forEach((folder, index) => {
        console.log(`   ${index + 1}. ${folder}`);
    });
    
    console.log(`\n⏳ Creando ${newFolders.length} carpetas...`);
    
    let created = 0;
    let failed = 0;
    
    // Crear cada carpeta
    for (const folder of newFolders) {
        const success = await createFolder(folder);
        if (success) {
            created++;
        } else {
            failed++;
        }
        
        // Pequeña pausa para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Mostrar resumen
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN');
    console.log('='.repeat(70));
    console.log(`   ✅ Creadas: ${created}`);
    console.log(`   ❌ Fallos: ${failed}`);
    console.log(`   📁 Total procesadas: ${newFolders.length}`);
    
    // Verificar estructura
    await verifyFolders();
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ PROCESO COMPLETADO');
    console.log('='.repeat(70));
    
    console.log('\n📌 ESTRUCTURA CREADA:');
    
    // Mostrar estructura jerárquica
    const structure = {};
    newFolders.forEach(folder => {
        const parts = folder.split('/');
        let current = structure;
        
        parts.forEach(part => {
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        });
    });
    
    function printStructure(obj, indent = '') {
        Object.keys(obj).forEach(key => {
            console.log(`${indent}📁 ${key}`);
            printStructure(obj[key], indent + '  ');
        });
    }
    
    printStructure(structure);
}

// =============================================
// EJECUTAR
// =============================================
console.log('\n🎯 CONFIGURACIÓN ACTUAL:');
console.log(`   Total carpetas a crear: ${newFolders.length}`);
console.log('\n   Presiona Ctrl+C para cancelar...');
console.log('   Iniciando en 2 segundos...\n');

setTimeout(() => {
    main().catch(error => {
        console.error('\n❌ Error:', error);
    });
}, 2000);