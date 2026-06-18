import React from 'react'
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
const LoadMoreBtn = ({result, page, load, handleLoadMore}) => {

    const { languageReducer } = useSelector(state => state);
    const { t } = useTranslation('jsonglobal');  
    const lang = languageReducer.language || 'en'; 

    return (
        <>
            {
                result < 9 * (page - 1) ? '' : 

                !load && <button className="btn btn-dark mx-auto d-block"
                onClick={handleLoadMore}>
                   {t('load_more', { lng: lang })}
                </button>
            }
            
        </>
    )
}

export default LoadMoreBtn
