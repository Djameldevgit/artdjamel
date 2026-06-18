import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaStar, FaRocket, FaCrown, FaVideo, FaHdd, FaClock, FaChartLine, FaHeadset, FaPaintBrush, FaGem, FaArrowRight, FaInfoCircle, FaQuestionCircle, FaShieldAlt, FaCreditCard, FaWhatsapp, FaViber, FaMapMarkerAlt, FaRuler, FaClock as FaClockIcon, FaEye, FaComment, FaThumbsUp, FaBookmark, FaShareAlt, FaBell, FaUserPlus, FaComments, FaPhone, FaLink, FaMusic } from 'react-icons/fa';
import './userProInfoPlans.css';

const UserProInfoPlans = () => {
  const [activePlan, setActivePlan] = useState('business');

  // Toutes les actions disponibles sur la plateforme
  const allActions = [
    { id: 'partage', name: 'Partage de vidéo', icon: <FaShareAlt />, description: 'Partagez vos vidéos sur les réseaux sociaux' },
    { id: 'sauvegarder', name: 'Sauvegarde', icon: <FaBookmark />, description: 'Sauvegardez vos vidéos favorites' },
    { id: 'aime', name: 'Likes', icon: <FaThumbsUp />, description: 'Aimez les vidéos des autres créateurs' },
    { id: 'comments', name: 'Commentaires', icon: <FaComment />, description: 'Commentez et interagissez avec votre communauté' },
    { id: 'notification', name: 'Notifications', icon: <FaBell />, description: 'Recevez des alertes en temps réel' },
    { id: 'suivre', name: 'Suivre', icon: <FaUserPlus />, description: 'Suivez vos créateurs préférés' },
    { id: 'vues', name: 'Vues', icon: <FaEye />, description: 'Visualisez vos statistiques de vues' },
    { id: 'chat_system', name: 'Chat système', icon: <FaComments />, description: 'Chat intégré pour communiquer' },
    { id: 'button_whatsapp', name: 'WhatsApp', icon: <FaWhatsapp />, description: 'Contact direct via WhatsApp' },
    { id: 'button_viber', name: 'Viber', icon: <FaViber />, description: 'Contact direct via Viber' },
    { id: 'lien_resaux_sociaux', name: 'Réseaux sociaux', icon: <FaLink />, description: 'Affichez vos liens sociaux' },
    { id: 'telephone', name: 'Téléphone', icon: <FaPhone />, description: 'Affichez votre numéro de téléphone' },
    { id: 'map_system', name: 'Carte système', icon: <FaMapMarkerAlt />, description: 'Géolocalisation de votre boutique' },
    { id: 'distance', name: 'Distance', icon: <FaRuler />, description: 'Calcul de distance client-boutique' },
    { id: 'temps_arrivee', name: 'Temps d\'arrivée', icon: <FaClockIcon />, description: 'Estimation du temps de trajet' },
    { id: 'visualisation_info_channel', name: 'Info canal', icon: <FaInfoCircle />, description: 'Visualisation complète du canal' },
    { id: 'music', name: 'Musique', icon: <FaMusic />, description: 'Ajoutez de la musique à vos vidéos' }
  ];

  // 4 plans pour le canal Video Commerce (prix en DA)
  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      subtitle: 'Pour commencer',
      icon: <FaStar size={32} />,
      color: '#6c757d',
      bgGradient: 'linear-gradient(135deg, #6c757d, #495057)',
      price: 0,
      priceDisplay: 'Gratuit',
      period: 'à vie',
      badge: 'Débutant',
      actions: [
        'partage', 'vues', 'aime', 'comments', 'suivre'
      ],
      features: [
        { name: 'Vidéos max', value: '5 vidéos', included: true },
        { name: 'Durée max par vidéo', value: '20 secondes', included: true },
        { name: 'Stockage total', value: '10 MB', included: true },
        { name: 'Qualité HD', value: 'Non disponible', included: false },
        { name: 'Analytiques', value: 'Non disponible', included: false },
        { name: 'Support prioritaire', value: 'Non disponible', included: false },
        { name: 'Marque personnalisée', value: 'Non disponible', included: false },
        { name: 'Promotion de vidéos', value: 'Non disponible', included: false },
        { name: 'API Access', value: 'Non disponible', included: false },
        { name: 'Musique', value: 'Non disponible', included: false },
        { name: 'Chat système', value: 'Non disponible', included: false },
        { name: 'WhatsApp/Viber', value: 'Non disponible', included: false },
        { name: 'Carte/Distance', value: 'Non disponible', included: false }
      ],
      limit: '5 vidéos',
      recommended: false
    },
    {
      id: 'basic',
      name: 'Basic',
      subtitle: 'Pour les créateurs',
      icon: <FaStar size={36} />,
      color: '#667eea',
      bgGradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      price: 400,
      priceDisplay: '400 DA',
      period: '/mois',
      badge: 'Populaire',
      actions: [
        'partage', 'sauvegarder', 'aime', 'comments', 'notification', 
        'suivre', 'vues', 'chat_system', 'lien_resaux_sociaux', 'telephone'
      ],
      features: [
        { name: 'Vidéos max', value: '50 vidéos', included: true },
        { name: 'Durée max par vidéo', value: '40 secondes', included: true },
        { name: 'Stockage total', value: '50 MB', included: true },
        { name: 'Qualité HD', value: 'HD 1080p', included: true },
        { name: 'Analytiques', value: 'Basiques', included: true },
        { name: 'Support prioritaire', value: 'Standard', included: true },
        { name: 'Marque personnalisée', value: 'Non disponible', included: false },
        { name: 'Promotion de vidéos', value: 'Payant (100 DA/vidéo)', included: false },
        { name: 'API Access', value: 'Non disponible', included: false },
        { name: 'Musique', value: 'Non disponible', included: false },
        { name: 'Chat système', value: 'Oui', included: true },
        { name: 'WhatsApp/Viber', value: 'Non disponible', included: false },
        { name: 'Carte/Distance', value: 'Non disponible', included: false }
      ],
      limit: '50 vidéos',
      recommended: true
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'Pour les professionnels',
      icon: <FaRocket size={36} />,
      color: '#f093fb',
      bgGradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
      price: 700,
      priceDisplay: '700 DA',
      period: '/mois',
      badge: 'Recommandé',
      actions: [
        'partage', 'sauvegarder', 'aime', 'comments', 'notification', 
        'suivre', 'vues', 'chat_system', 'button_whatsapp', 'button_viber',
        'lien_resaux_sociaux', 'telephone', 'map_system', 'distance', 'music'
      ],
      features: [
        { name: 'Vidéos max', value: '200 vidéos', included: true },
        { name: 'Durée max par vidéo', value: '60 secondes', included: true },
        { name: 'Stockage total', value: '500 MB', included: true },
        { name: 'Qualité HD', value: 'HD+ 2K', included: true },
        { name: 'Analytiques', value: 'Avancées', included: true },
        { name: 'Support prioritaire', value: '24/7', included: true },
        { name: 'Marque personnalisée', value: 'Oui', included: true },
        { name: 'Promotion de vidéos', value: 'Inclus (2/mois)', included: true },
        { name: 'API Access', value: 'Limitée', included: true },
        { name: 'Musique', value: 'Oui', included: true },
        { name: 'Chat système', value: 'Oui', included: true },
        { name: 'WhatsApp/Viber', value: 'Oui', included: true },
        { name: 'Carte/Distance', value: 'Oui', included: true }
      ],
      limit: '200 vidéos',
      recommended: true
    },
    {
      id: 'business',
      name: 'Business',
      subtitle: 'Pour les entreprises',
      icon: <FaCrown size={36} />,
      color: '#f6b93b',
      bgGradient: 'linear-gradient(135deg, #f6b93b, #e58e26)',
      price: 1300,
      priceDisplay: '1300 DA',
      period: '/mois',
      badge: 'Expert',
      actions: [
        'partage', 'sauvegarder', 'aime', 'comments', 'notification', 
        'suivre', 'vues', 'chat_system', 'button_whatsapp', 'button_viber',
        'lien_resaux_sociaux', 'telephone', 'map_system', 'distance', 
        'temps_arrivee', 'visualisation_info_channel', 'music'
      ],
      features: [
        { name: 'Vidéos max', value: 'Illimité', included: true },
        { name: 'Durée max par vidéo', value: '120 secondes', included: true },
        { name: 'Stockage total', value: '2 GB', included: true },
        { name: 'Qualité HD', value: '4K Ultra HD', included: true },
        { name: 'Analytiques', value: 'Complètes + IA', included: true },
        { name: 'Support prioritaire', value: 'Dédié 24/7', included: true },
        { name: 'Marque personnalisée', value: 'Illimitée', included: true },
        { name: 'Promotion de vidéos', value: 'Illimitée', included: true },
        { name: 'API Access', value: 'Complète', included: true },
        { name: 'Musique', value: 'Illimitée', included: true },
        { name: 'Chat système', value: 'Premium', included: true },
        { name: 'WhatsApp/Viber', value: 'Illimité', included: true },
        { name: 'Carte/Distance', value: 'Avancé', included: true }
      ],
      limit: 'Vidéos illimitées',
      recommended: false
    }
  ];

  const currentPlan = plans.find(p => p.id === activePlan);

  // FAQ en français
  const faqs = [
    {
      question: 'Comment puis-je changer de plan ?',
      answer: 'Vous pouvez changer ou annuler votre abonnement à tout moment depuis votre tableau de bord "Mon Compte" > "Abonnement".'
    },
    {
      question: 'Puis-je passer d\'un plan à l\'autre ?',
      answer: 'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement est immédiat et le prix est ajusté au prorata.'
    },
    {
      question: 'Y a-t-il un engagement ?',
      answer: 'Nos plans sont sans engagement mensuel. Vous pouvez résilier à tout moment sans frais supplémentaires.'
    },
    {
      question: 'Quels moyens de paiement sont acceptés ?',
      answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), Baridimob, Mobile Money (Orange Money, MTN Mobile), CCP et virement bancaire.'
    },
    {
      question: 'Comment fonctionne la musique sur les vidéos ?',
      answer: 'Les plans Pro et Business permettent d\'ajouter de la musique de fond ou une voix off à vos vidéos pour plus d\'impact.'
    },
    {
      question: 'Comment fonctionne la carte et la distance ?',
      answer: 'Vos clients peuvent voir l\'emplacement de votre boutique sur une carte, calculer la distance et le temps d\'arrivée.'
    }
  ];

  const benefits = [
    { icon: <FaVideo />, title: 'Vidéos dynamiques', desc: 'Publiez des vidéos avec son, musique ou voix off. Fini les images statiques !' },
    { icon: <FaMapMarkerAlt />, title: 'Géolocalisation intelligente', desc: 'Vos clients vous trouvent facilement avec notre carte système et calcul de distance' },
    { icon: <FaComments />, title: 'Interaction complète', desc: 'Likes, commentaires, partages, sauvegarde, suivi de chaîne - comme sur YouTube' },
    { icon: <FaWhatsapp />, title: 'Contact direct', desc: 'Boutons WhatsApp, Viber, téléphone - vos clients vous contactent en un clic' }
  ];

  return (
    <div className="userpro-info-page">
      {/* ============ CARD DE CONVINCEMENT - PREMIÈRE LIGNE ============ */}
      <div className="conviction-card">
        <div className="conviction-content">
          <div className="conviction-icon">🎬</div>
          <div className="conviction-text">
            <h2>Une révolution pour les commerçants algériens !</h2>
            <p>
              <strong>VideoCommerce</strong> est la <strong>première plateforme en Algérie</strong> dédiée aux annonces en vidéo avec son.
              Fini les photos statiques et les images trompeuses ! Ici, chaque commerçant a son <strong>canal personnel</strong> 
              comme sur YouTube pour présenter ses produits et sa boutique en vidéo, avec de la <strong>musique de fond ou une voix off</strong>.
            </p>
            <div className="conviction-features">
              <span>✅ Canal personnalisé</span>
              <span>✅ Vidéos avec son</span>
              <span>✅ Carte de géolocalisation</span>
              <span>✅ Calcul distance client-boutique</span>
              <span>✅ Chat intégré</span>
              <span>✅ Boutons WhatsApp/Viber</span>
            </div>
            <p className="conviction-note">
              💡 <strong>Pourquoi VideoCommerce est unique ?</strong> Vos clients voient votre produit en action, 
              entendent votre présentation, calculent la distance jusqu'à votre boutique, et peuvent vous contacter 
              directement. Une expérience complète que ne propose aucun autre site d'annonces en Algérie !
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="info-hero">
        <div className="info-hero-content">
          <h1 className="info-hero-title">
            📹 Devenez Utilisateur Pro
          </h1>
          <p className="info-hero-subtitle">
            Débloquez toutes les fonctionnalités premium pour développer votre chaîne de vidéos commerciales
          </p>
          <p className="info-hero-description">
            Choisissez le plan adapté à vos besoins et boostez votre activité sur VideoCommerce
          </p>
          <Link to="/become-pro" className="hero-cta-btn">
            Commencer maintenant <FaArrowRight />
          </Link>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <h2 className="section-title">✨ Pourquoi devenir Utilisateur Pro ?</h2>
        <div className="benefits-grid">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-desc">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans Tabs */}
      <div className="plans-tabs-section">
        <h2 className="section-title">💎 Choisissez votre formule</h2>
        <div className="plans-tabs">
          {plans.map(plan => (
            <button
              key={plan.id}
              className={`plan-tab ${activePlan === plan.id ? 'active' : ''}`}
              onClick={() => setActivePlan(plan.id)}
              style={{
                borderBottomColor: activePlan === plan.id ? plan.color : 'transparent',
                color: activePlan === plan.id ? plan.color : '#666'
              }}
            >
              <span className="plan-tab-icon" style={{ color: plan.color }}>{plan.icon}</span>
              <span className="plan-tab-name">{plan.name}</span>
              {plan.badge && <span className="plan-tab-badge" style={{ background: plan.color }}>{plan.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Detail Card */}
      <div className="plan-detail-section">
        <div className="plan-detail-card" style={{ borderTop: `4px solid ${currentPlan.color}` }}>
          <div className="plan-detail-header">
            <div className="plan-detail-icon" style={{ background: currentPlan.bgGradient }}>
              {currentPlan.icon}
            </div>
            <div className="plan-detail-info">
              <h2 className="plan-detail-name">{currentPlan.name}</h2>
              <p className="plan-detail-subtitle">{currentPlan.subtitle}</p>
            </div>
            <div className="plan-detail-price">
              <span className="plan-price-amount">{currentPlan.priceDisplay}</span>
              <span className="plan-price-period">{currentPlan.period}</span>
            </div>
          </div>

          {/* Actions disponibles pour ce plan */}
          <div className="plan-actions-section">
            <h3>🎯 Actions disponibles</h3>
            <div className="actions-grid">
              {allActions.map(action => {
                const isIncluded = currentPlan.actions.includes(action.id);
                return (
                  <div key={action.id} className={`action-badge ${isIncluded ? 'included' : 'excluded'}`}>
                    <span className="action-icon">{action.icon}</span>
                    <span className="action-name">{action.name}</span>
                    {isIncluded ? <FaCheck className="action-check" /> : <FaTimes className="action-times" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="plan-features-grid">
            {currentPlan.features.map((feature, idx) => (
              <div key={idx} className={`plan-feature-item ${feature.included ? 'included' : 'excluded'}`}>
                <div className="plan-feature-icon">
                  {feature.included ? <FaCheck className="check-icon" /> : <FaTimes className="times-icon" />}
                </div>
                <div className="plan-feature-info">
                  <span className="plan-feature-name">{feature.name}</span>
                  <span className="plan-feature-value">{feature.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="plan-detail-footer">
            <div className="plan-limit-badge">
              <span>📊 Limite : {currentPlan.limit}</span>
            </div>
            <Link to="/become-pro" className="plan-subscribe-btn" style={{ background: currentPlan.bgGradient }}>
              S'abonner maintenant
            </Link>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="comparison-section">
        <h2 className="section-title">📊 Comparaison complète des plans</h2>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Fonctionnalités</th>
                {plans.map(plan => (
                  <th key={plan.id} style={{ color: plan.color }}>
                    {plan.name}
                    <span className="plan-price-small">{plan.priceDisplay}{plan.period !== 'à vie' && plan.period}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>📹 Vidéos max</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Vidéos max')?.value}</td>)}
              </tr>
              <tr>
                <td>⏱️ Durée max par vidéo</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Durée max par vidéo')?.value}</td>)}
              </tr>
              <tr>
                <td>💾 Stockage total</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Stockage total')?.value}</td>)}
              </tr>
              <tr>
                <td>🎬 Qualité HD</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Qualité HD')?.value}</td>)}
              </tr>
              <tr>
                <td>📊 Analytiques</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Analytiques')?.value}</td>)}
              </tr>
              <tr>
                <td>🎧 Support prioritaire</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Support prioritaire')?.value}</td>)}
              </tr>
              <tr>
                <td>🎨 Marque personnalisée</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Marque personnalisée')?.value}</td>)}
              </tr>
              <tr>
                <td>🚀 Promotion de vidéos</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Promotion de vidéos')?.value}</td>)}
              </tr>
              <tr>
                <td>🎵 Musique</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Musique')?.value}</td>)}
              </tr>
              <tr>
                <td>💬 Chat système</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Chat système')?.value}</td>)}
              </tr>
              <tr>
                <td>📱 WhatsApp/Viber</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'WhatsApp/Viber')?.value}</td>)}
              </tr>
              <tr>
                <td>🗺️ Carte/Distance</td>
                {plans.map(plan => <td key={plan.id}>{plan.features.find(f => f.name === 'Carte/Distance')?.value}</td>)}
              </tr>
              <tr className="price-row">
                <td><strong>💰 Prix</strong></td>
                {plans.map(plan => (
                  <td key={plan.id}>
                    <strong>{plan.priceDisplay}</strong>
                    {plan.period !== 'à vie' && <small>{plan.period}</small>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2 className="section-title">❓ Questions fréquentes</h2>
        <div className="faq-grid">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-card">
              <div className="faq-question">
                <FaQuestionCircle className="faq-icon" />
                <h3>{faq.question}</h3>
              </div>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Footer */}
      <div className="cta-footer">
        <div className="cta-content">
          <h2 className="cta-title">Prêt à passer au niveau supérieur ?</h2>
          <p className="cta-text">Rejoignez les créateurs qui réussissent sur VideoCommerce</p>
          <Link to="/become-pro" className="cta-button">
            Devenir Utilisateur Pro <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProInfoPlans;