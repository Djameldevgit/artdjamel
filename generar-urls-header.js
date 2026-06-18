// migrar-imagenes-carousels.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const https = require('https');
 

dotenv.config();

// =============================================
// CONFIGURACIÓN CLOUDINARY
// =============================================
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || 'dfjipgj2o',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// =============================================
// RUTAS DE LOS COMPONENTES
// =============================================
const COMPONENTS = {
    categoryCarousel: path.join(__dirname, 'src', 'components', 'CategoryCarousel.jsx'),
    headerCarousel: path.join(__dirname, 'src', 'components', 'HeaderCarousel.jsx')
};

// =============================================
// RUTAS DESTINO EN CLOUDINARY
// =============================================
const CLOUDINARY_PATHS = {
    category: 'home/header/carouselCategoryPage',
    headerMain: 'home/header/carouselHome',
    headerSide: 'home/header/carouselHome'
};

// =============================================
// FUNCIÓN PARA EXTRAER URLs DEL COMPONENTE CATEGORY
// =============================================
function extraerUrlsCategory() {
    console.log('\n🔍 Extrayendo URLs de CategoryCarousel.jsx...');
    
    const content = fs.readFileSync(COMPONENTS.categoryCarousel, 'utf8');
    
    // Buscar el objeto imagesByCategory
    const match = content.match(/const imagesByCategory = ({[\s\S]*?});/);
    
    if (!match) {
        console.log('   ❌ No se encontró el objeto imagesByCategory');
        return null;
    }
    
    try {
        // Evaluar el objeto JavaScript (con cuidado)
        const imagesByCategoryStr = match[1];
        // Reemplazar variables como CACHE_BREAK por strings vacíos para poder evaluar
        const cleanStr = imagesByCategoryStr.replace(/\${CACHE_BREAK}/g, '""');
        
        // Usar Function en lugar de eval por seguridad
        const imagesByCategory = (new Function(`return ${cleanStr}`))();
        
        console.log('   ✅ URLs extraídas correctamente');
        
        // Mostrar resumen
        const categorias = Object.keys(imagesByCategory);
        console.log(`   📸 Categorías encontradas: ${categorias.join(', ')}`);
        
        return imagesByCategory;
        
    } catch (error) {
        console.log('   ❌ Error al parsear:', error.message);
        return null;
    }
}

// =============================================
// FUNCIÓN PARA EXTRAER URLs DEL COMPONENTE HEADER
// =============================================
function extraerUrlsHeader() {
    console.log('\n🔍 Extrayendo URLs de HeaderCarousel.jsx...');
    
    const content = fs.readFileSync(COMPONENTS.headerCarousel, 'utf8');
    
    // Buscar mainImages
    const mainMatch = content.match(/const mainImages = \[([\s\S]*?)\];/);
    const sideMatch = content.match(/const sideImages = \[([\s\S]*?)\];/);
    
    if (!mainMatch || !sideMatch) {
        console.log('   ❌ No se encontraron mainImages o sideImages');
        return null;
    }
    
    try {
        // Extraer URLs de mainImages
        const mainUrlsStr = mainMatch[1];
        const mainUrls = mainUrlsStr
            .split('\n')
            .map(line => line.match(/"([^"]+)"/))
            .filter(match => match)
            .map(match => match[1]);
        
        // Extraer URLs de sideImages
        const sideUrlsStr = sideMatch[1];
        const sideUrls = sideUrlsStr
            .split('\n')
            .map(line => line.match(/"([^"]+)"/))
            .filter(match => match)
            .map(match => match[1]);
        
        console.log(`   ✅ Main images: ${mainUrls.length} URLs encontradas`);
        console.log(`   ✅ Side images: ${sideUrls.length} URLs encontradas`);
        
        return { main: mainUrls, side: sideUrls };
        
    } catch (error) {
        console.log('   ❌ Error al parsear:', error.message);
        return null;
    }
}

