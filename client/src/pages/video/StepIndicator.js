// components/Video/StepIndicator.jsx
import React from 'react';

const StepIndicator = ({ currentStep, totalSteps, labels }) => {
  return (
    <div className="step-indicator">
      <div className="steps-container">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="step-wrapper">
            <div className={`step-circle ${currentStep >= step ? 'active' : ''}`}>
              {step}
            </div>
            {labels && labels[step - 1] && (
              <div className="step-label">{labels[step - 1]}</div>
            )}
            {step < totalSteps && (
              <div className={`step-line ${currentStep > step ? 'active' : ''}`} />
            )}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .step-indicator {
          width: 100%;
          padding: 16px 0;
        }
        
        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .step-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
        }
        
        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: rgba(255,255,255,0.5);
          transition: all 0.3s ease;
          z-index: 2;
          background: #1a1a2e;
        }
        
        .step-circle.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: transparent;
          color: white;
          transform: scale(1.1);
        }
        
        .step-label {
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.6);
        }
        
        .step-line {
          position: absolute;
          top: 20px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,0.2);
          z-index: 1;
        }
        
        .step-line.active {
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .step-wrapper:last-child .step-line {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default StepIndicator;