// utils/imageUpload2.js
// Versión que procesa el formato de ImageUploadField

export const imageUpload2 = async (images) => {
  console.log('🟡 INICIANDO imageUpload2 - Subiendo', images?.length, 'imagen(es)');
  
  if (!images || images.length === 0) {
    console.log('📭 No hay imágenes para subir');
    return [];
  }

  const uploadedImages = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`📸 Procesando imagen ${i + 1}:`, img);
    
    try {
      let fileToUpload = null;

      // ============================================
      // CASO 1: Objeto con propiedad 'file' (nuestro formato)
      // ============================================
      if (img && img.file && img.file instanceof File) {
        console.log('📁 CASO 1: Objeto con file:', img.file.name, `${(img.file.size / 1024).toFixed(2)} KB`);
        fileToUpload = img.file;
      }
      
      // ============================================
      // CASO 2: Es un File directamente
      // ============================================
      else if (img instanceof File) {
        console.log('📁 CASO 2: File directo:', img.name, `${(img.size / 1024).toFixed(2)} KB`);
        fileToUpload = img;
      }
      
      // ============================================
      // CASO 3: Imagen ya existente
      // ============================================
      else if (img && img.isExisting === true && img.url && img.url.includes('cloudinary.com')) {
        console.log('📌 CASO 3: Imagen existente:', img.public_id);
        uploadedImages.push({
          public_id: img.public_id,
          url: img.url,
        });
        continue;
      }
      
      // ============================================
      // CASO 4: Solo URL de Cloudinary
      // ============================================
      else if (img && img.url && img.url.includes('cloudinary.com')) {
        console.log('📌 CASO 4: URL existente:', img.url);
        uploadedImages.push({
          public_id: img.public_id || img.url.split('/').pop().split('.')[0],
          url: img.url,
        });
        continue;
      }
      
      // ============================================
      // Si no se pudo obtener un file, error
      // ============================================
      if (!fileToUpload) {
        console.error('❌ No se pudo extraer un archivo de:', img);
        continue;
      }

      // ============================================
      // SUBIR A CLOUDINARY
      // ============================================
      console.log('📤 Subiendo a Cloudinary...');
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('upload_preset', 'video_commerce');
      formData.append('cloud_name', 'dzd58nm3l');

      const res = await fetch('https://api.cloudinary.com/v1_1/dzd58nm3l/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Cloudinary error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log(`✅ Imagen ${i + 1} subida:`, data.public_id);
      
      uploadedImages.push({
        public_id: data.public_id,
        url: data.secure_url,
      });
      
    } catch (error) {
      console.error(`❌ Error procesando imagen ${i + 1}:`, error.message);
    }
  }

  console.log(`✅ imageUpload2 completado: ${uploadedImages.length}/${images.length} imágenes subidas`);
  return uploadedImages;
};