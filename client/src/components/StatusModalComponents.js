import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export const WilayaCommune = ({ 
  postData, 
  handleWilayaChange, 
  handleCommuneChange, 
  wilayasOptions, 
  communesOptions 
}) => {
  const { languageReducer } = useSelector(state => state);
  const { t } = useTranslation('categorias');
  const lang = languageReducer.language || 'fr';

  return (
    <div>
      <div className="form-group">
        <label>{t('artistLocation', { lng: lang })}</label>
        <select
          className="form-control"
          name="wilaya"
          value={postData.wilaya || ''}
          onChange={handleWilayaChange}
        >
          <option value="">{t('selectWilaya', { lng: lang })}</option>
          {wilayasOptions}
        </select>
      </div>
  
      <div className="form-group">
        <select
          className="form-control"
          name="commune"
          value={postData.commune || ''}
          onChange={handleCommuneChange}
        >
          <option value="">{t('selectCommune', { lng: lang })}</option>
          {communesOptions}
        </select>
      </div>
    </div>
  );
};
  