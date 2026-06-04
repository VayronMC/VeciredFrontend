import { useState } from 'react';
import Login from './components/Login';
import Registro from './components/Registro';
import Home from './components/Home';
import NuevaPublicacion from './components/NuevaPublicacion';

function App() {
  const userToken = sessionStorage.getItem('access_token');
  const userInfo = sessionStorage.getItem('user_data');
  
  const [currentView, setCurrentView] = useState(() => {
    return (userToken && userInfo) ? 'home' : 'login';
  });

  const handleLoginSuccess = () => {
    setCurrentView('home');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToProfile = () => {
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

  const handleSwitchToContact = (publicationId) => {
    setCurrentView('contact');
    // Guardar el ID de la publicación para la vista de contacto
    if (publicationId) {
      sessionStorage.setItem('selectedPublicationId', publicationId);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
    setCurrentView('login');
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
          onSwitchToContact={handleSwitchToContact}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'new-publication' && (
        <NuevaPublicacion 
          onBack={handleSwitchToHome}
          onPublishSuccess={handlePublishSuccess}
        />
      )}
    </div>
  );
}

export default App;
