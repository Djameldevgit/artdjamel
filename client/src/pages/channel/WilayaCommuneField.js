// frontend/src/pages/CreateChannel/WilayaCommuneField.js
import React, { useState, useEffect } from 'react';
import wilayasData from './wilayas.json';

const WilayaCommuneField = (props) => {
  // Detectar qué modo de uso estamos usando
  const isUsingPostData = props.postData && props.handleChangeInput;
  const isUsingDirectProps = props.wilaya !== undefined && props.onWilayaChange;
  
  // Obtener valores según el modo
  const currentWilaya = isUsingPostData ? (props.postData?.wilaya || "") : (props.wilaya || "");
  const currentCommune = isUsingPostData ? (props.postData?.commune || "") : (props.commune || "");
  
  const [communes, setCommunes] = useState([]);

  // Cargar comunas cuando cambia la wilaya
  useEffect(() => {
    if (currentWilaya && wilayasData) {
      const wilayaEncontrada = wilayasData.find(w => 
        w.wilaya === currentWilaya || 
        w.name === currentWilaya ||
        String(w.code) === currentWilaya
      );
      
      if (wilayaEncontrada && wilayaEncontrada.commune) {
        setCommunes(wilayaEncontrada.commune);
      } else {
        setCommunes([]);
      }
    } else {
      setCommunes([]);
    }
  }, [currentWilaya]);

  const handleWilayaChange = (e) => {
    const value = e.target.value;
    
    if (isUsingPostData) {
      props.handleChangeInput({ target: { name: 'wilaya', value } });
      props.handleChangeInput({ target: { name: 'commune', value: '' } });
    } else if (isUsingDirectProps) {
      props.onWilayaChange(value);
      if (props.onCommuneChange) {
        props.onCommuneChange('');
      }
    }
  };

  const handleCommuneChange = (e) => {
    const value = e.target.value;
    
    if (isUsingPostData) {
      props.handleChangeInput({ target: { name: 'commune', value } });
    } else if (isUsingDirectProps) {
      props.onCommuneChange(value);
    }
  };

  return (
    <>
      {/* Wilaya */}
      <div className="form-group">
        <label className="form-label">
          Wilaya <span className="required-star">*</span>
        </label>
        <select
          className="form-select"
          value={currentWilaya}
          onChange={handleWilayaChange}
          required
        >
          <option value="">Sélectionner une wilaya</option>
          {wilayasData && wilayasData.map((wilaya, index) => {
            const wilayaName = wilaya.wilaya || wilaya.name || `Wilaya ${wilaya.code}`;
            const wilayaValue = wilaya.wilaya || wilaya.name || String(wilaya.code);
            return (
              <option key={index} value={wilayaValue}>
                {wilayaName}
              </option>
            );
          })}
        </select>
      </div>
      
      {/* Commune */}
      {currentWilaya && communes.length > 0 && (
        <div className="form-group">
          <label className="form-label">
            Commune <span className="required-star">*</span>
          </label>
          <select
            className="form-select"
            value={currentCommune}
            onChange={handleCommuneChange}
            required
          >
            <option value="">Sélectionner une commune</option>
            {communes.map((commune, index) => {
              const communeName = typeof commune === 'string' ? commune : (commune.name || commune);
              return (
                <option key={index} value={communeName}>
                  {communeName}
                </option>
              );
            })}
          </select>
        </div>
      )}
      
      {currentWilaya && communes.length === 0 && (
        <div className="alert-info">
          <small>Aucune commune disponible pour cette wilaya</small>
        </div>
      )}
    </>
  );
};

export default WilayaCommuneField;