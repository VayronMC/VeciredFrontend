import { useState } from 'react';
import Login from './components/Login';
import Registro from './components/Registro';
import Home from './components/Home';

function App() {
  const userToken = localStorage.getItem('access_token');
  const userInfo = localStorage.getItem('user_data');
  
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

  const handleSwitchToContact = (publicationId) => {
    setCurrentView('contact');
    // Guardar el ID de la publicación para la vista de contacto
    if (publicationId) {
      localStorage.setItem('selectedPublicationId', publicationId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
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
    </div>
  );
}

export default App;
