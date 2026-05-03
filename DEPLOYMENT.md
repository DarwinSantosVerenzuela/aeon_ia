# 🚀 Guía de Despliegue Continuo — Estándar de Producción

> Este documento define el proceso estándar de CI/CD para todos los proyectos.
> Seguirlo al pie de la letra garantiza despliegues sin errores.

---

## 📋 Índice

1. [Estructura de Ramas](#estructura-de-ramas)
2. [Archivos Requeridos](#archivos-requeridos)
3. [Configuración Inicial (solo una vez)](#configuración-inicial)
4. [Secrets de GitHub](#secrets-de-github)
5. [Flujo de Despliegue](#flujo-de-despliegue)
6. [Configurar el VPS](#configurar-el-vps)
7. [Configurar Nginx Proxy Manager](#configurar-nginx-proxy-manager)
8. [Comandos de Verificación](#comandos-de-verificación)
9. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)

---

## Estructura de Ramas

```
feature/nombre  →  dev  →  qa  →  main
```

- **feature/**: desarrollo de funcionalidades
- **dev**: integración y pruebas locales
- **qa**: validación previa a producción
- **main**: producción — aquí se crea la imagen Docker automáticamente

> ⚠️ El workflow de GitHub Actions **SOLO** se ejecuta en `main`. Nunca en otras ramas.

---

## Archivos Requeridos

Todo proyecto debe tener estos archivos en la raíz:

```
proyecto/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
└── .github/
    └── workflows/
        └── ci-cd.yml
```

---

## Dockerfile (Estándar Next.js)

> ⚠️ **REGLA CRÍTICA**: El puerto en `EXPOSE` y `ENV PORT` debe ser **IDÉNTICO** al puerto externo del proyecto.
> Esto garantiza que Nginx Proxy Manager pueda conectarse usando el nombre del contenedor y el mismo puerto.

```dockerfile
# Stage 1: Instalar TODAS las dependencias (dev + prod, necesarias para build)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                          # ← NUNCA usar --only=production aquí

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner (imagen final liviana)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs

EXPOSE PUERTO_DEL_PROYECTO        # ← mismo número que el puerto externo

ENV PORT=PUERTO_DEL_PROYECTO      # ← mismo número que el puerto externo
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

**Ejemplo para Aeon IA (puerto 3009):**
```dockerfile
EXPOSE 3009
ENV PORT=3009
ENV HOSTNAME="0.0.0.0"
```

> ⚠️ `next.config.ts` debe tener `output: "standalone"` para que el Dockerfile funcione.

---

## docker-compose.yml (Estándar)

> ⚠️ **REGLA CRÍTICA**: El mapeo de puertos debe ser `PUERTO:PUERTO` (mismo número en ambos lados).
> Esto unifica el acceso interno y externo — NPM usa el nombre del contenedor con ese mismo puerto.

```yaml
services:
  nombre-app:
    image: ghcr.io/GITHUB_USER/REPO_NAME:latest
    container_name: nombre-app
    restart: unless-stopped
    ports:
      - "PUERTO:PUERTO"        # ← mismo número en ambos lados (ej: 3009:3009)
    env_file:
      - .env
    networks:
      - app-network
      - red_knowtech           # ← red del Nginx Proxy Manager (OBLIGATORIO)
    mem_limit: 256m
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:PUERTO"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

networks:
  app-network:
    driver: bridge
  red_knowtech:
    external: true             # ← red externa compartida con NPM
```

**Ejemplo para Aeon IA (puerto 3009):**
```yaml
ports:
  - "3009:3009"
networks:
  - aeon-network
  - red_knowtech
```

---

## .dockerignore (Estándar)

```
node_modules
.next
.git
.github
*.md
.vscode
.idea
.env
.env.*
!.env.example
```

---

## .github/workflows/ci-cd.yml (Estándar)

```yaml
name: CI/CD - Build & Deploy

on:
  push:
    branches: [main]       # Solo en main
  workflow_dispatch:        # Permite ejecución manual

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type Check
        run: npx tsc --noEmit

  build:
    name: Build Docker Image
    needs: quality
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    name: Deploy to Production
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/NOMBRE-APP
            docker compose pull
            docker compose up -d --force-recreate
            docker image prune -f
```

---

## Configuración Inicial

### 1. Habilitar permisos de Actions en GitHub

Usando GitHub CLI (una sola vez por repo):

```powershell
gh auth login -p https -h github.com -w

# Cambiar a write (OBLIGATORIO para crear imágenes Docker)
gh api -X PUT repos/GITHUB_USER/REPO/actions/permissions/workflow `
  -f default_workflow_permissions=write `
  -F can_approve_pull_request_reviews=true
```

---

## Secrets de GitHub

Configurar estos secrets en: **Settings → Secrets and variables → Actions**

| Secret | Descripción | Cómo obtenerlo |
|--------|-------------|----------------|
| `AI_PROVIDER` | Proveedor AI (`openrouter`) | Valor fijo |
| `OPENROUTER_API_KEY` | API Key de OpenRouter | https://openrouter.ai/keys |
| `OPENROUTER_MODEL` | Modelo por defecto | Ej: `google/gemma-4-31b-it:free` |
| `VPS_HOST` | IP del servidor | Panel de Contabo |
| `VPS_USER` | Usuario SSH (normalmente `root`) | Panel de Contabo |
| `VPS_SSH_KEY` | Llave privada SSH completa | Ver abajo |

### Configurar secrets desde la terminal:

```powershell
# Secrets fijos
echo "openrouter" | gh secret set AI_PROVIDER --repo GITHUB_USER/REPO
echo "google/gemma-4-31b-it:free" | gh secret set OPENROUTER_MODEL --repo GITHUB_USER/REPO
echo "TU_API_KEY" | gh secret set OPENROUTER_API_KEY --repo GITHUB_USER/REPO

# Llave SSH — OBLIGATORIO usar -Raw para preservar saltos de línea
Get-Content "$env:USERPROFILE\.ssh\id_rsa_knowtech" -Raw | gh secret set VPS_SSH_KEY --repo GITHUB_USER/REPO

# Host y usuario
echo "IP_DEL_SERVIDOR" | gh secret set VPS_HOST --repo GITHUB_USER/REPO
echo "root" | gh secret set VPS_USER --repo GITHUB_USER/REPO
```

> ⚠️ La llave SSH **DEBE** configurarse con `Get-Content -Raw`. Si se copia manualmente pierde el formato y falla con `ssh: no key found`.

---

## Flujo de Despliegue

### Merge de ramas (en orden):

```powershell
# 1. Commit en feature
git add -A
git commit -m "feat: descripcion del cambio"
git push origin feature/nombre

# 2. Merge a dev
git checkout dev
git merge feature/nombre --no-ff -m "feat: NombreApp v1.x - descripcion"
git push origin dev

# 3. Merge a qa
git checkout qa
git merge dev --no-ff -m "release: NombreApp v1.x - validacion QA"
git push origin qa

# 4. Merge a main (DISPARA el pipeline automáticamente)
git checkout main
git merge qa --no-ff -m "release: NombreApp v1.x - produccion"
git push origin main
```

### Verificar el pipeline:

```powershell
# Ver runs activos
gh run list --repo GITHUB_USER/REPO --limit 5

# Monitorear en tiempo real
gh run watch ID_DEL_RUN --repo GITHUB_USER/REPO

# Lanzar manualmente
gh workflow run "CI/CD - Build & Deploy" --repo GITHUB_USER/REPO --ref main
```

---

## Configurar el VPS

### Primera vez (setup inicial):

```bash
# Crear carpeta del proyecto
mkdir -p /opt/nombre-app && cd /opt/nombre-app

# Crear .env
nano .env
# Pegar las variables de entorno y guardar con Ctrl+X → Y → Enter

# Crear docker-compose.yml
nano docker-compose.yml
# Pegar el contenido y guardar con Ctrl+X → Y → Enter

# Login en GitHub Container Registry con token read:packages
echo "GITHUB_TOKEN" | docker login ghcr.io -u GITHUB_USER --password-stdin

# Descargar imagen y levantar
docker compose pull
docker compose up -d
```

> Para el token: GitHub → Settings → Developer settings → Personal access tokens → New token → marcar solo `read:packages`

### Verificar que corre:

```bash
docker ps | grep nombre-app
docker port nombre-app           # ← verificar que el puerto es correcto
docker logs nombre-app --tail 20
```

---

## Configurar Nginx Proxy Manager

> Se usa **Nginx Proxy Manager (NPM)** — interfaz web, NO configuración manual de nginx.

### Requisito previo — conectar el contenedor a la red de NPM:

La red compartida del servidor es `red_knowtech`. El contenedor debe estar en esa red para que NPM pueda encontrarlo por nombre.

Esto ya está en el `docker-compose.yml` estándar. Si por alguna razón no está conectado, conectar manualmente:

```bash
docker network connect red_knowtech nombre-app
# Verificar:
docker inspect nombre-app | grep -A 5 red_knowtech
```

### Configuración en NPM:

| Campo | Valor |
|-------|-------|
| **Domain Names** | `subdominio.knowtech.cc` |
| **Scheme** | `http` |
| **Forward Hostname / IP** | `nombre-app` (nombre exacto del contenedor) |
| **Forward Port** | `PUERTO` (el mismo puerto del proyecto, ej: `3009`) |
| **Websockets Support** | ✅ activado |
| **Block Common Exploits** | ✅ activado |

> ⚠️ El **Forward Port** debe ser el mismo número definido en `ENV PORT` del Dockerfile y en el mapeo `PUERTO:PUERTO` del docker-compose.
> Nunca mezclar el puerto interno (3000) con el externo (3009) — deben ser el mismo en todos los archivos.

### SSL:
En NPM, tab **SSL** → Request a new SSL Certificate → Enable Force SSL.

---

## Comandos de Verificación

### En local (antes de hacer push):

```powershell
# Verificar que no hay errores
npx tsc --noEmit
npm run lint
```

### En el servidor:

```bash
# Ver contenedores activos
docker ps -a

# Ver puertos del contenedor
docker port nombre-app

# Ver redes del contenedor
docker inspect nombre-app | grep -A 20 Networks

# Ver logs en tiempo real
docker logs -f nombre-app

# Actualizar imagen manualmente
docker compose pull
docker compose up -d --force-recreate
docker image prune -f
```

---

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `ssh: no key found` | VPS_SSH_KEY mal formateado | Usar `Get-Content -Raw` en PowerShell |
| `403 Forbidden` al hacer pull | Token sin permiso `read:packages` | Crear PAT con scope `read:packages` |
| Build Docker skipped | Permisos del workflow en `read` | Cambiar a `write` con `gh api PUT` |
| `502 Bad Gateway` en NPM | Contenedor no está en `red_knowtech` | `docker network connect red_knowtech nombre-app` |
| `502 Bad Gateway` en NPM | Puerto incorrecto en NPM | Usar el mismo puerto del `ENV PORT` del Dockerfile |
| `502 Bad Gateway` en NPM | Imagen vieja corriendo (puerto distinto) | `docker compose pull && docker compose up -d --force-recreate` |
| `npm ci --only=production` falla | No instala devDependencies para build | Usar `npm ci` sin flags en el stage de deps |
| Pipeline no se activa | Sin `workflow_dispatch` en el trigger | Agregar `workflow_dispatch` al workflow |

---

## Puertos Usados por Proyecto

| Proyecto | Puerto | Contenedor |
|----------|--------|------------|
| Aeon IA  | 3009   | `aeon-ia` |
| SomaOS   | 8000   | `somaos` |
| _nuevo_  | 3010   | `nombre-app` |

> ⚠️ Cada proyecto tiene un puerto único. El mismo número se usa en: Dockerfile `ENV PORT`, docker-compose `PUERTO:PUERTO`, y NPM `Forward Port`.
