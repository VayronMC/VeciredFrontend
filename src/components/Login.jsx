import { useState } from 'react';

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    correo_electronico: '',
    contraseña: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
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
      setError('Correo o contraseña incorrectos. Crea una cuenta si no la tienes aún.');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Logo y título */}
          <div className="text-center mb-6">
            <img 
              src="/src/assets/logo.png" 
              alt="VeciRed Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-emerald-500 mb-2">VeciRed</h1>
            <p className="text-gray-600 text-sm">Tu comunidad de confianza</p>
          </div>

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
                className="w-full px-3 py-2 border border-emerald-200 rounded-md bg-emerald-50 placeholder-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-emerald-200 rounded-md bg-emerald-50 placeholder-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white py-3 px-4 rounded-md font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </form>

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
