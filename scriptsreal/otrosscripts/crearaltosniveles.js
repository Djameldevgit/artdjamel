// crearaltosniveles.js
 
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || 'dfjipgj2o',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function crearEstructuraPrueva() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Creando estructura "prueva" al nivel de Home');
    console.log('='.repeat(60));

    // Definimos la estructura de carpetas que queremos crear
    // Todas las rutas parten de la raíz, por lo que "prueva" estará al mismo nivel que "Home".
    const estructuraCarpetas = [
        'prueva',                 // Esta es la carpeta principal (al mismo nivel que Home)
        'prueva/imagenes',        // Subcarpeta dentro de prueva
        'prueva/documentos',      // Subcarpeta dentro de prueva
        'prueva/videos'           // Subcarpeta dentro de prueva
    ];

    for (const rutaCarpeta of estructuraCarpetas) {
        console.log(`\n📁 Procesando: "${rutaCarpeta}"`);
        
        try {
            // Subimos un archivo placeholder. El parámetro 'folder' creará toda la estructura de ruta que le indiques [citation:1].
            const result = await cloudinary.uploader.upload(
                'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                {
                    folder: rutaCarpeta,
                    public_id: 'temp_placeholder',
                    resource_type: 'image',
                    overwrite: true
                }
            );
            
            console.log(`   ✅ Carpeta lista: "${rutaCarpeta}"`);
            
            // Limpiamos el archivo temporal para no dejar basura
            try {
                await cloudinary.api.delete_resources([`${rutaCarpeta}/temp_placeholder`], {
                    resource_type: 'image'
                });
            } catch (cleanError) {
                // Ignoramos errores de limpieza, la carpeta ya está creada
            }
            
        } catch (error) {
            // Manejamos el error si la carpeta ya existe
            if (error.error.message.includes('already exists') || 
                error.message.includes('already exists')) {
                console.log(`   📂 La carpeta "${rutaCarpeta}" ya existe.`);
            } else {
                console.error(`   ❌ Error con "${rutaCarpeta}":`, error.message || error);
            }
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Proceso completado');
    console.log('='.repeat(60));
}

// Ejecutar la función
crearEstructuraPrueva();