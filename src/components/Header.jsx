import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, ArrowLeft, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { soundEnabled, toggleSound } = useAppContext();
  
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const isHome = location.pathname === '/';

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {!isHome && (
          <button style={styles.iconBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={24} color="var(--color-primary-dark)" />
          </button>
        )}
      </div>
      
      <div style={styles.center}>
        <h1 style={styles.title} className="title-gradient">FunFlex</h1>
      </div>
      
      <div style={styles.right}>
        {deferredPrompt && !isStandalone && (
          <button style={{...styles.iconBtn, ...styles.installBtn}} onClick={handleInstallClick} title="Install App">
            <Download size={20} color="#fff" />
            <span style={styles.installText}>Install</span>
          </button>
        )}
        <button style={styles.iconBtn} onClick={toggleSound} title={soundEnabled ? 'Mute' : 'Unmute'}>
          {soundEnabled ? (
            <Volume2 size={24} color="var(--color-primary-dark)" />
          ) : (
            <VolumeX size={24} color="var(--color-text-muted)" />
          )}
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: 'var(--color-surface)',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  center: {
    flex: 2,
    display: 'flex',
    justifyContent: 'center',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    margin: 0,
  },
  iconBtn: {
    padding: '8px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-fast)',
  },
  installBtn: {
    backgroundColor: 'var(--color-primary-dark)',
    padding: '6px 12px',
    gap: '6px',
    marginRight: '8px',
    boxShadow: 'var(--shadow-sm)',
  },
  installText: {
    color: '#fff',
    fontWeight: 600,
    fontSize: '14px',
  }
};
