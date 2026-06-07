import { test, expect } from '@playwright/test';
import {
  captureEvidence,
  ensureEvidenceDir,
  E2E_PASSWORD,
  E2E_USER,
  seedAuthenticatedSession,
} from './helpers.js';

test.beforeAll(() => {
  ensureEvidenceDir();
});

/**
 * @requisito Autenticación
 * @description Verifica el flujo completo de inicio de sesión exitoso desde la pantalla de login hasta el Home
 * @type {End-to-End - Caja Negra}
 * @precondiciones API de autenticación disponible; vecino registrado con credenciales válidas; aplicación frontend en ejecución
 * @datos_entrada Correo: e2e.vecired@test.com | Contraseña: password123
 * @pasos_ejecucion 1. Navegar a la URL base de VeciRed
 *                  2. Ingresar correo electrónico y contraseña en el formulario de login
 *                  3. Hacer clic en el botón "Entrar"
 *                  4. Verificar redirección visual al Home con barra de búsqueda y acciones del vecino autenticado
 *                  5. Capturar evidencia de pantalla del Home tras login exitoso
 * @resultado_esperado La interfaz muestra el Home con el campo "Buscar en tu comunidad..." y el botón "Crear publicación"
 */
test('Inicio de sesión exitoso y redirección al Home', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Inicio de sesión exitoso',
        user: E2E_USER,
        session: {
          access_token: 'e2e-access-token',
          refresh_token: 'e2e-refresh-token',
          expires_at: 9999999999,
        },
      }),
    });
  });

  await page.route('**/api/publicaciones**', async (route) => {
    if (route.request().method() === 'GET' && !route.request().url().includes('notificaciones')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ publications: [], count: 0 }),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/');

  await page.locator('#correo_electronico').fill(E2E_USER.email);
  await page.locator('#contraseña').fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByPlaceholder('Buscar en tu comunidad...')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: 'Crear publicación' })).toBeVisible();

  await captureEvidence(page, 'login-exitoso.png');
});

/**
 * @requisito Gestión de publicaciones
 * @description Verifica el flujo de creación de una nueva publicación de ayuda y su visualización en el listado del Home
 * @type {End-to-End - Caja Negra}
 * @precondiciones Vecino autenticado en la plataforma; API de publicaciones disponible; Home accesible
 * @datos_entrada Categoría: Servicios | Título: Publicación E2E Ayuda Vecinal | Descripción: Ofrezco apoyo vecinal automatizado E2E | Teléfono: 5512345678
 * @pasos_ejecucion 1. Iniciar sesión simulada en el Home
 *                  2. Hacer clic en "Crear publicación"
 *                  3. Completar categoría, título, descripción y medio de contacto
 *                  4. Enviar el formulario con "Publicar"
 *                  5. Verificar que la publicación aparece en la lista del Home
 *                  6. Capturar evidencia de pantalla con la publicación visible
 * @resultado_esperado La interfaz regresa al Home y muestra la nueva publicación con el título ingresado en el listado
 */
test('Creación de publicación y aparición en el listado', async ({ page }) => {
  const tituloPublicacion = `Publicación E2E Ayuda Vecinal ${Date.now()}`;
  const descripcion = 'Ofrezco apoyo vecinal automatizado E2E';
  const publications = [];

  await page.route('**/api/publicaciones**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'GET' && !url.includes('notificaciones') && !url.includes('/user/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ publications, count: publications.length }),
      });
      return;
    }

    if (method === 'POST' && !url.includes('notificaciones')) {
      const body = route.request().postDataJSON();
      const nuevaPublicacion = {
        id: `pub-e2e-${Date.now()}`,
        titulo: body.titulo,
        descripcion: body.descripcion,
        categoria: body.categoria,
        telefono: body.telefono,
        estado: 'activa',
        usuario_id: body.usuario_id,
        perfiles: {
          id: E2E_USER.id,
          nombre_completo: E2E_USER.nombre_completo,
          correo_electronico: E2E_USER.email,
          foto_url: null,
        },
      };
      publications.push(nuevaPublicacion);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Publicación creada exitosamente',
          publication: nuevaPublicacion,
        }),
      });
      return;
    }

    if (method === 'GET' && url.includes('notificaciones')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: [], count: 0 }),
      });
      return;
    }

    await route.continue();
  });

  await seedAuthenticatedSession(page);

  await expect(page.getByPlaceholder('Buscar en tu comunidad...')).toBeVisible();
  await page.getByRole('button', { name: 'Crear publicación' }).click();

  await expect(page.getByRole('heading', { name: 'Crear Publicación' })).toBeVisible();
  await page.locator('#categoria').selectOption('Servicios');
  await page.locator('#titulo').fill(tituloPublicacion);
  await page.locator('#descripcion').fill(descripcion);
  await page.locator('#telefono').fill('5512345678');

  await captureEvidence(page, 'publicacion-formulario-completado.png');

  await page.getByRole('button', { name: 'Publicar' }).click();

  await expect(page.getByPlaceholder('Buscar en tu comunidad...')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: tituloPublicacion })).toBeVisible();

  await captureEvidence(page, 'publicacion-creada-listado.png');
});

