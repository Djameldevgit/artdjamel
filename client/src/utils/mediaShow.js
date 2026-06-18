export const imageShow = (src, theme) => (
    <img 
      src={src} 
      alt="Preview" 
      className="w-100 h-100 object-fit-cover rounded"
      style={{ filter: theme ? 'invert(1)' : 'none' }}
    />
  );
  
  export const videoShow = (src, theme) => (
    <video
      src={src}
      controls
      className="w-100 h-100"
      style={{ filter: theme ? 'invert(1)' : 'none' }}
    />
  );