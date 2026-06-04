import { useState } from 'react';
import { Camera } from 'lucide-react';

const NuevaPublicacion = ({ onBack, onPublishSuccess }) => {
  const [formData, setFormData] = useState({
    categoria: '',
    titulo: '',
    descripcion: '',
    telefono: '',
    foto: null
  });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para recargar notificaciones en Home
  const refreshNotifications = () => {
    window.dispatchEvent(new CustomEvent('refreshNotifications'));
  };

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          foto: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones
    if (!formData.categoria) {
      setError('Debe seleccionar una categoría');
      setIsLoading(false);
      return;
    }
    if (!formData.titulo) {
      setError('Debe ingresar un título');
      setIsLoading(false);
      return;
    }
    if (!formData.descripcion) {
      setError('Debe ingresar una descripción');
      setIsLoading(false);
      return;
    }
    if (!formData.telefono) {
      setError('Debe ingresar un número de contacto');
      setIsLoading(false);
      return;
    }

    try {
      const userInfo = sessionStorage.getItem('user_data');
      if (!userInfo) {
        throw new Error('No hay usuario autenticado');
      }

      const user = JSON.parse(userInfo);

      const publicationData = {
        usuario_id: user.id,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        telefono: formData.telefono,
        foto_url: formData.foto || null
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/publicaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publicationData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear publicación');
      }

      // Limpiar formulario
      setFormData({
        categoria: '',
        titulo: '',
        descripcion: '',
        telefono: '',
        foto: null
      });
      setFotoPreview(null);

      // Recargar notificaciones en Home
      refreshNotifications();

      if (onPublishSuccess) {
        onPublishSuccess();
      }

    } catch (err) {
      setError(err.message || 'Error al crear publicación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Limpiar formulario
    setFormData({
      categoria: '',
      titulo: '',
      descripcion: '',
      telefono: '',
      foto: null
    });
    setFotoPreview(null);
    setError('');

    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Publicación</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Categoría */}
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-900 mb-1">
                Categoría
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Seleccione una categoría</option>
                <option value="Servicios">Servicios</option>
                <option value="Favores">Favores</option>
                <option value="Préstamos">Préstamos</option>
              </select>
            </div>

            {/* Título */}
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-900 mb-1">
                Título
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Título de la publicación"
              />
            </div>

            {/* Foto (opcional) */}
            <div>
              <label htmlFor="foto" className="block text-sm font-medium text-gray-900 mb-1">
                Foto (Opcional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="foto"
                  name="foto"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="foto"
                  className="w-full px-3 py-8 border border-gray-300 rounded-md bg-cyan-50 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-100 transition-colors"
                >
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-md mb-2"
                    />
                  ) : (
                    <>
                      <Camera className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-gray-600 text-sm">Click para agregar foto</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-900 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Describe tu servicio, favor o préstamo"
              />
            </div>

            {/* Medio de contacto */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-900 mb-1">
                Medio de contacto
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Escribe tu número de contacto"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="space-y-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Publicando...' : 'Publicar'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-black py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salir
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevaPublicacion;
