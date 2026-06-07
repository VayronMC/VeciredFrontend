import { useState, useEffect } from 'react';
import Login from './components/Login';
import Registro from './components/Registro';
import Home from './components/Home';
import NuevaPublicacion from './components/NuevaPublicacion';
import Perfil from './components/Perfil';

function App() {
  const userToken = sessionStorage.getItem('access_token');
  const userInfo = sessionStorage.getItem('user_data');
  
  const [currentView, setCurrentView] = useState(() => {
    const savedView = sessionStorage.getItem('current_view');
    if (savedView) {
      return savedView;
    }
    return (userToken && userInfo) ? 'home' : 'login';
  });
  const [profileUserId, setProfileUserId] = useState(() => {
    const savedProfileUserId = sessionStorage.getItem('profile_user_id');
    return savedProfileUserId ? JSON.parse(savedProfileUserId) : null;
  });

  useEffect(() => {
    sessionStorage.setItem('current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    if (profileUserId !== null) {
      sessionStorage.setItem('profile_user_id', JSON.stringify(profileUserId));
    } else {
      sessionStorage.removeItem('profile_user_id');
    }
  }, [profileUserId]);

  const handleLoginSuccess = () => {
    setCurrentView('home');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToProfile = (userId = null) => {
    setProfileUserId(userId);
    setCurrentView('profile');
  };

  const handleSwitchToNewPublication = () => {
    setCurrentView('new-publication');
  };

  const handleSwitchToHome = () => {
    setCurrentView('home');
  };

  const handlePublishSuccess = () => {
    setCurrentView('home');
  };

  const handleLogout = () => {
    const userInfo = sessionStorage.getItem('user_data');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      localStorage.removeItem(`readNotificationIds_${user.id}`);
    }
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('current_view');
    sessionStorage.removeItem('profile_user_id');
    setCurrentView('login');
    setProfileUserId(null);
  };

  return (
    <div className="App">
      {currentView === 'login' && (
        <Login 
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentView === 'register' && (
        <Registro 
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
      {currentView === 'home' && (
        <Home 
          onSwitchToProfile={handleSwitchToProfile}
          onSwitchToNewPublication={handleSwitchToNewPublication}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'new-publication' && (
        <NuevaPublicacion 
          onBack={handleSwitchToHome}
          onPublishSuccess={handlePublishSuccess}
        />
      )}
      {currentView === 'profile' && (
        <Perfil 
          userId={profileUserId || JSON.parse(userInfo || '{}').id}
          onBack={handleSwitchToHome}
          onLogout={handleLogout}
          isOwnProfile={!profileUserId || profileUserId === JSON.parse(userInfo || '{}').id}
        />
      )}
    </div>
  );
}

export default App;