/**
 * @requisito Sistema de reseñas
 * @description Verifica el flujo de calificación y envío de reseña a un vecino tras finalizar una solicitud de ayuda
 * @type {End-to-End - Caja Negra}
 * @precondiciones Vecino autenticado con al menos una solicitud activa en su perfil; API de reseñas disponible
 * @datos_entrada Calificación: 5 estrellas | Comentario: Excelente experiencia vecinal E2E
 * @pasos_ejecucion 1. Iniciar sesión simulada y navegar al perfil del vecino
 *                  2. Abrir el modal "Finalizar y calificar" sobre una solicitud activa
 *                  3. Seleccionar 5 estrellas y escribir un comentario
 *                  4. Hacer clic en "Enviar" para registrar la reseña
 *                  5. Verificar cierre del modal y ausencia de solicitudes pendientes por calificar
 *                  6. Capturar evidencia de pantalla tras envío exitoso
 * @resultado_esperado El modal de calificación se cierra y la sección de solicitudes muestra que no hay solicitudes activas pendientes
 */
test('Envío de reseña a vecino tras finalizar solicitud', async ({ page }) => {
  const solicitudId = 'solicitud-e2e-001';
  const comentario = 'Excelente experiencia vecinal E2E';
  let solicitudesActivas = [
    {
      id: solicitudId,
      usuario_id: E2E_USER.id,
      publicacion_id: 'pub-vecino-001',
      estado: 'activa',
      publicaciones: {
        id: 'pub-vecino-001',
        titulo: 'Favor de prueba E2E',
        descripcion: 'Ayuda vecinal para prueba automatizada',
        categoria: 'Favores',
        usuario_id: 'vecino-evaluado-id',
        perfiles: {
          id: 'vecino-evaluado-id',
          nombre_completo: 'Vecino Evaluado E2E',
          foto_url: null,
        },
      },
    },
  ];

  await page.route('**/api/auth/profile?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ profile: { ...E2E_USER, biografia: 'Perfil de prueba E2E' } }),
    });
  });

  await page.route('**/api/publicaciones/user/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ publications: [], count: 0 }),
    });
  });

  await page.route('**/api/solicitudes/user/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ solicitudes: solicitudesActivas, count: solicitudesActivas.length }),
    });
  });

  await page.route('**/api/resenas/user/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resenas: [], count: 0 }),
    });
  });

  await page.route('**/api/resenas/solicitud/**', async (route) => {
    if (route.request().method() === 'PUT') {
      solicitudesActivas = [];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Estado de solicitud actualizado exitosamente',
          solicitud: { id: solicitudId, estado: 'completada' },
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/resenas', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Reseña creada exitosamente',
          resena: {
            id: 'resena-e2e-001',
            ...body,
          },
        }),
      });
      return;
    }
    await route.continue();
  });

  await seedAuthenticatedSession(page);

  await page.locator('button.rounded-full.overflow-hidden').first().click();
  await expect(page.getByText('Servicios, Favores y Préstamos solicitados')).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Finalizar y calificar' }).click();
  await expect(page.getByText('¿Cómo fue tu experiencia?')).toBeVisible();

  await page.locator('.fixed.inset-0 .flex.gap-2.mb-4 svg').nth(4).click();
  await page.getByPlaceholder('Cuéntanos más sobre tu experiencia...').fill(comentario);

  await captureEvidence(page, 'resena-formulario-completado.png');

  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(page.getByText('¿Cómo fue tu experiencia?')).not.toBeVisible({ timeout: 10000 });
  await expect(page.getByText('No tienes solicitudes activas.')).toBeVisible();

  await captureEvidence(page, 'resena-enviada-exito.png');
});
