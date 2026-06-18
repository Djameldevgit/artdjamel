import React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { useTranslation } from 'react-i18next';

const Loading = () => {
  const { t } = useTranslation("loading");

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9999 }}
    >
      <Spinner animation="border" variant="light" role="status" />
      <p className="mt-3 text-white fs-5">{t('loading')}</p>
    </div>
  );
};

export default Loading;
