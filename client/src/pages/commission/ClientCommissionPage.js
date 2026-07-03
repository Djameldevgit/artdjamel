import React from 'react';
import CommissionForm from '../../components/commissions/CommissionForm';
import ClientCommissionList from '../../components/commissions/ClientCommissionList';

const ClientCommissionPage = () => {
  return (
    <div className="container">
      <CommissionForm />
      <hr />
      <ClientCommissionList />
    </div>
  );
};

export default ClientCommissionPage;