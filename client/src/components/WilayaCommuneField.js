// components/CATEGORIES/camposComun/WilayaCommuneField.js
import React, { useState, useEffect } from 'react';
 import wilayasData from './json/wilayas.json';
 
const WilayaCommuneField = ({
  postData,
  handleChangeInput,
  ...props
}) => {
  const [selectedWilaya, setSelectedWilaya] = useState(postData?.wilaya || "");
  const [communes, setCommunes] = useState([]);

  useEffect(() => {
    if (selectedWilaya && wilayasData) {
      const wilayaEncontrada = wilayasData.find((wilaya) => 
        wilaya.wilaya === selectedWilaya || wilaya.name === selectedWilaya || wilaya.code === selectedWilaya
      );
      
      let communesList = [];
      
      if (wilayaEncontrada) {
        if (wilayaEncontrada.commune && Array.isArray(wilayaEncontrada.commune)) {
          communesList = wilayaEncontrada.commune;
        } else if (wilayaEncontrada.communes && Array.isArray(wilayaEncontrada.communes)) {
          communesList = wilayaEncontrada.communes;
        } else if (wilayaEncontrada.municipalities && Array.isArray(wilayaEncontrada.municipalities)) {
          communesList = wilayaEncontrada.municipalities;
        }
      }
      
      setCommunes(communesList);
      
      // Limpiar comuna al cambiar wilaya
      if (postData?.commune) {
        handleChangeInput({
          target: { name: 'commune', value: '' }
        });
      }
    } else {
      setCommunes([]);
    }
  }, [selectedWilaya]);

  const handleWilayaChange = (e) => {
    const value = e.target.value;
    setSelectedWilaya(value);
    
    handleChangeInput({
      target: { name: 'wilaya', value: value }
    });
    
    // Limpiar comuna
    handleChangeInput({
      target: { name: 'commune', value: '' }
    });
  };

  const handleCommuneChange = (e) => {
    handleChangeInput({
      target: { name: 'commune', value: e.target.value }
    });
  };

  return (
    <>
      {/* Wilaya */}
      <div className="mb-3">
        <label className="form-label fw-bold">
          Wilaya <span className="text-danger">*</span>
        </label>
        <select
          name="wilaya"
          className="form-control"
          value={postData?.wilaya || ''}
          onChange={handleWilayaChange}
          required
        >
          <option value="">Sélectionner une wilaya</option>
          {wilayasData && wilayasData.map((wilaya, index) => {
            const wilayaName = wilaya.wilaya || wilaya.name || wilaya.nom || `Wilaya ${wilaya.code}`;
            const wilayaValue = wilaya.wilaya || wilaya.name || wilaya.code || wilayaName;
            
            return (
              <option key={index} value={wilayaValue}>
                {wilayaName}
              </option>
            );
          })}
        </select>
      </div>
      
      {/* Commune */}
      {selectedWilaya && communes.length > 0 && (
        <div className="mb-3">
          <label className="form-label fw-bold">
            Commune <span className="text-danger">*</span>
          </label>
          <select
            name="commune"
            className="form-control"
            value={postData?.commune || ''}
            onChange={handleCommuneChange}
            required
          >
            <option value="">Sélectionner une commune</option>
            {communes.map((commune, index) => {
              const communeName = typeof commune === 'string' ? commune : (commune.name || commune.nom || commune);
              const communeValue = typeof commune === 'string' ? commune : (commune.name || commune.nom || commune);
              
              return (
                <option key={index} value={communeValue}>
                  {communeName}
                </option>
              );
            })}
          </select>
        </div>
      )}
      
      {selectedWilaya && communes.length === 0 && (
        <div className="alert alert-warning py-2 mb-3">
          <small>Aucune commune disponible pour cette wilaya</small>
        </div>
      )}
    </>
  );
};

export default WilayaCommuneField;