// pages/OrderHelpPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaEye, FaTrash, FaClock, FaCheckCircle, FaTruck,
  FaBoxOpen, FaTimesCircle, FaUndo, FaShieldAlt, FaLock, FaCreditCard
} from 'react-icons/fa';
import './help.css'

const OrderHelpPage = () => {
  const statusData = [
    {
      status: 'pending',
      icon: <FaClock className="help-icon pending-icon" />,
      label: 'En attente',
      description: 'Votre commande a été créée mais le paiement n\'a pas encore été confirmé. Vous pouvez encore la modifier ou l\'annuler.',
      action: '❌ Vous pouvez la supprimer si vous changez d\'avis.'
    },
    {
      status: 'paid',
      icon: <FaCheckCircle className="help-icon paid-icon" />,
      label: 'Payée',
      description: 'Le paiement a été confirmé. L\'œuvre vous est réservée et sera bientôt préparée pour l\'envoi.',
      action: '🔒 Cette commande est définitive. Contactez le support pour toute demande.'
    },
    {
      status: 'shipped',
      icon: <FaTruck className="help-icon shipped-icon" />,
      label: 'Expédiée',
      description: 'Votre œuvre a quitté l\'atelier et est en route vers chez vous. Vous recevrez un numéro de suivi.',
      action: '📦 Suivez votre colis dans l\'espace de suivi.'
    },
    {
      status: 'delivered',
      icon: <FaBoxOpen className="help-icon delivered-icon" />,
      label: 'Livrée',
      description: 'Votre œuvre est arrivée ! Profitez de votre nouvelle acquisition et n\'hésitez pas à partager votre avis.',
      action: '⭐ Vous pouvez laisser un avis sur l\'œuvre et l\'artiste.'
    },
    {
      status: 'cancelled',
      icon: <FaTimesCircle className="help-icon cancelled-icon" />,
      label: 'Annulée',
      description: 'La commande a été annulée avant ou après paiement (avec remboursement si nécessaire).',
      action: '❌ Vous pouvez la supprimer définitivement de votre historique.'
    },
    {
      status: 'refunded',
      icon: <FaUndo className="help-icon refunded-icon" />,
      label: 'Remboursée',
      description: 'Le paiement a été remboursé. Cette commande est close et ne donne plus droit à l\'œuvre.',
      action: '📄 Cette commande reste dans votre historique pour référence.'
    }
  ];

  return (
    <div className="help-page-container">
      {/* ======== HEADER ======== */}
      <div className="help-header">
        <h1>🖼️ Comprendre vos commandes</h1>
        <p className="help-subtitle">
          Bienvenue dans votre espace d'achat d'art. Voici comment suivre vos œuvres et gérer vos commandes en toute confiance.
        </p>
        <Link to="/userorders" className="btn btn-outline-light btn-sm">
          ← Retour à mes commandes
        </Link>
      </div>

      <div className="help-content">
        {/* ======== SECTION SÉCURITÉ ======== */}
        <div className="help-section security-section">
          <div className="security-badge">
            <FaShieldAlt className="security-icon" />
            <span className="security-label">Paiement 100% sécurisé</span>
          </div>
          <h2>🔒 Votre paiement est protégé</h2>
          <p className="security-description">
            Nous utilisons <strong>Chargily</strong>, la passerelle de paiement la plus fiable et sécurisée en Algérie.
            Toutes vos transactions sont cryptées et protégées. Vos données bancaires ne sont jamais stockées sur notre serveur.
          </p>
          <div className="security-features">
            <div className="security-feature">
              <FaLock className="feature-icon" />
              <span>Cryptage SSL 256 bits</span>
            </div>
            <div className="security-feature">
              <FaCreditCard className="feature-icon" />
              <span>Paiement par carte bancaire, EDAHABIA, CIB</span>
            </div>
            <div className="security-feature">
              <FaShieldAlt className="feature-icon" />
              <span>Conformité aux normes bancaires algériennes</span>
            </div>
          </div>
          <div className="security-cta">
            <a
              href="https://chargily.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-info btn-sm"
            >
              En savoir plus sur Chargily →
            </a>
          </div>
        </div>

        {/* ======== SECTION ÉTATS ======== */}
        <div className="help-section">
          <h2>📊 États de vos commandes</h2>
          <p className="help-description">
            Chaque commande passe par différents états. Voici ce qu'ils signifient et ce que vous pouvez faire.
          </p>
          <div className="status-grid">
            {statusData.map((item) => (
              <div key={item.status} className="status-card">
                <div className="status-card-icon">{item.icon}</div>
                <div className="status-card-content">
                  <h3 className="status-label">{item.label}</h3>
                  <p className="status-description">{item.description}</p>
                  <p className="status-action"><strong>Action :</strong> {item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======== SECTION ACTIONS ======== */}
        <div className="help-section">
          <h2>🛠️ Actions sur vos commandes</h2>
          <div className="action-grid">
            <div className="action-card">
              <div className="action-icon"><FaEye /></div>
              <div className="action-info">
                <h4>Voir les détails</h4>
                <p>Consultez le récapitulatif de votre commande : œuvres, prix, date, statut, etc.</p>
              </div>
            </div>
            <div className="action-card">
              <div className="action-icon"><FaTrash /></div>
              <div className="action-info">
                <h4>Supprimer</h4>
                <p>⚠️ Uniquement pour les commandes <strong>en attente</strong> ou <strong>annulées</strong>. Les commandes payées ne peuvent pas être supprimées.</p>
              </div>
            </div>
            <div className="action-card">
              <div className="action-icon">🔒</div>
              <div className="action-info">
                <h4>Commandes payées</h4>
                <p>Une fois payée, la commande est définitive. Contactez le support pour toute demande de remboursement ou de modification.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ======== SECTION CONTACT ======== */}
        <div className="help-section support-section">
          <h2>💬 Besoin d'aide ?</h2>
          <p>
            Si vous avez une question sur une commande, un problème avec une œuvre ou si vous souhaitez annuler une commande payée,
            n'hésitez pas à contacter notre équipe. Nous sommes là pour vous accompagner.
          </p>
          <div className="support-buttons">
            <a href="mailto:support@artdjamel.com" className="btn btn-primary">
              📧 Nous écrire
            </a>
            <Link to="/faq" className="btn btn-outline-secondary">
              ❓ Voir la FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHelpPage;