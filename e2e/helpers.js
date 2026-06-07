import fs from 'fs';
import path from 'path';

export const EVIDENCE_DIR = path.join(process.cwd(), 'e2e-evidence');

export const E2E_USER = {
  id: 'e2e-user-id-00000000-0000-0000-0000-000000000001',
  email: 'e2e.vecired@test.com',
  nombre_completo: 'Usuario E2E VeciRed',
  direccion: 'Colonia VeciRed 123',
  foto_url: null,
};

export const E2E_PASSWORD = 'password123';

export function ensureEvidenceDir() {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
}

export async function captureEvidence(page, filename) {
  ensureEvidenceDir();
  await page.screenshot({
    path: path.join(EVIDENCE_DIR, filename),
    fullPage: true,
  });
}

export async function seedAuthenticatedSession(page) {
  await page.goto('/');
  await page.evaluate(
    ({ user, token }) => {
      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('refresh_token', 'e2e-refresh-token');
      sessionStorage.setItem('user_data', JSON.stringify(user));
      sessionStorage.setItem('current_view', 'home');
    },
    { user: E2E_USER, token: 'e2e-access-token' },
  );
  await page.reload();
}
