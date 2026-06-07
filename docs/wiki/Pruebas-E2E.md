# Pruebas E2E

## Herramienta

[Playwright](https://playwright.dev/) — pruebas de caja negra sobre el navegador.

## Ubicación

- Specs: `e2e/vecired.spec.js`
- Helpers: `e2e/helpers.js`
- Evidencias: `e2e-evidence/*.png`

## Casos cubiertos

| Prueba | Historia de usuario |
| :--- | :--- |
| Login exitoso | HU-2 Autenticación |
| Crear publicación | HU-8 Publicaciones |
| Enviar reseña | HU-5 Reseñas |

## Ejecución

```bash
npm run test:e2e
```

Genera capturas en `e2e-evidence/` para documentación QA.

## CI

Las E2E no están en el pipeline de GitHub Actions por tiempo de ejecución; se ejecutan localmente antes de entregas.
