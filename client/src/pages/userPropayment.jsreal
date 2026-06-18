// client/src/pages/userProPayment.jsx
import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { FaUniversity, FaCreditCard, FaMoneyBill, FaShieldAlt, FaCopy, FaCheck, FaArrowLeft } from 'react-icons/fa';
import './userProPayment.css';

const userProPayment = () => {
  const location = useLocation();
  const history = useHistory();
  const { plan, duration, totalPrice, category } = location.state || {};
  
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('ccp');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    transactionRef: '',
    paymentDate: ''
  });

  // Informations bancaires (à remplacer par les vôtres)
  const bankInfo = {
    ccp: '002 00001 1234567890 01',
    ccpKey: '01',
    accountName: 'VideoCommerce SARL',
    rib: '12345678901234567890',
    phoneNumber: '0550 00 00 00' // Votre numéro pour SMS
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Sauvegarder la demande de paiement dans localStorage
    const paymentRequest = {
      id: Date.now(),
      ...formData,
      plan: plan,
      duration: duration,
      totalPrice: totalPrice,
      status: 'pending',
      date: new Date().toISOString()
    };
    
    // Récupérer les demandes existantes
    const existingRequests = JSON.parse(localStorage.getItem('paymentRequests') || '[]');
    existingRequests.push(paymentRequest);
    localStorage.setItem('paymentRequests', JSON.stringify(existingRequests));
    
    setFormSubmitted(true);
  };

  if (!plan) {
    return (
      <div className="payment-error">
        <h2>Aucun plan sélectionné</h2>
        <button onClick={() => history.push('/become-pro')}>Choisir un plan</button>
      </div>
    );
  }

  if (formSubmitted) {
    return (
      <div className="payment-success-page">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Demande de paiement envoyée !</h2>
          <p>Votre demande a bien été enregistrée.</p>
          <div className="success-info">
            <p>📝 <strong>Référence:</strong> {formData.transactionRef || 'À préciser'}</p>
            <p>💰 <strong>Montant:</strong> {totalPrice} DA</p>
            <p>📅 <strong>Date:</strong> {formData.paymentDate || new Date().toLocaleDateString()}</p>
          </div>
          <div className="sms-instruction">
            <span>📱</span>
            <p>Un SMS sera envoyé au <strong>{bankInfo.phoneNumber}</strong> pour confirmer votre paiement.<br/>
            L'activation de votre compte sera effectuée sous 24h.</p>
          </div>
          <button className="btn-home" onClick={() => history.push('/')}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <button className="btn-back-page" onClick={() => history.goBack()}>
          <FaArrowLeft /> Retour
        </button>
        
        <h1 className="payment-title">💳 Paiement de votre abonnement</h1>
        
        {/* Résumé de la commande */}
        <div className="order-summary">
          <h3>Récapitulatif de votre commande</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>Plan choisi:</span>
              <strong>{plan.name}</strong>
            </div>
            <div className="summary-row">
              <span>Durée:</span>
              <strong>{duration} mois</strong>
            </div>
            <div className="summary-row">
              <span>Catégorie:</span>
              <strong>{category}</strong>
            </div>
            <div className="summary-row total">
              <span>Total à payer:</span>
              <strong className="total-price">{totalPrice} DA</strong>
            </div>
          </div>
        </div>
        
        {/* Méthodes de paiement */}
        <div className="payment-methods">
          <h3>Méthode de paiement</h3>
          <div className="methods-grid">
            <div 
              className={`method-card ${paymentMethod === 'ccp' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('ccp')}
            >
              <FaUniversity className="method-icon" />
              <span>CCP</span>
            </div>
            <div 
              className={`method-card ${paymentMethod === 'transfer' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('transfer')}
            >
              <FaMoneyBill className="method-icon" />
              <span>Virement</span>
            </div>
          </div>
        </div>
        
        {/* Informations bancaires */}
        <div className="bank-info-section">
          <h3>Coordonnées bancaires</h3>
          <div className="bank-card">
            {paymentMethod === 'ccp' ? (
              <>
                <div className="bank-row">
                  <span>CCP:</span>
                  <strong>{bankInfo.ccp}</strong>
                  <button onClick={() => handleCopy(bankInfo.ccp)} className="copy-btn">
                    {copied ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
                <div className="bank-row">
                  <span>Clé:</span>
                  <strong>{bankInfo.ccpKey}</strong>
                  <button onClick={() => handleCopy(bankInfo.ccpKey)} className="copy-btn">
                    <FaCopy />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bank-row">
                  <span>Titulaire:</span>
                  <strong>{bankInfo.accountName}</strong>
                </div>
                <div className="bank-row">
                  <span>RIB:</span>
                  <strong>{bankInfo.rib}</strong>
                  <button onClick={() => handleCopy(bankInfo.rib)} className="copy-btn">
                    <FaCopy />
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="sms-notice">
            <span>📱</span>
            <p>Après votre paiement, un SMS sera envoyé au <strong>{bankInfo.phoneNumber}</strong><br/>
            Nous vous activerons manuellement dans les plus brefs délais.</p>
          </div>
        </div>
        
        {/* Formulaire d'information */}
        <form onSubmit={handleSubmit} className="payment-form">
          <h3>Vos informations</h3>
          
          <div className="form-group">
            <label>Nom complet *</label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="Votre nom et prénom"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Numéro de téléphone *</label>
            <input
              type="tel"
              name="phoneNumber"
              required
              placeholder="0550 00 00 00"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Référence du paiement (optionnel)</label>
            <input
              type="text"
              name="transactionRef"
              placeholder="Référence CCP ou virement"
              value={formData.transactionRef}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Date du paiement *</label>
            <input
              type="date"
              name="paymentDate"
              required
              value={formData.paymentDate}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="security-note">
            <FaShieldAlt />
            <p>Vos informations sont sécurisées et servent uniquement à traiter votre demande.</p>
          </div>
          
          <button type="submit" className="submit-payment-btn">
            📤 Envoyer ma demande de paiement
          </button>
        </form>
      </div>
    </div>
  );
};

export default userProPayment;