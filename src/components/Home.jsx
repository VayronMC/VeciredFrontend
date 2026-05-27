import { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Plus, X, LogOut } from 'lucide-react';

const Home = ({ onSwitchToProfile, onSwitchToNewPublication, onSwitchToContact, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [userData] = useState(() => {
    const userInfo = localStorage.getItem('user_data');
    return userInfo ? JSON.parse(userInfo) : null;
  });

  const fetchPublications = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/publicaciones`;
      const params = new URLSearchParams();
      
      if (activeFilter) {
        params.append('categoria', activeFilter);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener publicaciones');
      }

      setPublications(data.publications || []);
    } catch (error) {
      setError(error.message || 'Error al cargar publicaciones');
      setPublications([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPublications();
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [fetchPublications]);

  const handleFilterClick = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
  };

  const handleContactClick = (publicationId) => {
    if (onSwitchToContact) {
      onSwitchToContact(publicationId);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const userInfo = localStorage.getItem('user_data');
      if (!userInfo) return;

      const user = JSON.parse(userInfo);
      const url = `${import.meta.env.VITE_API_URL}/api/publicaciones/notificaciones/list?usuario_id=${user.id}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener notificaciones');
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en tu comunidad..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={onSwitchToProfile}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 hover:border-emerald-600 transition-colors"
            >
              <img
                src={userData?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.nombre_completo || userData?.email?.split('@')[0] || 'Usuario')}&background=10b981&color=fff&size=150`}
                alt="Perfil"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.nombre_completo || userData?.email?.split('@')[0] || 'Usuario')}&background=10b981&color=fff&size=150`;
                }}
              />
            </button>
            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className="relative p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                  </div>
                  <div className="p-2">
                    {notificationsLoading ? (
                      <p className="text-gray-500 text-center py-4">Cargando notificaciones...</p>
                    ) : notifications.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay notificaciones</p>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className="p-3 hover:bg-gray-50 rounded-lg mb-2 cursor-pointer border-l-4 border-emerald-500"
                        >
                          <p className="text-sm text-gray-900 font-medium">
                            Nueva publicación: {notif.titulo_publicacion}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notif.fecha_creacion).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-6 h-6 text-red-500 hover:text-red-600" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleFilterClick('Servicios')}
              className={`px-4 py-2 rounded-full transition-all ${
                activeFilter === 'Servicios'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 hover:border-emerald-500 text-gray-700'
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => handleFilterClick('Favores')}
              className={`px-4 py-2 rounded-full transition-all ${
                activeFilter === 'Favores'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 hover:border-emerald-500 text-gray-700'
              }`}
            >
              Favores
            </button>
            <button
              onClick={() => handleFilterClick('Préstamos')}
              className={`px-4 py-2 rounded-full transition-all ${
                activeFilter === 'Préstamos'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 hover:border-emerald-500 text-gray-700'
              }`}
            >
              Préstamos
            </button>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Quitar filtros
              </button>
            )}
            <button
              onClick={onSwitchToNewPublication}
              className="ml-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear publicación
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando publicaciones...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={pub.perfiles?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.perfiles?.nombre_completo || pub.perfiles?.correo_electronico?.split('@')[0] || 'Usuario')}&background=10b981&color=fff&size=150`}
                      alt={pub.perfiles?.nombre_completo || pub.perfiles?.correo_electronico?.split('@')[0] || 'Usuario'}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.perfiles?.nombre_completo || pub.perfiles?.correo_electronico?.split('@')[0] || 'Usuario')}&background=10b981&color=fff&size=150`;
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{pub.perfiles?.nombre_completo || pub.perfiles?.correo_electronico?.split('@')[0] || 'Usuario'}</p>
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                        {pub.categoria}
                      </span>
                    </div>
                  </div>

                  {pub.foto_url && (
                    <img
                      src={pub.foto_url}
                      alt="Producto"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}

                  <p className="text-gray-700 mb-2">{pub.descripcion}</p>

                  {pub.telefono && (
                    <p className="text-gray-700 mb-4">📞 {pub.telefono}</p>
                  )}

                  <button
                    onClick={() => handleContactClick(pub.id)}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Lo tomé
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && publications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron publicaciones</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
