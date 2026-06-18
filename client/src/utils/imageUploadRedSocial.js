 
export const imageUploadRedSocial  = async (image) => {
  console.log('🟡 INICIANDO imageUpload2 - Subiendo una sola imagen...');

  if (!image || !image.url) {
    throw new Error('No se proporcionó una imagen válida para subir');
  }

  try {
    // ✅ Si es una imagen nueva (desde File input → blob URL)
    if (image.url.startsWith('blob:') && !image.isExisting) {
      console.log('🔄 Convirtiendo blob URL a archivo...');

      // 1️⃣ Convertir blob URL a File
      const response = await fetch(image.url);
      if (!response.ok) throw new Error('No se pudo acceder al blob');

      const blob = await response.blob();
      const file = new File([blob], image.name || `image-${Date.now()}.jpg`, {
        type: blob.type || 'image/jpeg',
      });

      console.log('📁 Blob convertido a File:', file.name, `${(file.size / 1024).toFixed(2)} KB`);

      // 2️⃣ Subir a Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'vetementsdjamel');
      formData.append('cloud_name', 'dfjipgj2o');
 

      const res = await fetch('https://api.cloudinary.com/v1_1/dfjipgj2o/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Cloudinary error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      console.log('✅ UPLOAD EXITOSO a Cloudinary:', {
        public_id: data.public_id,
        url: data.secure_url,
        formato: data.format,
      });

      return {
        public_id: data.public_id,
        url: data.secure_url,
      };
    }

    // ✅ Si la imagen ya existe en Cloudinary
    else if (image.isExisting && image.url.includes('cloudinary.com')) {
      console.log('✅ Imagen ya existente en Cloudinary:', image.public_id);
      return {
        public_id: image.public_id,
        url: image.url,
      };
    }

    // ⚠️ Caso no válido
    else {
      throw new Error('⚠️ Imagen no válida o no procesable');
    }

  } catch (error) {
    console.error('❌ ERROR en imageUpload2:', error.message);
    throw error;
  }
};