// =============================================
// FUNCIÓN PARA DESCARGAR UNA IMAGEN DESDE URL
// =============================================
function descargarImagen(url) {
    return new Promise((resolve, reject) => {
        const tempDir = path.join(__dirname, 'temp_images');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Extraer nombre del archivo de la URL
        const urlParts = url.split('/');
        let filename = urlParts[urlParts.length - 1].split('?')[0];
        
        // Si no tiene extensión o es una URL de Unsplash, generar nombre
        if (!filename.includes('.') || url.includes('unsplash')) {
            filename = `image-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        }
        
        const tempPath = path.join(tempDir, filename);
        const file = fs.createWriteStream(tempPath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve(tempPath);
            });
            
        }).on('error', (err) => {
            fs.unlink(tempPath, () => {});
            reject(err);
        });
    });
}

// =============================================
// FUNCIÓN PARA SUBIR IMAGEN A CLOUDINARY
// =============================================
async function subirImagen(url, folder, publicId) {
    console.log(`   ⬆️ Subiendo: ${path.basename(url)} → ${folder}/${publicId}`);
    
    let tempPath = null;
    
    try {
        // Descargar imagen temporalmente
        tempPath = await descargarImagen(url);
        
        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(tempPath, {
            folder: folder,
            public_id: publicId,
            overwrite: true,
            unique_filename: false
        });
        
        console.log(`      ✅ Cloudinary URL: ${result.secure_url}`);
        
        // Limpiar archivo temporal
        fs.unlinkSync(tempPath);
        
        return {
            originalUrl: url,
            cloudinaryUrl: result.secure_url,
            publicId: result.public_id
        };
        
    } catch (error) {
        console.log(`      ❌ Error: ${error.message}`);
        
        // Limpiar archivo temporal si existe
        if (tempPath && fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
        
        return {
            originalUrl: url,
            cloudinaryUrl: null,
            error: error.message
        };
    }
}

// =============================================
// FUNCIÓN PARA GENERAR PUBLIC_ID
// =============================================
function generarPublicId(url, categoria = '', tipo = '') {
    // Extraer nombre base de la URL
    const urlParts = url.split('/');
    let baseName = urlParts[urlParts.length - 1].split('?')[0];
    
    // Quitar extensión
    baseName = baseName.replace(/\.[^/.]+$/, '');
    
    // Limpiar caracteres especiales
    baseName = baseName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    
    // Añadir prefijos según categoría
    if (categoria) {
        return `${categoria}-${baseName}`;
    } else if (tipo === 'main') {
        return `main-${baseName}`;
    } else if (tipo === 'side') {
        return `side-${baseName}`;
    }
    
    return baseName;
}

// =============================================
// FUNCIÓN PARA ACTUALIZAR COMPONENTE CATEGORY
// =============================================
function actualizarComponenteCategory(resultados, urlsOriginales) {
    console.log('\n📝 Actualizando CategoryCarousel.jsx...');
    
    let content = fs.readFileSync(COMPONENTS.categoryCarousel, 'utf8');
    
    // Crear backup
    const backupPath = path.join(__dirname, 'backups', `CategoryCarousel.jsx.backup-${Date.now()}`);
    if (!fs.existsSync(path.dirname(backupPath))) {
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    }
    fs.copyFileSync(COMPONENTS.categoryCarousel, backupPath);
    console.log(`   ✅ Backup creado: ${backupPath}`);
    
    // Construir nuevo objeto imagesByCategory
    const newImagesByCategory = {};
    
    for (const [categoria, imagenes] of Object.entries(resultados)) {
        if (imagenes.length > 0) {
            newImagesByCategory[categoria] = {
                main: imagenes.slice(0, 3).map(i => `"${i.cloudinaryUrl}"`),
                side: imagenes.slice(3, 6).map(i => `"${i.cloudinaryUrl}"`)
            };
        } else {
            // Mantener las originales si no se migraron
            newImagesByCategory[categoria] = urlsOriginales[categoria];
        }
    }
    
    // Crear la nueva sección como string
    const newSection = `const imagesByCategory = ${JSON.stringify(newImagesByCategory, null, 2).replace(/"([^"]+)":/g, '$1:')};`;
    
    // Reemplazar en el archivo
    const regex = /const imagesByCategory = {[\s\S]*?};/;
    content = content.replace(regex, newSection);
    
    fs.writeFileSync(COMPONENTS.categoryCarousel, content);
    console.log('   ✅ Componente CategoryCarousel.jsx actualizado');
}

// =============================================
// FUNCIÓN PARA ACTUALIZAR COMPONENTE HEADER
// =============================================
function actualizarComponenteHeader(resultados) {
    console.log('\n📝 Actualizando HeaderCarousel.jsx...');
    
    let content = fs.readFileSync(COMPONENTS.headerCarousel, 'utf8');
    
    // Crear backup
    const backupPath = path.join(__dirname, 'backups', `HeaderCarousel.jsx.backup-${Date.now()}`);
    if (!fs.existsSync(path.dirname(backupPath))) {
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    }
    fs.copyFileSync(COMPONENTS.headerCarousel, backupPath);
    console.log(`   ✅ Backup creado: ${backupPath}`);
    
    // Construir nuevos arrays
    const mainUrls = resultados.main.map(i => `"${i.cloudinaryUrl}"`).join(',\n    ');
    const sideUrls = resultados.side.map(i => `"${i.cloudinaryUrl}"`).join(',\n    ');
    
    const newMainSection = `  const mainImages = [
    ${mainUrls}
  ];`;
    
    const newSideSection = `  const sideImages = [
    ${sideUrls}
  ];`;
    
    // Reemplazar en el archivo
    const mainRegex = /const mainImages = \[[\s\S]*?\];/;
    const sideRegex = /const sideImages = \[[\s\S]*?\];/;
    
    content = content.replace(mainRegex, newMainSection);
    content = content.replace(sideRegex, newSideSection);
    
    fs.writeFileSync(COMPONENTS.headerCarousel, content);
    console.log('   ✅ Componente HeaderCarousel.jsx actualizado');
}

// =============================================
// FUNCIÓN PRINCIPAL
// =============================================
async function main() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 MIGRACIÓN DE IMÁGENES DE CAROUSELS A CLOUDINARY');
    console.log('='.repeat(80));
    
    // ===== PASO 1: Extraer URLs de los componentes =====
    console.log('\n📋 PASO 1: EXTRAYENDO URLs DE COMPONENTES');
    console.log('==========================================');
    
    const categoryUrls = extraerUrlsCategory();
    const headerUrls = extraerUrlsHeader();
    
    if (!categoryUrls && !headerUrls) {
        console.log('\n❌ No se pudieron extraer URLs. Abortando.');
        return;
    }
    
    // ===== PASO 2: Mostrar resumen de URLs encontradas =====
    console.log('\n📊 RESUMEN DE URLs ENCONTRADAS:');
    console.log('================================');
    
    if (categoryUrls) {
        console.log('\n📸 CATEGORY CAROUSEL:');
        Object.entries(categoryUrls).forEach(([cat, urls]) => {
            console.log(`   • ${cat}: ${urls.main.length + urls.side.length} imágenes`);
        });
    }
    
    if (headerUrls) {
        console.log('\n📸 HEADER CAROUSEL:');
        console.log(`   • Main: ${headerUrls.main.length} imágenes`);
        console.log(`   • Side: ${headerUrls.side.length} imágenes`);
    }
    
    // ===== PASO 3: Preguntar confirmación =====
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const respuesta = await new Promise(resolve => {
        readline.question('\n¿Iniciar migración a Cloudinary? (s/n): ', resolve);
    });
    readline.close();
    
    if (respuesta.toLowerCase() !== 's' && respuesta.toLowerCase() !== 'si') {
        console.log('\n⏭️ Migración cancelada');
        return;
    }
    
    // ===== PASO 4: Migrar imágenes de CATEGORY =====
    const resultadosCategory = {};
    
    if (categoryUrls) {
        console.log('\n📸 PASO 2: MIGRANDO IMÁGENES DE CATEGORÍAS');
        console.log('============================================');
        
        for (const [categoria, urls] of Object.entries(categoryUrls)) {
            console.log(`\n📁 Procesando categoría: ${categoria}`);
            
            const todasUrls = [...urls.main, ...urls.side];
            resultadosCategory[categoria] = [];
            
            for (let i = 0; i < todasUrls.length; i++) {
                const url = todasUrls[i];
                const tipo = i < urls.main.length ? 'main' : 'side';
                const publicId = generarPublicId(url, categoria, tipo);
                
                const resultado = await subirImagen(
                    url,
                    `${CLOUDINARY_PATHS.category}/${categoria}`,
                    publicId
                );
                
                resultadosCategory[categoria].push(resultado);
                
                // Pequeña pausa
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }
    
    // ===== PASO 5: Migrar imágenes de HEADER =====
    const resultadosHeader = { main: [], side: [] };
    
    if (headerUrls) {
        console.log('\n📸 PASO 3: MIGRANDO IMÁGENES DE HEADER');
        console.log('========================================');
        
        // Migrar main
        console.log('\n📁 Header - Main:');
        for (let i = 0; i < headerUrls.main.length; i++) {
            const url = headerUrls.main[i];
            const publicId = generarPublicId(url, '', 'main');
            
            const resultado = await subirImagen(
                url,
                CLOUDINARY_PATHS.headerMain,
                publicId
            );
            
            resultadosHeader.main.push(resultado);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Migrar side
        console.log('\n📁 Header - Side:');
        for (let i = 0; i < headerUrls.side.length; i++) {
            const url = headerUrls.side[i];
            const publicId = generarPublicId(url, '', 'side');
            
            const resultado = await subirImagen(
                url,
                CLOUDINARY_PATHS.headerSide,
                publicId
            );
            
            resultadosHeader.side.push(resultado);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    // ===== PASO 6: Actualizar componentes =====
    console.log('\n📝 PASO 4: ACTUALIZANDO COMPONENTES');
    console.log('=====================================');
    
    if (categoryUrls && Object.keys(resultadosCategory).length > 0) {
        actualizarComponenteCategory(resultadosCategory, categoryUrls);
    }
    
    if (headerUrls && (resultadosHeader.main.length > 0 || resultadosHeader.side.length > 0)) {
        actualizarComponenteHeader(resultadosHeader);
    }
    
    // ===== PASO 7: Mostrar resumen final =====
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN FINAL DE MIGRACIÓN');
    console.log('='.repeat(80));
    
    if (categoryUrls) {
        console.log('\n📸 CATEGORY CAROUSEL - URLs en Cloudinary:');
        for (const [categoria, resultados] of Object.entries(resultadosCategory)) {
            console.log(`\n   ${categoria}:`);
            resultados.forEach((r, i) => {
                console.log(`      ${i+1}. ${r.cloudinaryUrl || '❌ Falló'}`);
            });
        }
    }
    
    if (headerUrls) {
        console.log('\n📸 HEADER CAROUSEL - URLs en Cloudinary:');
        console.log('\n   Main:');
        resultadosHeader.main.forEach((r, i) => {
            console.log(`      ${i+1}. ${r.cloudinaryUrl}`);
        });
        console.log('\n   Side:');
        resultadosHeader.side.forEach((r, i) => {
            console.log(`      ${i+1}. ${r.cloudinaryUrl}`);
        });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ MIGRACIÓN COMPLETADA');
    console.log('='.repeat(80));
    console.log('\n📌 Las imágenes se han subido a:');
    console.log(`   • ${CLOUDINARY_PATHS.category}/[categoria]/`);
    console.log(`   • ${CLOUDINARY_PATHS.headerMain}/`);
    console.log(`   • ${CLOUDINARY_PATHS.headerSide}/`);
    console.log('\n📌 Los componentes se han actualizado con las nuevas URLs');
    console.log('📌 Backups guardados en /backups/');
}

// =============================================
// EJECUTAR
// =============================================
main().catch(console.error);