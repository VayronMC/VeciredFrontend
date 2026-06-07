# Instalación y ejecución local

## Requisitos

- Node.js 20+
- Backend VeciRed en ejecución
- npm 10+

## Pasos

```bash
git clone https://github.com/VayronMC/VeciredFrontend.git
cd VeciredFrontend
npm ci
cp .env.example .env
```

Configura en `.env`:

```
VITE_API_URL=http://localhost:3000
```

## Desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Docker (opcional)

```bash
docker compose up --build
```

App en `http://localhost:8080`.
