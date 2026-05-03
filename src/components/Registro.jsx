import { useState } from 'react';

const Registro = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo_electronico: '',
    direccion: '',
    contraseña: '',
    foto_perfil: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        foto_perfil: file
      }));
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      // Mostrar alerta de éxito
      setSuccess('¡Usuario registrado exitosamente! Redirigiendo al login...');
      
      // Redirigir automáticamente después de 2 segundos
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);

    } catch (error) {
      setError(error.message || 'Error al registrar usuario');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-8">
      {/* Alerta de éxito */}
      {showSuccessAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p className="font-medium">¡Usuario registrado exitosamente!</p>
              <p className="text-sm text-green-600">Redirigiendo al inicio de sesión...</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-md">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <img 
              src="/src/assets/logo.png" 
              alt="VeciRed Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-emerald-500">Crear cuenta</h1>
          </div>
          {/* Sección de foto de perfil */}
          <div className="mb-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Foto de perfil" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
                <label 
                  htmlFor="foto_perfil" 
                  className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1 cursor-pointer hover:bg-emerald-600 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </label>
              </div>
              <label 
                htmlFor="foto_perfil" 
                className="mt-2 text-sm text-slate-500 cursor-pointer hover:text-slate-600"
              >
                Agregar foto
              </label>
              <input
                type="file"
                id="foto_perfil"
                name="foto_perfil"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre_completo" className="block text-sm font-medium text-black mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                id="nombre_completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-emerald-200 rounded-md bg-emerald-50 placeholder-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Tu nombre completo"
              />
            </div>

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
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-black mb-1">
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-emerald-200 rounded-md bg-emerald-50 placeholder-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Calle, número, ciudad"
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
                minLength="6"
                className="w-full px-3 py-2 border border-emerald-200 rounded-md bg-emerald-50 placeholder-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white py-3 px-4 rounded-md font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          {/* Enlace a login */}
          <div className="mt-6 text-center">
            <span className="text-gray-300">¿Ya tienes cuenta? </span>
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:underline font-medium"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;
