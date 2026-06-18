// utils/audioUpload.js





// utils/imageUpload2.js
export const imageUpload = async (image) => {
    console.log('🟡 INICIANDO imageUpload2 - Subiendo una sola imagen...');
    console.log('📸 Imagen recibida:', image);
  
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
  
        // 2️⃣ Subir a Cloudinary con NUEVAS credenciales
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'video_commerce'); // ✅ NUEVO preset
        formData.append('cloud_name', 'dzd58nm3l'); // ✅ NUEVO cloud name
  
        const res = await fetch('https://api.cloudinary.com/v1_1/dzd58nm3l/image/upload', { // ✅ NUEVA URL
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






export const audioUpload = async (audioSource, onProgress) => {
    try {
        console.log("🎵 Iniciando audioUpload con:", typeof audioSource);
        
        let file;
        
        if (audioSource instanceof File) {
            file = audioSource;
            console.log("📁 Es File directo:", file.name, file.size);
        }
        else if (typeof audioSource === 'string') {
            console.log("🌐 Descargando audio desde URL...");
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000);
            
            try {
                const response = await fetch(audioSource, { 
                    signal: controller.signal,
                    headers: {
                        'Accept': 'audio/mpeg,audio/*;q=0.9'
                    }
                });
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const audioBlob = await response.blob();
                console.log(`✅ Audio descargado: ${audioBlob.size} bytes`);
                
                if (audioBlob.size < 1000) {
                    throw new Error('Archivo de audio muy pequeño (posiblemente corrupto)');
                }
                
                file = new File([audioBlob], `music_${Date.now()}.mp3`, { type: 'audio/mpeg' });
                
            } catch (fetchError) {
                clearTimeout(timeoutId);
                throw new Error(`Error descargando: ${fetchError.message}`);
            }
        }
        else {
            throw new Error('Fuente de audio no válida');
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'video_commerce'); // ✅ SOLO CAMBIO: nuevo preset
        formData.append('cloud_name', 'dzd58nm3l'); // ✅ SOLO CAMBIO: nuevo cloud name
        formData.append('resource_type', 'auto');
        
        let lastError;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`📤 Intento ${attempt} de subida a Cloudinary...`);
                
                const result = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', 'https://api.cloudinary.com/v1_1/dzd58nm3l/upload'); // ✅ SOLO CAMBIO: nuevo cloud name en URL
                    
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable && onProgress) {
                            const percent = Math.round((e.loaded * 100) / e.total);
                            onProgress(percent);
                        }
                    };
                    
                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            const data = JSON.parse(xhr.responseText);
                            resolve(data);
                        } else {
                            reject(new Error(`HTTP ${xhr.status}`));
                        }
                    };
                    
                    xhr.onerror = () => reject(new Error('Network error'));
                    xhr.send(formData);
                });
                
                console.log("✅ Subida exitosa a Cloudinary:", {
                    public_id: result.public_id,
                    url: result.secure_url.substring(0, 80)
                });
                
                return { 
                    public_id: result.public_id, 
                    url: result.secure_url,
                    duration: result.duration,
                    format: result.format
                };
                
            } catch (err) {
                lastError = err;
                console.error(`❌ Intento ${attempt} falló:`, err.message);
                if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        
        throw lastError || new Error('Error después de 3 intentos');
        
    } catch (error) {
        console.error('❌ audioUpload fatal:', error);
        throw new Error(`Error subiendo audio: ${error.message}`);
    }
  };

  // utils/videoUpload.js
export const videoUpload = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'video_commerce'); // ✅ SOLO CAMBIO: nuevo preset
    formData.append('cloud_name', 'dzd58nm3l'); // ✅ SOLO CAMBIO: nuevo cloud name
    formData.append('resource_type', 'video');
    
    const xhr = new XMLHttpRequest();
    const uploadPromise = new Promise((resolve, reject) => {
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/dzd58nm3l/video/upload'); // ✅ SOLO CAMBIO: nuevo cloud name en URL
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      });
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } else {
          reject(new Error(`Cloudinary error: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
    
    const result = await uploadPromise;
    const thumbnailUrl = result.secure_url.replace(/\.[^/.]+$/, '.jpg');
    
    return {
      public_id: result.public_id,
      url: result.secure_url,
      thumbnail: thumbnailUrl,
      duration: result.duration || 0,
      format: result.format
    };
  };