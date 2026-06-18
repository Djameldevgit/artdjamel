
import React from 'react';

const Modalsearchhome = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}   >
            <div style={styles.modal}>
                <button style={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>




        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    modal: {
        backgroundColor: '#fff',
       
        padding: '10px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        position: 'relative',
        
    },
    closeButton: {
        position: 'absolute',
        top: '10',
        right: '10px',
        background: 'none',
        color: 'red',
        border: 'none',
        fontSize: '1.7rem',
        cursor: 'pointer',
    },
};

export default Modalsearchhome;