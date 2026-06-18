// src/components/planes.js - VERSIÓN COMPLETA CON SELECCIÓN DE MÉTODO DE PAGO
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FaCheck, FaStar, FaArrowRight, FaArrowLeft, FaVideo, FaHdd, FaClock, FaInfoCircle, FaShieldAlt, FaCreditCard, FaChevronLeft, FaChevronRight, FaUniversity, FaBuilding, FaEnvelope } from 'react-icons/fa';
import { postDataAPI } from '../../utils/fetchData';
import './planes.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://videocommerce.onrender.com/api';

const Planes = () => {
  const history = useHistory();
  const { auth } = useSelector(state => state);
  const token = auth?.token;
  const user = auth?.user;

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showBankInfoModal, setShowBankInfoModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const sliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Datos bancarios del propietario (cámbialos por los tuyos)
  const bankDetails = {
    name: 'BAOUALI DJAMEL',
    ccp: '004306336158',
       phone: '0658556296',
    email: 'developpementwebdjamel@gmail.com'
  };

  const categories = [
    { id: 'automobile', name: 'Automobiles & Véhicules', icon: '🚗', color: '#dc3545' },
    { id: 'informatique', name: 'Informatique', icon: '💻', color: '#007bff' },
    { id: 'meubles', name: 'Meubles & Maison', icon: '🏠', color: '#fd7e14' },
    { id: 'materiaux', name: 'Matériaux & Equipement', icon: '💎', color: '#6c757d' },
    { id: 'telephonie', name: 'Téléphonie & Accessoires', icon: '📱', color: '#17a2b8' },
    { id: 'electromenager', name: 'Electroménager', icon: '🔌', color: '#28a745' },
    { id: 'vetements', name: 'Vêtements & Mode', icon: '👕', color: '#e83e8c' },
    { id: 'sante', name: 'Santé & Beauté', icon: '❤️', color: '#20c997' },
    { id: 'loisirs', name: 'Loisirs', icon: '🎮', color: '#6f42c1' },
    { id: 'emploi', name: 'Emploi', icon: '💼', color: '#343a40' },
    { id: 'immobilier', name: 'Immobilier', icon: '🏘️', color: '#d63384' },
    { id: 'services', name: 'Services', icon: '🛠️', color: '#0dcaf0' },
    { id: 'voyages', name: 'Voyages', icon: '✈️', color: '#0d6efd' },
    { id: 'alimentaire', name: 'Alimentaire', icon: '🍔', color: '#198754' },
    { id: 'sport', name: 'Sport', icon: '⚽', color: '#ffc107' }
  ];

  const durations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const paidOffers = [
    {
      id: 'basic',
      name: 'Plan Basic',
      description: 'Pour les créateurs',
      price: 400,
      priceDisplay: '400 DA',
      currency: 'DA',
      credit: 50,
      storage: 50,
      duration: 20,
      features: [
        'Commentaires, likes, sauvegardes, partages',
        'WhatsApp intégré',
        'Support basique'
      ],
      trending: false,
      promotion: 'Payant (300 DA/vidéo/48h)'
    },
    {
      id: 'pro',
      name: 'Plan Pro',
      description: 'Pour les professionnels',
      price: 700,
      priceDisplay: '700 DA',
      currency: 'DA',
      credit: 100,
      storage: 100,
      duration: 30,
      features: [
        'Commentaires, likes, sauvegardes, partages',
        'WhatsApp, téléphone, chat, carte',
        'Musique intégrée',
        'Statistiques avancées',
        'Support prioritaire'
      ],
      trending: true,
      promotion: 'Payant (300 DA/vidéo/48h)'
    },
    {
      id: 'business',
      name: 'Plan Business',
      description: 'Pour les entreprises',
      price: 1200,
      priceDisplay: '1200 DA',
      currency: 'DA',
      credit: 'Illimité',
      storage: 500,
      duration: 50,
      features: [
        'Commentaires, likes, sauvegardes, partages',
        'WhatsApp, téléphone, chat, carte',
        'Musique intégrée',
        'Liens réseaux sociaux',
        'Distance utilisateur-produit',
        'Statistiques détaillées (likes, vues, follows, partages)',
        'Support dédié 24/7'
      ],
      trending: true,
      promotion: 'Payant (300 DA/vidéo/48h)'
    }
  ];

  // Oferta de prueba (no seleccionable)
  const trialOffer = {
    id: 'trial',
    name: 'Essai 5 jours',
    description: 'Découvrez la plateforme',
    price: 0,
    priceDisplay: 'Gratuit',
    duration: 5,
    features: [
      '1 canal',
      '1 vidéo',
      'Durée max: 20 secondes',
      'Commentaires, likes, sauvegardes, partages',
      'WhatsApp intégré'
    ]
  };

  const getDiscount = (duration, planId) => {
    if (planId === 'trial') return 0;
    if (duration >= 12) return 20;
    if (duration >= 6) return 10;
    return 0;
  };

  const getFreeMonths = (duration) => {
    if (duration >= 12) return 3;
    if (duration >= 6) return 1;
    return 0;
  };

  const calculateTotalPrice = () => {
    if (!selectedOffer) return 0;
    if (selectedOffer.id === 'trial') return 0;
    const discount = getDiscount(selectedDuration, selectedOffer.id);
    const total = selectedOffer.price * selectedDuration;
    return total * (1 - discount / 100);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedCategory) {
      setStep(2);
    } else if (step === 2 && selectedDuration) {
      setStep(3);
    } else if (step === 3 && selectedOffer) {
      setStep(4);
    }
  };

  // Al hacer clic en "Continuer vers paiement" desde el resumen, mostramos modal de método de pago
  const handleProceedToPaymentMethod = () => {
    if (selectedOffer?.id === 'trial') {
      // Plan de prueba: activar directamente
      activateTrialPlan();
    } else {
      setShowPaymentMethodModal(true);
    }
  };

  // Activar plan de prueba (llamar al backend)
  const activateTrialPlan = async () => {
    setLoading(true);
    try {
      const response = await postDataAPI('activate-free-plan', {
        plan_id: 'trial',
        category: selectedCategory
      }, token);
      if (response.data?.success) {
        alert('Plan d\'essai activé avec succès ! Vous pouvez maintenant créer votre canal.');
        history.push('/dashboard');
      } else {
        alert(response.data?.error || 'Erreur lors de l\'activation du plan d\'essai');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  // Pago online con Chargily
  const handleOnlinePayment = async () => {
    setShowPaymentMethodModal(false);
    setLoading(true);
    try {
      const totalPrice = calculateTotalPrice();
      const discount = getDiscount(selectedDuration, selectedOffer.id);
      const freeMonths = getFreeMonths(selectedDuration);
      const paymentData = {
        plan_id: selectedOffer.id,
        plan_name: selectedOffer.name,
        amount: totalPrice,
        currency: 'dzd',
        duration_months: selectedDuration,
        discount_percent: discount,
        free_months: freeMonths,
        category: selectedCategory
      };
      const response = await postDataAPI('create-checkout', paymentData, token);
      const checkoutUrl = response.data?.checkout_url || response.data?.data?.checkout_url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert('Erreur: impossible de créer le paiement. URL manquante.');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la création du paiement');
    } finally {
      setLoading(false);
    }
  };

  // Pago en oficina CCP: mostrar modal con datos bancarios
  const handleOfflinePayment = () => {
    setShowPaymentMethodModal(false);
    setShowBankInfoModal(true);
  };

  // Confirmar solicitud de pago offline
  const confirmOfflinePaymentRequest = async () => {
    setLoading(true);
    try {
      // Enviar notificación al servidor (ejemplo: guardar solicitud en BD y enviar email al admin)
      const requestData = {
        userId: user?._id,
        userEmail: user?.email,
        userName: user?.fullname || user?.username,
        plan: selectedOffer.name,
        duration: selectedDuration,
        totalAmount: calculateTotalPrice(),
        category: selectedCategory,
        paymentMethod: 'ccp_office',
        status: 'pending'
      };
      await postDataAPI('offline-payment-request', requestData, token);
      alert('Votre demande a été enregistrée. Nous vous contacterons dès confirmation du paiement.');
      history.push('/profile');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'envoi de la demande. Veuillez réessayer ou contacter le support.');
    } finally {
      setLoading(false);
      setShowBankInfoModal(false);
    }
  };

  // Componentes de pasos (simplificados pero completos)
  const Step1 = () => (
    <div className="step-container">
      <div className="step-header">
        <span className="step-number">1</span>
        <h2 className="step-title">Sélectionnez votre catégorie</h2>
      </div>
      <p className="step-subtitle">Choisissez la catégorie de votre chaîne</p>
      <div className="categories-slider-wrapper">
        {showLeftArrow && <button className="slider-arrow-btn" onClick={() => scrollSlider('left')}><FaChevronLeft /></button>}
        <div className="categories-slider" ref={sliderRef}>
          {categories.map(cat => (
            <div key={cat.id} className={`category-card ${selectedCategory === cat.id ? 'selected' : ''}`} onClick={() => setSelectedCategory(cat.id)} style={{ borderColor: selectedCategory === cat.id ? cat.color : '#e0e0e0' }}>
              <div className="category-icon" style={{ color: cat.color, fontSize: '32px' }}>{cat.icon}</div>
              <div className="category-name">{cat.name}</div>
              {selectedCategory === cat.id && <div className="category-selected-check">✓</div>}
            </div>
          ))}
        </div>
        {showRightArrow && <button className="slider-arrow-btn" onClick={() => scrollSlider('right')}><FaChevronRight /></button>}
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="step-container">
      <div className="step-header">
        <span className="step-number">2</span>
        <h2 className="step-title">Choisir une durée</h2>
      </div>
      <p className="step-subtitle">Sélectionnez la durée de votre abonnement</p>
      <div className="durations-grid">
        {durations.map(month => {
          const freeMonths = getFreeMonths(month);
          return (
            <div key={month} className={`duration-card ${selectedDuration === month ? 'selected' : ''}`} onClick={() => setSelectedDuration(month)}>
              <div className="duration-month">{month} Mois</div>
              {freeMonths > 0 && <div className="duration-badge">{freeMonths} mois offert{freeMonths > 1 ? 's' : ''}</div>}
              {month >= 6 && month < 12 && <div className="duration-discount">-10%</div>}
              {month >= 12 && <div className="duration-discount">-20% + 3 mois</div>}
            </div>
          );
        })}
      </div>
      <div className="duration-info">
        <p>💡 <strong>Astuce :</strong> Plus la durée est longue, plus vous économisez !</p>
        <p>🎁 À partir de 6 mois : 1 mois offert</p>
        <p>🏆 À partir de 12 mois : 3 mois offerts + réduction de 20%</p>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="step-container">
      <div className="step-header">
        <span className="step-number">3</span>
        <h2 className="step-title">Choisir une offre</h2>
      </div>
      <p className="step-subtitle">Sélectionnez le plan adapté à votre canal</p>
      
      {/* Plan d'essai (non sélectionnable, juste informatif) */}
      <div className="trial-card-info">
        <div className="trial-badge">🎁 Période d'essai</div>
        <div className="trial-content">
          <h3>{trialOffer.name}</h3>
          <p>{trialOffer.description} – {trialOffer.duration} jours gratuits</p>
          <ul>
            {trialOffer.features.map((feat, idx) => <li key={idx}><FaCheck className="check-icon" /> {feat}</li>)}
          </ul>
          <div className="trial-note">💡 Créez votre canal pour activer l'essai automatiquement.</div>
        </div>
      </div>

      <div className="offers-grid">
        {paidOffers.map(offer => {
          const discount = getDiscount(selectedDuration, offer.id);
          const totalPrice = offer.price * selectedDuration;
          const finalPrice = totalPrice * (1 - discount / 100);
          const freeMonths = getFreeMonths(selectedDuration);
          return (
            <div key={offer.id} className={`offer-card ${selectedOffer?.id === offer.id ? 'selected' : ''}`} onClick={() => setSelectedOffer(offer)}>
              {offer.trending && <div className="offer-badge">🚀 Recommandé</div>}
              <div className="offer-header">
                <h3 className="offer-name">{offer.name}</h3>
                <p className="offer-desc">{offer.description}</p>
              </div>
              <div className="offer-price">
                <span className="price-amount">{offer.priceDisplay}</span>
                <span className="price-period">/mois</span>
              </div>
              {selectedDuration > 0 && (
                <div className="offer-total">
                  <span className="total-label">Total pour {selectedDuration} mois :</span>
                  <span className="total-amount">{finalPrice.toFixed(0)} DA</span>
                  {discount > 0 && <span className="total-discount">-{discount}%</span>}
                  {freeMonths > 0 && <span className="total-free">+{freeMonths} mois offert{freeMonths > 1 ? 's' : ''}</span>}
                </div>
              )}
              <div className="offer-features">
                <div className="feature-row"><FaVideo /> <span>{offer.credit === 'Illimité' ? 'Vidéos illimitées' : `${offer.credit} vidéos`}</span></div>
                <div className="feature-row"><FaHdd /> <span>Stockage {offer.storage} MB</span></div>
                <div className="feature-row"><FaClock /> <span>Durée max: {offer.duration} sec</span></div>
                {offer.features.map((feat, idx) => <div key={idx} className="feature-row"><FaCheck className="check-icon" /> <span>{feat}</span></div>)}
              </div>
              <button className={`select-offer-btn ${selectedOffer?.id === offer.id ? 'selected' : ''}`}>
                {selectedOffer?.id === offer.id ? '✓ Sélectionné' : 'Sélectionner'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Step4 = () => {
    const freeMonths = getFreeMonths(selectedDuration);
    const discount = getDiscount(selectedDuration, selectedOffer?.id);
    const totalPrice = calculateTotalPrice();
    return (
      <div className="step-container">
        <div className="step-header">
          <span className="step-number">4</span>
          <h2 className="step-title">Récapitulatif de votre offre</h2>
        </div>
        <p className="step-subtitle">Vérifiez les détails de votre abonnement</p>
        <div className="complete-summary">
          <div className="summary-section">
            <h3><FaStar className="section-icon" /> Plan sélectionné</h3>
            <div className="plan-detail-card">
              <div className="plan-name-large">
                <span className="plan-badge" style={{ background: selectedOffer?.id === 'basic' ? '#667eea' : selectedOffer?.id === 'pro' ? '#f093fb' : '#f6b93b' }}>
                  {selectedOffer?.name}
                </span>
              </div>
              <div className="plan-price-large">
                {selectedOffer?.id === 'trial' ? <span>Gratuit</span> : <span>{totalPrice.toFixed(0)} DA <small>pour {selectedDuration} mois</small></span>}
              </div>
            </div>
          </div>
          <div className="summary-section">
            <h3><FaInfoCircle className="section-icon" /> Détails de l'abonnement</h3>
            <div className="subscription-details">
              <div className="detail-row"><span>Catégorie:</span><strong>{categories.find(c => c.id === selectedCategory)?.name}</strong></div>
              <div className="detail-row"><span>Durée:</span><strong>{selectedDuration} mois</strong></div>
              {freeMonths > 0 && <div className="detail-row free"><span>🎁 Mois offerts:</span><strong>+{freeMonths} mois</strong></div>}
              {discount > 0 && <div className="detail-row discount"><span>🏷️ Réduction:</span><strong>-{discount}%</strong></div>}
              <div className="detail-row total"><span>Total à payer:</span><strong className="total-amount-summary">{totalPrice.toFixed(0)} DA</strong></div>
            </div>
          </div>
          <div className="info-note"><FaShieldAlt /><p>Paiement sécurisé via Chargily Pay ou par virement CCP.</p></div>
        </div>
        <div className="navigation-buttons step4-buttons">
          <button className="btn-back" onClick={() => setStep(3)}><FaArrowLeft /> Modifier</button>
          <button className="btn-next" onClick={handleProceedToPaymentMethod} disabled={loading}>{loading ? 'Traitement...' : 'Continuer vers paiement'} {!loading && <FaArrowRight />}</button>
        </div>
      </div>
    );
  };

  const getStepContent = () => {
    switch(step) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 />;
      default: return <Step1 />;
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedCategory;
    if (step === 2) return selectedDuration;
    if (step === 3) return selectedOffer;
    if (step === 4) return true;
    return false;
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 200;
      sliderRef.current.scrollTo({ left: sliderRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount), behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      const check = () => {
        setShowLeftArrow(slider.scrollLeft > 0);
        setShowRightArrow(slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 10);
      };
      slider.addEventListener('scroll', check);
      check();
      return () => slider.removeEventListener('scroll', check);
    }
  }, []);

  return (
    <div className="become-pro-page">
      <div className="progress-bar">
        <div className="progress-steps">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}><div className="step-circle">1</div><span>Catégorie</span></div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}><div className="step-circle">2</div><span>Durée</span></div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}><div className="step-circle">3</div><span>Offre</span></div>
          <div className={`progress-line ${step >= 4 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}><div className="step-circle">4</div><span>Récap</span></div>
        </div>
      </div>

      {getStepContent()}

      {step !== 4 && (
        <div className="navigation-buttons">
          {step > 1 && <button className="btn-back" onClick={() => setStep(step - 1)}><FaArrowLeft /> Retour</button>}
          <button className={`btn-next ${!canProceed() ? 'disabled' : ''}`} onClick={handleNextStep} disabled={!canProceed() || loading}>Continuer <FaArrowRight /></button>
        </div>
      )}

      {/* Modal de selección de método de pago */}
      {showPaymentMethodModal && (
        <div className="payment-method-modal-overlay">
          <div className="payment-method-modal">
            <h3>Choisissez votre moyen de paiement</h3>
            <div className="payment-methods-list">
              <div className="payment-method" onClick={handleOnlinePayment}>
                <FaCreditCard className="method-icon" />
                <div>
                  <strong>Paiement en ligne (Chargily)</strong>
                  <p>Carte Edahabia / CIB – Activation instantanée</p>
                </div>
              </div>
              <div className="payment-method" onClick={handleOfflinePayment}>
                <FaBuilding className="method-icon" />
                <div>
                  <strong>Paiement en bureau CCP/Baridimob</strong>
                  <p>Virement bancaire – Activation manuelle sous 24h</p>
                </div>
              </div>
            </div>
            <button className="close-modal-btn" onClick={() => setShowPaymentMethodModal(false)}>Fermer</button>
          </div>
        </div>
      )}

      {/* Modal con información bancaria para pago offline */}
      {showBankInfoModal && (
        <div className="payment-method-modal-overlay">
          <div className="payment-method-modal bank-modal">
            <h3>Coordonnées pour paiement CCP</h3>
            <div className="bank-details">
              <p><strong>Bénéficiaire :</strong> {bankDetails.name}</p>
              <p><strong>N° CCP :</strong> {bankDetails.ccp}</p>
              <p><strong>Téléphone :</strong> {bankDetails.phone}</p>
              <p><strong>Email :</strong> {bankDetails.email}</p>
            </div>
            <div className="bank-instructions">
              <p>📌 Après avoir effectué le virement, veuillez nous en informer par téléphone afin que nous puissions activer manuellement votre plan de paiement.</p>
            </div>
            <div className="modal-buttons">
                 <button className="btn-cancel-modal" onClick={() => setShowBankInfoModal(false)}>Sortir </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planes;