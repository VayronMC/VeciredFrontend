# Despliegue en producción

## Plataforma: Vercel

### Pasos

1. Cuenta en [vercel.com](https://vercel.com)
2. Importar repositorio `VeciredFrontend`
3. Framework: **Vite**
4. Variable de entorno:

| Variable | Ejemplo |
| :--- | :--- |
| `VITE_API_URL` | `https://vecired-backend.onrender.com` |

5. Desplegar desde rama `main`

### Verificación

- La app carga en la URL de Vercel
- Login y tablón funcionan contra el backend en Render
- No exponer claves de Supabase en Vercel (no son necesarias)

## CI/CD

GitHub Actions ejecuta lint y build en cada PR. Vercel redeploya al push en `main`.
