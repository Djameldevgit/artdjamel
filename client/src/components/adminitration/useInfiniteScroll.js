// 📂 hooks/useInfiniteScroll.js - VERSIÓN SIMPLIFICADA

import { useEffect, useRef, useCallback } from 'react';

const useInfiniteScroll = (hasMore, loading, onLoadMore) => {
    const observerRef = useRef();
    const loadingRef = useRef(loading);
    const hasMoreRef = useRef(hasMore);
    const onLoadMoreRef = useRef(onLoadMore);
    
    // Mantener referencias actualizadas
    useEffect(() => {
        loadingRef.current = loading;
        hasMoreRef.current = hasMore;
        onLoadMoreRef.current = onLoadMore;
    }, [loading, hasMore, onLoadMore]);
    
    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        
        if (target.isIntersecting && !loadingRef.current && hasMoreRef.current) {
            console.log('🔄 Scroll infinito: Cargando más...');
            onLoadMoreRef.current();
        }
    }, []);
    
    useEffect(() => {
        const element = observerRef.current;
        if (!element) return;
        
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '0px 0px 200px 0px',
            threshold: 0.1
        });
        
        observer.observe(element);
        
        return () => {
            if (observer) observer.disconnect();
        };
    }, [handleObserver]);
    
    return observerRef;
};

export default useInfiniteScroll;