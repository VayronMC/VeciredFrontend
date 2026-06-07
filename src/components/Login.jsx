import { useState, useEffect } from 'react';

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  const LOCK_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos
  const MAX_ATTEMPTS = 3;

  const [formData, setFormData] = useState({
    correo_electronico: '',
    contraseña: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const lockData = sessionStorage.getItem('loginLock');
    if (lockData) {
      const { timestamp, attempts } = JSON.parse(lockData);
      const now = Date.now();
      const timeElapsed = now - timestamp;

      if (timeElapsed < LOCK_DURATION) {
        return attempts;
      } else {
        sessionStorage.removeItem('loginLock');
        return 0;
      }
    }
    return 0;
  });

  const [isLocked, setIsLocked] = useState(() => {
    const lockData = sessionStorage.getItem('loginLock');
    if (lockData) {
      const { timestamp } = JSON.parse(lockData);
      const now = Date.now();
      const timeElapsed = now - timestamp;
      return timeElapsed < LOCK_DURATION;
    }
    return false;
  });

  const [lockTimeRemaining, setLockTimeRemaining] = useState(() => {
    const lockData = sessionStorage.getItem('loginLock');
    if (lockData) {
      const { timestamp } = JSON.parse(lockData);
      const now = Date.now();
      const timeElapsed = now - timestamp;

      if (timeElapsed < LOCK_DURATION) {
        return Math.ceil((LOCK_DURATION - timeElapsed) / 1000);
      }
    }
    return 0;
  });

  useEffect(() => {
    let interval;
    if (isLocked && lockTimeRemaining > 0) {
      interval = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            sessionStorage.removeItem('loginLock');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimeRemaining]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      sessionStorage.setItem('access_token', data.session.access_token);
      sessionStorage.setItem('refresh_token', data.session.refresh_token);
      sessionStorage.setItem('user_data', JSON.stringify(data.user));
      
      // Resetear contador de intentos al login exitoso
      setFailedAttempts(0);
      sessionStorage.removeItem('loginLock');
      
      // Mostrar mensaje de éxito
      setSuccess('¡Sesión iniciada exitosamente!');
      setError('');
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      setFormData({
        correo_electronico: '',
        contraseña: ''
      });

    } catch {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        // Bloquear por 15 minutos
        const lockData = {
          timestamp: Date.now(),
          attempts: newAttempts
        };
        sessionStorage.setItem('loginLock', JSON.stringify(lockData));
        setIsLocked(true);
        setLockTimeRemaining(LOCK_DURATION / 1000);
        setError('Has excedido el número máximo de intentos. Tu cuenta está bloqueada por 15 minutos.');
      } else {
        setError(`Correo o contraseña incorrectos. Intentos restantes: ${MAX_ATTEMPTS - newAttempts}`);
      }
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Logo y título */}
          <div className="text-center mb-6">
            <img 
              src="/logo.png" 
              alt="VeciRed Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-emerald-500 mb-2">VeciRed</h1>
            <p className="text-gray-600 text-sm">Tu comunidad de confianza</p>
          </div>

          {/* Mensaje de bloqueo */}
          {isLocked && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
              <p className="font-medium mb-2">⚠️ Cuenta bloqueada temporalmente</p>
              <p className="text-sm mb-2">Has excedido el número máximo de intentos. Tu cuenta está bloqueada.</p>
              <p className="text-sm font-medium">Tiempo restante: {formatTime(lockTimeRemaining)}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="correo_electronico" className="block text-sm font-medium text-black mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                id="correo_electronico"
                name="correo_electronico"
                value={formData.correo_electronico}
                onChange={handleChange}
                required
                disabled={isLocked}
                className="w-full px-3 py-2 border border-emerald-200 rounded-md bg-emerald-50 placeholder-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <div>
              <label htmlFor="contraseña" className="block text-sm font-medium text-black mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="contraseña"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                required
                disabled={isLocked}
                className="w-full px-3 py-2 border border-emerald-200 rounded-md bg-emerald-50 placeholder-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Tu contraseña"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-md text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full bg-emerald-500 text-white py-3 px-4 rounded-md font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </form>

          {/* Opciones adicionales */}
          <div className="mt-4 text-center space-y-2">
            {/* Opción de cambiar contraseña puede implementarse en el futuro */}
          </div>

          {/* Enlace a registro */}
          <div className="mt-6 text-center">
            <span className="text-gray-300">¿No tienes cuenta? </span>
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:underline font-medium"
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
