# Componentes y flujos

## Estructura

```
src/
├── App.jsx           # Enrutamiento por vistas (sessionStorage)
├── main.jsx          # Punto de entrada
└── components/
    ├── Login.jsx
    ├── Registro.jsx
    ├── Home.jsx
    ├── NuevaPublicacion.jsx
    └── Perfil.jsx
```

## Flujos principales

### Registro e inicio de sesión

1. `Registro.jsx` → `POST /api/auth/register`
2. `Login.jsx` → `POST /api/auth/login`
3. Tokens guardados en `sessionStorage`

### Tablón comunitario

1. `Home.jsx` carga publicaciones → `GET /api/publicaciones`
2. Búsqueda y filtro por categoría vía query params
3. Crear publicación → `NuevaPublicacion.jsx` → `POST /api/publicaciones`

### Perfil y reseñas

1. `Perfil.jsx` consulta perfil, publicaciones y solicitudes
2. Finalizar ayuda → actualizar solicitud y crear reseña
3. Ver reseñas recibidas → `GET /api/resenas/user/:id`

## Comunicación con backend

Todas las peticiones usan `import.meta.env.VITE_API_URL` como base URL.

No hay conexión directa a Supabase desde el frontend.
