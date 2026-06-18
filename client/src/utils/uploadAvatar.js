// frontend/src/utils/imageUpload2.js

export const checkImage = (file) => {
  let err = ""
  if(!file) return err = "File does not exist."

  if(file.size > 5 * 1024 * 1024) // 5mb
  err = "The largest image size is 5mb."

  if(file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/jpg' && file.type !== 'image/gif')
  err = "Image format is incorrect. Please use JPEG, PNG, JPG or GIF."
  
  return err;
}

// frontend/src/utils/uploadAvatar.js

export const uploadAvatar = async (file) => {
    console.log('🟡 Subiendo avatar a Cloudinary...');
    console.log('📸 Archivo:', file.name, `${(file.size / 1024).toFixed(2)} KB`);
  
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }
  
    try {
      const formData = new FormData();
      formData.append('file', file);
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
  
      console.log('✅ Avatar subido exitosamente:', {
        public_id: data.public_id,
        url: data.secure_url,
      });
  
      return {
        public_id: data.public_id,
        url: data.secure_url,
      };
  
    } catch (error) {
      console.error('❌ Error subiendo avatar:', error.message);
      throw error;
    }
  };