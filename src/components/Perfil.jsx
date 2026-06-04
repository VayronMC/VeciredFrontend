import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, LogOut, Pencil, Star } from 'lucide-react';

const Perfil = ({ userId, onBack, onLogout, isOwnProfile = true }) => {
  const [profile, setProfile] = useState(null);
  const [publications, setPublications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre_completo: '',
    correo_electronico: '',
    direccion: '',
    biografia: '',
    foto_url: ''
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPublicationId, setSelectedPublicationId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [publicationEditForm, setPublicationEditForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'Servicio',
    telefono: '',
    foto_url: ''
  });
  const [publicationPhotoPreview, setPublicationPhotoPreview] = useState('');
  const [inactivePublications, setInactivePublications] = useState([]);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile?usuario_id=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener perfil');
      }

      setProfile(data.profile);
      setEditForm({
        nombre_completo: data.profile.nombre_completo || '',
        correo_electronico: data.profile.correo_electronico || '',
        direccion: data.profile.direccion || '',
        biografia: data.profile.biografia || '',
        foto_url: data.profile.foto_url || ''
      });
      setPhotoPreview(data.profile.foto_url || '');
    } catch (err) {
      setError(err.message);
    }
  }, [userId]);

  const fetchPublications = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/publicaciones/user/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener publicaciones');
      }

      setPublications((data.publications || []).filter(pub => pub.estado === 'activa'));
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
    }
  }, [userId]);

  const fetchRequests = useCallback(async () => {
    if (!isOwnProfile) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/solicitudes/user/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener solicitudes');
      }

      setRequests(data.solicitudes || []);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
    }
  }, [userId, isOwnProfile]);

  const fetchInactivePublications = useCallback(async () => {
    if (!isOwnProfile) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/publicaciones/user/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar publicaciones inactivas');
      }

      setInactivePublications((data.publications || []).filter(pub => pub.estado === 'inactiva'));
    } catch (err) {
      console.error('Error al cargar publicaciones inactivas:', err);
    }
  }, [userId, isOwnProfile]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchPublications(), fetchRequests(), fetchInactivePublications()]);
      setLoading(false);
    };

    loadData();
  }, [fetchProfile, fetchPublications, fetchRequests, fetchInactivePublications]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuario_id: userId,
          ...editForm
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      setProfile(data.profile);
      
      // Actualizar sessionStorage con la nueva foto
      const userInfo = sessionStorage.getItem('user_data');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        user.foto_url = data.profile.foto_url;
        sessionStorage.setItem('user_data', JSON.stringify(user));
      }
      
      // Disparar evento para actualizar avatar en Home
      window.dispatchEvent(new Event('profileUpdated'));
      
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePublication = (publicationId) => {
    setSelectedPublicationId(publicationId);
    setShowDeleteModal(true);
  };

  const confirmDeletePublication = async () => {
    if (!selectedPublicationId) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/publicaciones/${selectedPublicationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar publicación');
      }

      setPublications(publications.filter(pub => pub.id !== selectedPublicationId));
      setShowDeleteModal(false);
      setSelectedPublicationId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelDeletePublication = () => {
    setShowDeleteModal(false);
    setSelectedPublicationId(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setEditForm({ ...editForm, foto_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setEditForm({ ...editForm, foto_url: '' });
  };

  const handleEditPublication = (publication) => {
    setEditingPublication(publication);
    setPublicationEditForm({
      titulo: publication.titulo || '',
      descripcion: publication.descripcion || '',
      categoria: publication.categoria || 'Servicio',
      telefono: publication.telefono || '',
      foto_url: publication.foto_url || ''
    });
    setPublicationPhotoPreview(publication.foto_url || '');
    setShowEditModal(true);
  };

  const handlePublicationPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPublicationPhotoPreview(reader.result);
        setPublicationEditForm({ ...publicationEditForm, foto_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePublicationPhoto = () => {
    setPublicationPhotoPreview('');
    setPublicationEditForm({ ...publicationEditForm, foto_url: '' });
  };

  const handleSavePublication = async () => {
    if (!editingPublication) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/publicaciones/${editingPublication.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: publicationEditForm.titulo,
          descripcion: publicationEditForm.descripcion,
          categoria: publicationEditForm.categoria,
          telefono: publicationEditForm.telefono,
          foto_url: publicationEditForm.foto_url
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar publicación');
      }

      // Actualizar la publicación en la lista local
      setPublications(publications.map(pub => 
        pub.id === editingPublication.id ? data.publication : pub
      ));

      setShowEditModal(false);
      setEditingPublication(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelEditPublication = () => {
    // Verificar si hay cambios sin guardar
    const hasChanges = 
      publicationEditForm.titulo !== editingPublication?.titulo ||
      publicationEditForm.descripcion !== editingPublication?.descripcion ||
      publicationEditForm.categoria !== editingPublication?.categoria ||
      publicationEditForm.telefono !== editingPublication?.telefono ||
      publicationEditForm.foto_url !== editingPublication?.foto_url;

    if (hasChanges) {
      if (window.confirm('Tienes cambios sin guardar. ¿Deseas guardar antes de salir?')) {
        handleSavePublication();
      } else {
        setShowEditModal(false);
        setEditingPublication(null);
      }
    } else {
      setShowEditModal(false);
      setEditingPublication(null);
    }
  };

  const handleTogglePublicationStatus = async (publicationId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/publicaciones/${publicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar estado de publicación');
      }

      // Actualizar la lista de publicaciones
      if (newStatus === 'inactiva') {
        setPublications(publications.filter(pub => pub.id !== publicationId));
        setInactivePublications([...inactivePublications, data.publication]);
      } else {
        setInactivePublications(inactivePublications.filter(pub => pub.id !== publicationId));
        setPublications([...publications, data.publication]);
      }

      // Recargar las publicaciones para asegurar consistencia
      await fetchPublications();
      await fetchInactivePublications();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Sección 2: Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Regresar</span>
          </button>
          {isOwnProfile && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Salir</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Sección 3: Información del perfil */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <img
                src={profile?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nombre_completo || profile?.correo_electronico?.split('@')[0] || 'Usuario')}&background=10b981&color=fff&size=150`}
                alt="Perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-emerald-400"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nombre_completo || profile?.correo_electronico?.split('@')[0] || 'Usuario')}&background=10b981&color=fff&size=150`;
                }}
              />
            </div>
            <div className="flex-1">
              <div className="space-y-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{profile?.nombre_completo}</h2>
                <p className="text-gray-600">{profile?.correo_electronico}</p>
                <p className="text-gray-600">{profile?.direccion}</p>
              </div>

              <div className="flex gap-3 mb-4">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white border-2 border-emerald-600 hover:bg-emerald-600 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  Ver reseñas
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-400 text-white border-2 border-blue-600 hover:bg-blue-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </div>

              {isEditing && isOwnProfile ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editForm.nombre_completo}
                      onChange={(e) => setEditForm({...editForm, nombre_completo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                    <input
                      type="email"
                      value={editForm.correo_electronico}
                      onChange={(e) => setEditForm({...editForm, correo_electronico: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      value={editForm.direccion}
                      onChange={(e) => setEditForm({...editForm, direccion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                    <textarea
                      value={editForm.biografia}
                      onChange={(e) => setEditForm({...editForm, biografia: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto de perfil</label>
                    <div className="flex items-center gap-4">
                      {photoPreview && (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500"
                        />
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                          >
                            Quitar foto
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Biografía</h3>
                  <p className="text-gray-700">{profile?.biografia || 'Sin biografía'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección 4: Mis publicaciones activas */}
        {isOwnProfile && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mis publicaciones activas</h3>
            {publications.length === 0 ? (
              <p className="text-gray-500">No tienes publicaciones activas.</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {publications.map((pub) => (
                  <div key={pub.id} className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {pub.foto_url && (
                      <img
                        src={pub.foto_url}
                        alt={pub.titulo}
                        className="w-full h-48 object-contain rounded-lg mb-3"
                      />
                    )}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs mb-2 ${
                      pub.categoria === 'Servicios' ? 'bg-blue-100 text-blue-800' :
                      pub.categoria === 'Favores' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pub.categoria}
                    </span>
                    <h4 className="font-bold text-gray-900 mb-2">{pub.titulo}</h4>
                    <p className="text-gray-600 text-sm mb-3">{pub.descripcion}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPublication(pub)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleTogglePublicationStatus(pub.id, 'inactiva')}
                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                      >
                        Finalizar
                      </button>
                      <button
                        onClick={() => handleDeletePublication(pub.id)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección 4.5: Mis publicaciones inactivas */}
        {isOwnProfile && inactivePublications.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mis publicaciones inactivas</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {inactivePublications.map((pub) => (
                <div key={pub.id} className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-75">
                  {pub.foto_url && (
                    <img
                      src={pub.foto_url}
                      alt={pub.titulo}
                      className="w-full h-48 object-contain rounded-lg mb-3"
                    />
                  )}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mb-2 ${
                    pub.categoria === 'Servicios' ? 'bg-blue-100 text-blue-800' :
                    pub.categoria === 'Favores' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pub.categoria}
                  </span>
                  <h4 className="font-bold text-gray-900 mb-2">{pub.titulo}</h4>
                  <p className="text-gray-600 text-sm mb-3">{pub.descripcion}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePublicationStatus(pub.id, 'activa')}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Reactivar
                    </button>
                    <button
                      onClick={() => handleDeletePublication(pub.id)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección 5: Servicios, Favores y Préstamos solicitados */}
        {isOwnProfile && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Servicios, Favores y Préstamos solicitados</h3>
            {requests.length === 0 ? (
              <p className="text-gray-500">No tienes solicitudes activas.</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {requests.map((req) => (
                  <div key={req.id} className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {req.publicaciones?.foto_url && (
                      <img
                        src={req.publicaciones.foto_url}
                        alt={req.publicaciones.titulo}
                        className="w-full h-48 object-contain rounded-lg mb-3"
                      />
                    )}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs mb-2 ${
                      req.publicaciones?.categoria === 'Servicios' ? 'bg-blue-100 text-blue-800' :
                      req.publicaciones?.categoria === 'Favores' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.publicaciones?.categoria}
                    </span>
                    <h4 className="font-bold text-gray-900 mb-2">{req.publicaciones?.titulo}</h4>
                    <p className="text-gray-600 text-sm mb-3">{req.publicaciones?.descripcion}</p>
                    <button
                      className="w-full px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
                    >
                      Finalizar y calificar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">¿Estás seguro de eliminar esta publicación?</h3>
            <p className="text-gray-700 mb-6">
              Esta acción no se puede deshacer. La publicación será eliminada permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeletePublication}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg border-2 border-red-600 hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={cancelDeletePublication}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de publicación */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar publicación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={publicationEditForm.categoria}
                  onChange={(e) => setPublicationEditForm({ ...publicationEditForm, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Servicios">Servicios</option>
                  <option value="Favores">Favores</option>
                  <option value="Préstamos">Préstamos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={publicationEditForm.titulo}
                  onChange={(e) => setPublicationEditForm({ ...publicationEditForm, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
                <div className="flex items-center gap-4">
                  {publicationPhotoPreview && (
                    <img
                      src={publicationPhotoPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover border-2 border-emerald-500"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePublicationPhotoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {publicationPhotoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePublicationPhoto}
                        className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                      >
                        Quitar foto
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={publicationEditForm.descripcion}
                  onChange={(e) => setPublicationEditForm({ ...publicationEditForm, descripcion: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={publicationEditForm.telefono}
                  onChange={(e) => setPublicationEditForm({ ...publicationEditForm, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSavePublication}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg border-2 border-emerald-600 hover:bg-emerald-600 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancelEditPublication}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
