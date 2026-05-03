import { useState } from 'react';
import Login from './components/Login';
import Registro from './components/Registro';

function App() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="App">
      {showLogin ? (
        <Login onSwitchToRegister={() => setShowLogin(false)} />
      ) : (
        <Registro onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </div>
  );
}

export default App;
