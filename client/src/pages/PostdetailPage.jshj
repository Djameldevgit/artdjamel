import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DetailPostCard from '../components/DetailPostCard';
import Comments from '../components/home/Comments';
import InputComment from '../components/home/InputComment';

const PostDetailPage = () => {
    const { id } = useParams();
    const { auth, posts } = useSelector(state => state);
    const isAuthenticated = auth.token ? true : false;
    
    const post = posts.find(post => post._id === id);

    if (!post) return <div>Post not found</div>;

    return (
        <div>
            {/* SOLO el post con imagen y descripción */}
            <DetailPostCard post={post} />
            
            {/* Los comentarios VAN FUERA, en la página */}
            {isAuthenticated && (
                <div style={{ marginTop: '24px', padding: '0 16px' }}>
                    <InputComment post={post} />
                    <div id="comments-section" style={{ scrollMarginTop: '80px', marginTop: '16px' }}>
                        <Comments post={post} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDetailPage;