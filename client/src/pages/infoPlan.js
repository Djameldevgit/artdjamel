import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaStar, FaRocket, FaCrown, FaArrowRight, FaInfoCircle, FaVideo, FaHdd, FaClock, FaChartLine, FaHeadset, FaPaintBrush } from 'react-icons/fa';
import './InfoPlans.css';

const InfoPlans = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { auth } = useSelector(state => state);
  const [activeTab, setActiveTab] = useState('free');

  // 4 Planes para CANAL de Video Commerce
  const plans = [
    {
      id: 'free',
      name: 'Plan Gratuit',
      nameFr: 'Gratuit',
      icon: <FaStar size={28} />,
      color: '#6c757d',
      bgGradient: 'linear-gradient(135deg, #6c757d, #495057)',
      price: 0,
      priceDisplay: 'Gratuit',
      period: 'à vie',
      badge: 'Démarrage',
      features: [
        { icon: <FaVideo />, name: 'Vidéos max', value: '5 vidéos', included: true },
        { icon: <FaClock />, name: 'Durée max', value: '60 secondes', included: true },
        { icon: <FaHdd />, name: 'Stockage', value: '100 MB', included: true },
        { icon: <FaChartLine />, name: 'Qualité HD', value: 'Non', included: false },
        { icon: <FaChartLine />, name: 'Analytiques', value: 'Non', included: false },
        { icon: <FaHeadset />, name: 'Support', value: 'Standard', included: false },
        { icon: <FaPaintBrush />, name: 'Marque perso', value: 'Non', included: false }
      ],
      description: 'Idéal pour commencer et tester la plateforme',
      buttonText: 'Plan actuel',
      buttonAction: null
    },
    {
      id: 'basic',
      name: 'Plan Basic',
      nameFr: 'Basique',
      icon: <FaStar size={32} />,
      color: '#667eea',
      bgGradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      price: 9.99,
      priceDisplay: '9.99 €',
      period: '/mois',
      badge: 'Populaire',
      features: [
        { icon: <FaVideo />, name: 'Vidéos max', value: '50 vidéos', included: true },
        { icon: <FaClock />, name: 'Durée max', value: '180 secondes', included: true },
        { icon: <FaHdd />, name: 'Stockage', value: '500 MB', included: true },
        { icon: <FaChartLine />, name: 'Qualité HD', value: 'Oui', included: true },
        { icon: <FaChartLine />, name: 'Analytiques', value: 'Basiques', included: true },
        { icon: <FaHeadset />, name: 'Support', value: 'Standard', included: true },
        { icon: <FaPaintBrush />, name: 'Marque perso', value: 'Non', included: false }
      ],
      description: 'Parfait pour les créateurs qui débutent',
      buttonText: 'Choisir ce plan',
      buttonAction: () => history.push('/become-pro-checkout', { plan: 'basic' })
    },
    {
      id: 'pro',
      name: 'Plan Pro',
      nameFr: 'Professionnel',
      icon: <FaRocket size={32} />,
      color: '#f093fb',
      bgGradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
      price: 29.99,
      priceDisplay: '29.99 €',
      period: '/mois',
      badge: 'Recommandé',
      features: [
        { icon: <FaVideo />, name: 'Vidéos max', value: '200 vidéos', included: true },
        { icon: <FaClock />, name: 'Durée max', value: '300 secondes', included: true },
        { icon: <FaHdd />, name: 'Stockage', value: '2 GB', included: true },
        { icon: <FaChartLine />, name: 'Qualité HD', value: 'HD+', included: true },
        { icon: <FaChartLine />, name: 'Analytiques', value: 'Avancées', included: true },
        { icon: <FaHeadset />, name: 'Support', value: 'Prioritaire', included: true },
        { icon: <FaPaintBrush />, name: 'Marque perso', value: 'Oui', included: true }
      ],
      description: 'Pour les créateurs qui veulent se démarquer',
      buttonText: 'Choisir ce plan',
      buttonAction: () => history.push('/become-pro-checkout', { plan: 'pro' })
    },
    {
      id: 'business',
      name: 'Plan Business',
      nameFr: 'Entreprise',
      icon: <FaCrown size={32} />,
      color: '#f6b93b',
      bgGradient: 'linear-gradient(135deg, #f6b93b, #e58e26)',
      price: 99.99,
      priceDisplay: '99.99 €',
      period: '/mois',
      badge: 'Expert',
      features: [
        { icon: <FaVideo />, name: 'Vidéos max', value: 'Illimité', included: true },
        { icon: <FaClock />, name: 'Durée max', value: '600 secondes', included: true },
        { icon: <FaHdd />, name: 'Stockage', value: '10 GB', included: true },
        { icon: <FaChartLine />, name: 'Qualité HD', value: '4K', included: true },
        { icon: <FaChartLine />, name: 'Analytiques', value: 'Complètes', included: true },
        { icon: <FaHeadset />, name: 'Support', value: '24/7', included: true },
        { icon: <FaPaintBrush />, name: 'Marque perso', value: 'Illimitée', included: true }
      ],
      description: 'La solution complète pour les professionnels',
      buttonText: 'Choisir ce plan',
      buttonAction: () => history.push('/become-pro-checkout', { plan: 'business' })
    }
  ];

  const currentPlan = plans.find(p => p.id === activeTab);
  const isAlreadyPro = auth.user?.role === 'userPro';

  return (
    <div className="info-plans-page">
      {/* Header */}
      <div className="plans-header">
        <h1 className="plans-title">📹 Devenir Utilisateur Pro</h1>
        <p className="plans-subtitle">
          Débloquez toutes les fonctionnalités premium pour votre chaîne de vidéos commerciales
        </p>
        <p className="plans-subtitle-small">
          Choisissez l'offre qui correspond le mieux à vos besoins
        </p>
      </div>

      {/* Tabs de navigation */}
      <div className="plans-tabs">
        {plans.map(plan => (
          <button
            key={plan.id}
            className={`tab-btn ${activeTab === plan.id ? 'active' : ''}`}
            onClick={() => setActiveTab(plan.id)}
            style={{
              borderBottomColor: activeTab === plan.id ? plan.color : 'transparent',
              color: activeTab === plan.id ? plan.color : '#666'
            }}
          >
            <span className="tab-icon" style={{ color: plan.color }}>{plan.icon}</span>
            <span className="tab-name">{plan.nameFr}</span>
            {plan.badge && <span className="tab-badge" style={{ background: plan.color }}>{plan.badge}</span>}
          </button>
        ))}
      </div>

      {/* Contenu du plan sélectionné */}
      <div className="plan-detail-container">
        <div className="plan-card-large" style={{ borderTop: `4px solid ${currentPlan.color}` }}>
          <div className="plan-header">
            <div className="plan-icon-large" style={{ background: currentPlan.bgGradient }}>
              {currentPlan.icon}
            </div>
            <div className="plan-info">
              <h2 className="plan-name-large">{currentPlan.name}</h2>
              <p className="plan-description">{currentPlan.description}</p>
            </div>
            <div className="plan-price-large">
              <span className="price-amount">{currentPlan.priceDisplay}</span>
              <span className="price-period">{currentPlan.period}</span>
            </div>
          </div>

          <div className="plan-features-grid">
            {currentPlan.features.map((feature, idx) => (
              <div key={idx} className={`feature-item ${feature.included ? 'included' : 'excluded'}`}>
                <span className="feature-icon" style={{ color: feature.included ? currentPlan.color : '#ccc' }}>
                  {feature.icon}
                </span>
                <div className="feature-info">
                  <span className="feature-name">{feature.name}</span>
                  <span className="feature-value">{feature.value}</span>
                </div>
                {feature.included ? (
                  <FaCheck className="check-icon" style={{ color: '#28a745' }} />
                ) : (
                  <span className="cross-icon">✕</span>
                )}
              </div>
            ))}
          </div>

          <div className="plan-footer">
            {isAlreadyPro && auth.user?.plan === currentPlan.id ? (
              <button className="btn-current-plan" disabled>
                ✓ Plan actuel
              </button>
            ) : currentPlan.id === 'free' ? (
              <button className="btn-free-plan" disabled>
                Plan gratuit actif
              </button>
            ) : (
              <button
                className="btn-choose-plan"
                style={{ background: currentPlan.bgGradient }}
                onClick={() => history.push('/become-pro-checkout', { plan: currentPlan.id })}
              >
                {currentPlan.buttonText || 'Choisir ce plan'} <FaArrowRight />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section comparaison rapide */}
      <div className="comparison-section">
        <h3 className="comparison-title">Comparez tous les plans</h3>
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Fonctionnalités</th>
                {plans.map(plan => <th key={plan.id} style={{ color: plan.color }}>{plan.nameFr}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vidéos max</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Vidéos max')?.value}</td>)}
              </tr>
              <tr>
                <td>Durée max</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Durée max')?.value}</td>)}
              </tr>
              <tr>
                <td>Stockage</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Stockage')?.value}</td>)}
              </tr>
              <tr>
                <td>Qualité HD</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Qualité HD')?.value}</td>)}
              </tr>
              <tr>
                <td>Analytiques</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Analytiques')?.value}</td>)}
              </tr>
              <tr>
                <td>Support</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Support')?.value}</td>)}
              </tr>
              <tr>
                <td>Marque personnalisée</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Marque perso')?.value}</td>)}
              </tr>
              <tr className="price-row">
                <td><strong>Prix</strong></td>
                {plans.map(plan => (
                  <td key={plan.id}>
                    <strong>{plan.priceDisplay}</strong>
                    {plan.period !== 'à vie' && <small>/{plan.period.replace('/', '')}</small>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section FAQ */}
      <div className="faq-section">
        <h3 className="faq-title">Questions fréquentes</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Comment changer de plan ?</h4>
            <p>Vous pouvez changer ou annuler votre abonnement à tout moment depuis votre tableau de bord.</p>
          </div>
          <div className="faq-item">
            <h4>Puis-je passer d'un plan à l'autre ?</h4>
            <p>Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment.</p>
          </div>
          <div className="faq-item">
            <h4>Y a-t-il un engagement ?</h4>
            <p>Nos plans sont sans engagement. Vous pouvez résilier à tout moment.</p>
          </div>
          <div className="faq-item">
            <h4>Quels moyens de paiement ?</h4>
            <p>Carte bancaire, Mobile Money (Orange Money, MTN Mobile), Virement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPlans;