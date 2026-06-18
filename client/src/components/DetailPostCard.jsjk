 import React from 'react';
import CardBodyCarousel from './home/post_card/CardBodyCarousel';
 import CardBodyTitle from './home/post_card/CardBodyTitle';
import CardFooter from './home/post_card/CardFooter';
 
const DetailPostCard = ({ post }) => {
  if (!post) return null;

  return (
    <div className="detail-post-card bg-white rounded-xl shadow-lg overflow-hidden mb-8">
  {/* Header con información del usuario */}
                 
  <CardBodyTitle post={post} />
                    

                    {/* Contenido multimedia */}
                    <CardBodyCarousel post={post} />

                    {/* Acciones y comentarios */}
                 
                        <CardFooter post={post} />
                     

    
    </div>
  );
};

export default DetailPostCard;