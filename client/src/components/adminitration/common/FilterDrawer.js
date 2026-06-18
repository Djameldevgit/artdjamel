// src/components/administration/common/FilterDrawer.jsx
import React, { useState, useEffect } from 'react';
import {
  Offcanvas,
  Form,
  Button,
  Row,
  Col,
  Accordion,
  Badge
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Calendar, SortDown, Flag, Person, Shop } from 'react-bootstrap-icons';
import styles from './FilterDrawer.css';
import FilterLeft from './FilterLeft';

const FilterDrawer = ({ show, onHide, onApply, currentFilters, entityType }) => {
  const { t } = useTranslation('admin');
  const [filters, setFilters] = useState({});

  // Configuración de filtros por tipo de entidad
  const filterConfig = {
    users: [
      {
        id: 'status',
        label: t('filters.user.status'),
        type: 'select',
        options: [
          { value: 'active', label: t('filters.user.active') },
          { value: 'inactive', label: t('filters.user.inactive') },
          { value: 'blocked', label: t('filters.user.blocked') },
          { value: 'verified', label: t('filters.user.verified') }
        ]
      },
      {
        id: 'role',
        label: t('filters.user.role'),
        type: 'select',
        options: [
          { value: 'user', label: 'Usuario' },
          { value: 'admin', label: 'Admin' },
          { value: 'moderator', label: 'Moderador' },
          { value: 'boutique', label: 'Boutique' }
        ]
      },
      {
        id: 'dateRange',
        label: t('filters.user.registrationDate'),
        type: 'dateRange'
      },
      {
        id: 'activity',
        label: t('filters.user.activity'),
        type: 'select',
        options: [
          { value: 'high', label: 'Alta actividad' },
          { value: 'medium', label: 'Media actividad' },
          { value: 'low', label: 'Baja actividad' }
        ]
      }
    ],
    posts: [
      {
        id: 'type',
        label: t('filters.post.type'),
        type: 'select',
        options: [
          { value: 'text', label: 'Texto' },
          { value: 'image', label: 'Imagen' },
          { value: 'video', label: 'Video' }
        ]
      },
      {
        id: 'status',
        label: t('filters.post.status'),
        type: 'select',
        options: [
          { value: 'published', label: 'Publicado' },
          { value: 'hidden', label: 'Oculto' },
          { value: 'reported', label: 'Reportado' }
        ]
      },
      {
        id: 'dateRange',
        label: t('filters.post.date'),
        type: 'dateRange'
      },
      {
        id: 'engagement',
        label: 'Engagement',
        type: 'range',
        min: 0,
        max: 1000,
        step: 10
      }
    ],
    boutiques: [
      {
        id: 'status',
        label: t('filters.boutique.status'),
        type: 'select',
        options: [
          { value: 'active', label: 'Activa' },
          { value: 'pending', label: 'Pendiente' },
          { value: 'suspended', label: 'Suspendida' }
        ]
      },
      {
        id: 'verification',
        label: t('filters.boutique.verification'),
        type: 'select',
        options: [
          { value: 'verified', label: 'Verificada' },
          { value: 'unverified', label: 'No verificada' }
        ]
      }
    ],
    reports: [
      {
        id: 'status',
        label: t('filters.report.status'),
        type: 'select',
        options: [
          { value: 'pending', label: 'Pendiente' },
          { value: 'resolved', label: 'Resuelto' },
          { value: 'dismissed', label: 'Rechazado' }
        ]
      },
      {
        id: 'type',
        label: t('filters.report.type'),
        type: 'select',
        options: [
          { value: 'spam', label: 'Spam' },
          { value: 'harassment', label: 'Acoso' },
          { value: 'inappropriate', label: 'Contenido inapropiado' }
        ]
      }
    ]
  };

  useEffect(() => {
    // Inicializar filtros con los actuales
    setFilters(currentFilters);
  }, [currentFilters, show]);

  const handleFilterChange = (filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const handleDateRangeChange = (filterId, rangeType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: {
        ...prev[filterId],
        [rangeType]: value
      }
    }));
  };

  const handleRangeChange = (filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: parseInt(value)
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
    onApply({});
    onHide();
  };

  const handleApply = () => {
    onApply(filters);
  };

  const renderFilter = (filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <Form.Select
            value={filters[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          >
            <option value="">{t('filters.all')}</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        );

      case 'dateRange':
        return (
          <Row>
            <Col xs={6}>
              <Form.Label className="small">Desde</Form.Label>
              <Form.Control
                type="date"
                value={filters[filter.id]?.from || ''}
                onChange={(e) => handleDateRangeChange(filter.id, 'from', e.target.value)}
              />
            </Col>
            <Col xs={6}>
              <Form.Label className="small">Hasta</Form.Label>
              <Form.Control
                type="date"
                value={filters[filter.id]?.to || ''}
                onChange={(e) => handleDateRangeChange(filter.id, 'to', e.target.value)}
              />
            </Col>
          </Row>
        );

      case 'range':
        return (
          <>
            <Form.Range
              min={filter.min}
              max={filter.max}
              step={filter.step}
              value={filters[filter.id] || filter.min}
              onChange={(e) => handleRangeChange(filter.id, e.target.value)}
            />
            <div className="d-flex justify-content-between mt-1">
              <small>{filter.min}</small>
              <small className="text-primary">{filters[filter.id] || filter.min}</small>
              <small>{filter.max}</small>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const currentConfig = filterConfig[entityType] || [];

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className={styles.drawer}>
      <Offcanvas.Header closeButton className={styles.drawerHeader}>
        <Offcanvas.Title>
          <FilterLeft className="me-2" />
          {t('filters.title')}
          {Object.keys(filters).length > 0 && (
            <Badge bg="info" className="ms-2">
              {Object.keys(filters).length}
            </Badge>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className={styles.drawerBody}>
        <Accordion defaultActiveKey="0" flush>
          {currentConfig.map((filter, idx) => (
            <Accordion.Item key={filter.id} eventKey={String(idx)}>
              <Accordion.Header>
                {getFilterIcon(filter.id)}
                <span className="ms-2">{filter.label}</span>
                {filters[filter.id] && (
                  <Badge bg="primary" className="ms-2">✓</Badge>
                )}
              </Accordion.Header>
              <Accordion.Body>
                {renderFilter(filter)}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>

        {/* Filtros rápidos */}
        <div className={styles.quickFilters}>
          <h6 className="mt-4 mb-3">{t('filters.quickFilters')}</h6>
          <div className="d-flex flex-wrap gap-2">
            <Button size="sm" variant="outline-secondary">
              Última semana
            </Button>
            <Button size="sm" variant="outline-secondary">
              Último mes
            </Button>
            <Button size="sm" variant="outline-secondary">
              Más reportados
            </Button>
            <Button size="sm" variant="outline-secondary">
              Más activos
            </Button>
          </div>
        </div>
      </Offcanvas.Body>

      <div className={styles.drawerFooter}>
        <Button variant="outline-secondary" onClick={handleClearFilters} className="me-2">
          {t('filters.clear')}
        </Button>
        <Button variant="primary" onClick={handleApply}>
          {t('filters.apply')}
        </Button>
      </div>
    </Offcanvas>
  );
};

const getFilterIcon = (filterId) => {
  const icons = {
    status: <Flag size={16} />,
    dateRange: <Calendar size={16} />,
    activity: <SortDown size={16} />,
    role: <Person size={16} />,
    verification: <Shop size={16} />
  };
  return icons[filterId] || null;
};

export default FilterDrawer;