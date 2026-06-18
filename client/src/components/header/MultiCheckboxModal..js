import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { updateSettings } from "../../redux/actions/settingsAction";

const MultiCheckboxModal = ({ show, onClose }) => {
  const dispatch = useDispatch();
  const { settings, auth } = useSelector((state) => state);
  const [features, setFeatures] = useState(settings);

  useEffect(() => {
    setFeatures(settings);
  }, [settings]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFeatures({ ...features, [name]: checked });
  };

  const handleSave = () => {
    dispatch(updateSettings(features, auth.token));
    onClose();
  };

  // Todas las features en un array plano
  const allFeatures = [
    { name: "style", label: "Modo Oscuro", icon: "🌙" },
    { name: "theme", label: "Tema Premium", icon: "🎨" },
    { name: "images", label: "Soporte de Imágenes", icon: "🖼️" },
    { name: "ecommerce", label: "E-commerce", icon: "🛒" },
    { name: "notifications", label: "Notificaciones", icon: "🔔" },
    { name: "cache", label: "Cache Avanzado", icon: "⚡" },
    { name: "lazyLoad", label: "Carga Diferida", icon: "📱" },
    { name: "analytics", label: "Analytics", icon: "📊" },
    { name: "chat", label: "Chat en Vivo", icon: "💬" },
    { name: "backup", label: "Backup Automático", icon: "💾" }
  ];

  return (
    <Modal show={show} onHide={onClose}   size="md">
    <div closeButton className="bg-primary text-white">
      <Modal.Title className="text-center w-100">
        ⚙️ Configuración
      </Modal.Title>
    </div>
    
    <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
      {/* Checkboxes en filas limpias */}
      <div className="d-flex flex-column">
        {allFeatures.map((feature, index) => (
          <Form.Check key={index} className="w-100 mb-2">
            <div className="d-flex align-items-center p-2">
              <Form.Check.Input
                type="checkbox"
                name={feature.name}
                checked={features[feature.name] || false}
                onChange={handleChange}
                className="me-3"
              />
              <Form.Check.Label className="d-flex align-items-center">
                <span className="fs-5 me-3">{feature.icon}</span>
                <span>{feature.label}</span>
              </Form.Check.Label>
            </div>
          </Form.Check>
        ))}
      </div>
    </Modal.Body>

    <Modal.Footer className="justify-content-center border-top">
      <Button variant="outline-secondary" onClick={onClose} className="me-2">
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Guardar
      </Button>
    </Modal.Footer>
  </Modal>
  );
};

export default MultiCheckboxModal;