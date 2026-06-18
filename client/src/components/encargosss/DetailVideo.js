import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const AddressInput = ({ 
    postData, 
    handleChangeInput, 
    provincesOptions, 
    townsOptions, 
    handleProvinceChange, 
    handleTownChange 
}) => {
    const { t } = useTranslation('viajes');
    
    return (
        <>
            {/* Dirección detallada de salida */}
            <Form.Group className="mb-3">
                <Form.Label>{t('direccionSalida')}</Form.Label>
                <Form.Control
                    type="text"
                    name="direccionSalida"
                    value={postData.direccionSalida || ''}
                    onChange={handleChangeInput}
                    placeholder={t('placeholderDireccion')}
                />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('provincia')}</Form.Label>
                        <Form.Select
                            name="provincia"
                            value={postData.provincia}
                            onChange={handleProvinceChange}
                            required
                        >
                            <option value="">{t('selectProvincia')}</option>
                            {provincesOptions}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('pueblo')}</Form.Label>
                        <Form.Select
                            name="pueblo"
                            value={postData.pueblo}
                            onChange={handleTownChange}
                            required
                        >
                            <option value="">{t('selectPueblo')}</option>
                            {townsOptions}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
};

export default AddressInput;