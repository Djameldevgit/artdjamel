// components/ShareAppModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaLinkedin,
  FaLink,
  FaShareAlt,
  FaTelegram,
  FaTiktok
} from 'react-icons/fa';

const ShareAppModal = ({ show, onClose }) => {
  const { t } = useTranslation('shareappmodal');
  const { languageReducer } = useSelector(state => state);
  const lang = languageReducer.language || 'es';
  
  const appUrl = window.location.origin;
  const appName = t('appName', { lng: lang });

  const shareOnSocialMedia = (platform) => {
    let shareUrl = '';
    const shareText = t('shareText', { appName, appUrl, lng: lang });

    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'tiktok':
        shareUrl = `https://www.tiktok.com/share?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const shareOnTikTok = () => {
    const shareText = t('shareText', { appName, appUrl, lng: lang });
    
    const tiktokAppUrl = `tiktok://share?text=${encodeURIComponent(shareText)}`;
    
    window.location.href = tiktokAppUrl;
    
    setTimeout(() => {
      window.open(`https://www.tiktok.com/upload?lang=${lang}&referer=share`, '_blank');
    }, 500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appUrl)
      .then(() => {
        alert(t('copySuccess', { lng: lang }));
      })
      .catch(err => {
        console.error(t('copyError', { lng: lang }), err);
      });
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appName,
          text: t('shareText', { appName, appUrl, lng: lang }),
          url: appUrl,
        });
      } catch (error) {
        console.log(t('shareError', { lng: lang }), error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Modal show={show} onHide={onClose}  >
      <div closeButton>
        <Modal.Title>
          <FaShareAlt className="me-2" />
          {t('title', { lng: lang })}
        </Modal.Title>
      </div>
      <Modal.Body className="text-center">
        <p>{t('description', { lng: lang })}</p>
        
        <div className="row g-3 mb-4">
          <div className="col-4">
            <Button 
              variant="outline-primary" 
              className="w-100"
              onClick={() => shareOnSocialMedia('facebook')}
            >
              <FaFacebook size={24} />
              <div className="small mt-1">{t('facebook', { lng: lang })}</div>
            </Button>
          </div>
          <div className="col-4">
            <Button 
              variant="outline-success" 
              className="w-100"
              onClick={() => shareOnSocialMedia('whatsapp')}
            >
              <FaWhatsapp size={24} />
              <div className="small mt-1">{t('whatsapp', { lng: lang })}</div>
            </Button>
          </div>
          <div className="col-4">
            <Button 
              variant="outline-info" 
              className="w-100"
              onClick={() => shareOnSocialMedia('twitter')}
            >
              <FaTwitter size={24} />
              <div className="small mt-1">{t('twitter', { lng: lang })}</div>
            </Button>
          </div>

          <div className="col-4">
            <Button 
              variant="outline-dark" 
              className="w-100"
              onClick={shareOnTikTok}
              style={{ 
                backgroundColor: '#000', 
                borderColor: '#000',
                color: '#fff'
              }}
            >
              <FaTiktok size={24} />
              <div className="small mt-1">{t('tiktok', { lng: lang })}</div>
            </Button>
          </div>

          <div className="col-4">
            <Button 
              variant="outline-primary" 
              className="w-100"
              onClick={() => shareOnSocialMedia('linkedin')}
            >
              <FaLinkedin size={24} />
              <div className="small mt-1">{t('linkedin', { lng: lang })}</div>
            </Button>
          </div>
          <div className="col-4">
            <Button 
              variant="outline-info" 
              className="w-100"
              onClick={() => shareOnSocialMedia('telegram')}
            >
              <FaTelegram size={24} />
              <div className="small mt-1">{t('telegram', { lng: lang })}</div>
            </Button>
          </div>
          <div className="col-4">
            <Button 
              variant="outline-secondary" 
              className="w-100"
              onClick={copyToClipboard}
            >
              <FaLink size={24} />
              <div className="small mt-1">{t('copyLink', { lng: lang })}</div>
            </Button>
          </div>
        </div>

        <Button 
          variant="primary" 
          onClick={shareNative}
          className="w-100"
        >
          <FaShareAlt className="me-2" />
          {t('shareNative', { lng: lang })}
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default ShareAppModal;