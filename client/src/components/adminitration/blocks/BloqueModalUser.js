// 📂 components/administration/Users/BloqueModalUser.jsx - VERSIÓN CORREGIDA

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import {
  Modal,
  Button,
  Form,
  Alert,
  CloseButton
} from "react-bootstrap";
import {
  ExclamationTriangleFill,
  XCircleFill,
  Calendar2EventFill,
  InfoCircleFill,
  PersonFill,
  EnvelopeFill
} from "react-bootstrap-icons";
import { blockUser } from "../../../redux/actions/userAction"; // Corregido: importar blockUser

const BloqueModalUser = ({ show, handleClose, user }) => {
  const { auth } = useSelector(state => state);
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const [datosBloqueo, setDatosBloqueo] = useState({
    motif: "",
    description: "",
    date: "",
    time: "",
  });

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && show) {
        handleClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [show, handleClose]);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setDatosBloqueo({ ...datosBloqueo, [name]: value });
  };

  const handleBloqueo = async (e) => {
    e.preventDefault();
    setError(null);

    const { motif, date, time, description } = datosBloqueo;

    if (!motif || !date || !time || !description) {
      setError("Tous les champs sont requis");
      return;
    }

    // Vérifier que la date/heure est dans le futur
    const dateTimeLimit = `${date}T${time}`;
    const now = new Date();
    const selectedDate = new Date(dateTimeLimit);

    if (selectedDate <= now) {
      setError("La date de déblocage doit être dans le futur");
      return;
    }

    try {
      await dispatch(blockUser(
        user._id,
        {
          reason: motif,
          description: description,
          blockExpiryDate: selectedDate.toISOString()
        },
        auth.token
      ));
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du blocage");
    }
  };

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!show) {
      setDatosBloqueo({
        motif: "",
        description: "",
        date: "",
        time: "",
      });
      setError(null);
    }
  }, [show]);

  // Date minimale (demain)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      backdrop="static"
      size="lg"
    >
      <Modal.Header className="bg-danger text-white">
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangleFill className="me-2" />
          Bloquer l'utilisateur
        </Modal.Title>
        <CloseButton
          variant="white"
          onClick={handleClose}
          aria-label="Fermer"
        />
      </Modal.Header>

      <Form onSubmit={handleBloqueo}>
        <Modal.Body>
          {/* Information utilisateur */}
          <Alert variant="info" className="p-3">
            <div className="d-flex flex-wrap gap-3 justify-content-between">
              <div className="d-flex align-items-center">
                <PersonFill className="text-muted me-2" />
                <strong className="me-1">Utilisateur:</strong>
                <span>{user?.username || user?.name || 'N/A'}</span>
              </div>
              <div className="d-flex align-items-center">
                <EnvelopeFill className="text-muted me-2" />
                <strong className="me-1">Email:</strong>
                <span>{user?.email || 'N/A'}</span>
              </div>
            </div>
          </Alert>

          {error && (
            <Alert variant="danger" className="d-flex align-items-center">
              <XCircleFill className="me-2" />
              {error}
            </Alert>
          )}

          {/* Motif du blocage */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              <InfoCircleFill className="me-2 text-warning" />
              Motif du blocage
            </Form.Label>
            <Form.Select
              name="motif"
              value={datosBloqueo.motif}
              onChange={handleChangeInput}
              required
            >
              <option value="">Sélectionner un motif...</option>
              <option value="Comportement abusif">Comportement abusif</option>
              <option value="Spam">Spam</option>
              <option value="Violation des conditions">Violation des conditions d'utilisation</option>
              <option value="Langage offensant">Langage offensant</option>
              <option value="Fraude">Fraude</option>
              <option value="Usurpation d'identité">Usurpation d'identité</option>
              <option value="Contenu inapproprié">Contenu inapproprié</option>
              <option value="Violation de la vie privée">Violation de la vie privée</option>
              <option value="Activité suspecte">Activité suspecte</option>
              <option value="Autre">Autre</option>
            </Form.Select>
          </Form.Group>

          {/* Description détaillée */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Description détaillée</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={datosBloqueo.description}
              onChange={handleChangeInput}
              placeholder="Décrivez les raisons du blocage..."
              required
            />
            <Form.Text className="text-muted">
              Cette information sera visible par l'utilisateur.
            </Form.Text>
          </Form.Group>

          {/* Date et heure de déblocage */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              <Calendar2EventFill className="me-2 text-primary" />
              Date de déblocage
            </Form.Label>
            
            <div className="row">
              <div className="col-md-6 mb-2">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={datosBloqueo.date}
                  onChange={handleChangeInput}
                  required
                  min={getMinDate()}
                />
              </div>
              <div className="col-md-6 mb-2">
                <Form.Label>Heure</Form.Label>
                <Form.Control
                  type="time"
                  name="time"
                  value={datosBloqueo.time}
                  onChange={handleChangeInput}
                  required
                />
              </div>
            </div>
            
            <Form.Text className="text-muted">
              L'utilisateur restera bloqué jusqu'à cette date et heure.
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={handleClose}
          >
            Annuler
          </Button>
          <Button 
            variant="danger" 
            type="submit"
          >
            Bloquer l'utilisateur
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BloqueModalUser;