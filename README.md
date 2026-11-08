# KeepUp

[Ver demo en vivo](https://proyecto-m4-guillermo-cely.vercel.app/) · [Ver bocetos de interfaz en Figma](https://www.figma.com/design/B2DkASQBGZ7SdeBgasB998/KeepUp-%E2%80%94-Bocetos-de-interfaz?node-id=0-1)

KeepUp es una app de tareas con autenticación, prioridades, fechas límite y recurrencia mensual. Cada usuario ve solo sus tareas en Cloud Firestore, con perfil, tema, mascota con chat de Gemini y envío de resumen de tareas y contacto por Amazon SES.

Los bocetos de interfaz están documentados en Figma para mostrar el proceso de diseño y la estructura de las pantallas.

- Inicio de sesión con correo/contraseña y Google.
- CRUD de tareas con prioridad, fecha límite, búsqueda, filtros y recurrencia mensual.
- Perfil con avatar y tema claro/oscuro.
- Mascota personalizable con chat de Gemini que solo da recomendaciones.
- Envío de resumen de tareas por correo electrónico y formulario de contacto con Amazon SES.
- Reglas de Firestore por usuario y despliegue en Vercel.

## Tecnologías

![React](https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.3.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-13.0.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![AWS SES](https://img.shields.io/badge/AWS_SES-3.1161.0-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-65.9.0-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash_Lite-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24.12.0-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Git](https://img.shields.io/badge/Git-2.55.0-F05032?style=for-the-badge&logo=git&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-Bocetos-F24E1E?style=for-the-badge&logo=figma&logoColor=white)

## Inicio rápido

```bash
git clone https://github.com/guillermocely/proyectoM4_GuillermoCely.git
cd proyectoM4_GuillermoCely
npm install
cp .env.example .env
npm run dev
```

> Usa Node 24.12+. En Windows PowerShell, copia el archivo con `Copy-Item .env.example .env`. Completa el `.env` antes de abrir la app. Para probar `/api/mascot` y `/api/send-email`, ejecuta `vercel link` y luego `npm run dev:vercel`.

<details>
<summary>✅ Requisitos previos</summary>

| Requisito | Versión | Descarga |
|---|---|---|
| Node.js | 24.12.0 o superior | [Descargar Node.js](https://nodejs.org/en/download) |
| npm | 10 o superior (viene con Node.js) | [Guía de npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) |
| Git | Última versión (opcional si descargas el ZIP) | [Descargar Git](https://git-scm.com/downloads) |
| Visual Studio Code (opcional) | Última versión | [Descargar VS Code](https://code.visualstudio.com/download) |
| Cuenta de Firebase | — | [Firebase Console](https://console.firebase.google.com/) |
| Cuenta de AWS | — | [AWS Console](https://aws.amazon.com/console/) |
| Cuenta de Vercel | — | [Crear cuenta en Vercel](https://vercel.com/signup) |

**React no se descarga por separado.** `npm install` instala React y React DOM **19.3.1**, Vite **8.3.4** y las demás dependencias definidas en `package.json`. La documentación oficial está en [react.dev](https://react.dev/).

> Si solo quieres revisar el proyecto, no necesitas instalar nada: abre el demo o los bocetos de Figma. Para ejecutarlo en local, instala Node.js 24.12+ y Git; npm viene incluido con Node. El repo incluye `.nvmrc` con `24.12.0` por si usas `nvm`. `package.json` declara `engines.node` como `>=24.12.0`.

</details>

<details>
<summary>🚀 Instalación y ejecución</summary>

### 1. Obtén el código

Con Git:

```bash
git clone https://github.com/guillermocely/proyectoM4_GuillermoCely.git
cd proyectoM4_GuillermoCely
```

Si descargas el ZIP, descomprímelo y abre esa carpeta en la terminal.

### 2. Instala las dependencias

```bash
npm install
```

Esto instala todo lo que usa el proyecto. No necesitas instalar Firebase, React, AWS SDK ni Vercel por separado.

### 3. Crea el archivo de variables de entorno

En macOS o Linux:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Abre `.env` y completa las variables de Firebase. Las de AWS y Gemini son opcionales si no vas a probar el contacto ni la mascota. El archivo `.env` está en `.gitignore` y no se sube al repositorio. Si cambias el `.env`, reinicia el servidor.

### 4. Ejecuta la app

```bash
npm run dev
```

Abre `http://localhost:5173`. Este comando solo levanta Vite: la autenticación y las tareas funcionan, pero las rutas `/api/mascot` y `/api/send-email` no existen en ese servidor.

### 5. Prueba las funciones serverless

```bash
vercel link
vercel pull
npm run dev:vercel
```

- `vercel link` vincula la carpeta con tu proyecto de Vercel. Si no tienes uno, la CLI te guía para crearlo.
- `vercel pull` descarga la configuración y las variables del entorno **Development** en `.vercel/`. Es el paso recomendado por Vercel para `vercel dev` y `vercel build`.
- `vercel dev` también descarga esas variables automáticamente. Si quieres que `npm run dev` (Vite) lea las variables de Vercel, ejecuta `vercel env pull .env.local`; Vite le da prioridad a `.env.local` sobre `.env`.
- `npm run dev:vercel` usa el `vercel` local que instala `npm install`; no necesitas instalarlo de forma global.
- Si no eres el dueño del proyecto en Vercel, crea tu propio proyecto, ejecuta `vercel link` y carga tus propias variables en **Settings → Environment Variables**. No uses credenciales ajenas.

### 6. Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia Vite en `http://localhost:5173`. |
| `npm run dev:vercel` | Inicia Vite y las funciones de `api/` con `vercel dev`. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run build` | Compila TypeScript y genera `dist/`. |
| `npm run preview` | Sirve la carpeta `dist/` para probar el build. |

### 7. Verifica el build

```bash
npm run lint
npm run build
npm run preview
```

</details>

<details>
<summary>▲ Desplegar en Vercel (variables de entorno y dominios)</summary>

### 1. Despliega el proyecto

```bash
npx vercel --prod
```

Vercel detecta Vite y la carpeta `api/` sin necesidad de `vercel.json`.

### 2. Variables de entorno en Vercel

En **Vercel → tu proyecto → Settings → Environment Variables**, agrega estas variables y marca **Production**, **Preview** y **Development**:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
SES_FROM_EMAIL=tu_correo_verificado@gmail.com

GEMINI_API_KEY=tu_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
FIREBASE_API_KEY=tu_api_key_web_de_firebase
```

- Las variables con prefijo `VITE_` las necesita Vite durante el build del frontend.
- Las de AWS y Gemini las usan las funciones de `api/` en runtime. No llevan prefijo `VITE_` porque son secretos.
- `FIREBASE_API_KEY` puede ser la misma `VITE_FIREBASE_API_KEY`; si no la defines, el servidor usa `VITE_FIREBASE_API_KEY`.
- El formulario de contacto no pide correo: todos los comentarios se envían a `megaguillermo@gmail.com`.
- Después de agregar o cambiar variables, haz un **Redeploy** para que el build y las funciones tomen los valores nuevos.

### 3. Dominios autorizados en Firebase

Si Vercel no completa el deploy, revisa los logs del build, ejecuta `npm run build` en local y confirma que las variables estén cargadas. Si el deploy abre pero falla el inicio de sesión con Google, o si la app desplegada no responde como esperas, revisa primero las variables de entorno y luego **Firebase → Authentication → Settings → Authorized domains**. Agrega el dominio de producción y los dominios de preview que uses. Ejemplo con los dominios de este proyecto:

| Dominio autorizado | Uso |
|---|---|
| `localhost` | Desarrollo local. |
| `pt36-keepup.firebaseapp.com` | Dominio de Firebase Authentication. |
| `pt36-keepup.web.app` | Dominio de Firebase Hosting. |
| `proyecto-m4-guillermo-cely.vercel.app` | Dominio de producción en Vercel. |
| `proyecto-m4-guillermo-cely-les1tgt0z-guillermo-celys-projects.vercel.app` | Preview de Vercel. |
| `proyecto-m4-guillermo-cely-dyogm1ntr-guillermo-celys-projects.vercel.app` | Preview de Vercel. |
| `proyecto-m4-guillermo-cely-git-main-guillermo-celys-projects.vercel.app` | Preview de la rama `main`. |

> Los dominios de preview cambian con cada deploy. Copia el dominio actual desde **Vercel → Deployments** y agrégalo a la lista si el login falla en esa URL. No necesitas agregar rutas: solo el dominio, sin `https://` ni `/` final.

</details>

<details>
<summary>🔥 Configurar Firebase</summary>

### 1. Crea el proyecto y la app web

1. Entra a Firebase Console y crea un proyecto.
2. En **Project settings → General → Your apps**, haz clic en el ícono `</>`.
3. Registra la app web y copia los valores de `firebaseConfig`.

### 2. Completa el `.env`

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

El código lee estas variables con `import.meta.env.VITE_...` en `src/firebase/config.ts`.

### 3. Activa los métodos de ingreso

1. Ve a **Build → Authentication → Get started**.
2. En **Sign-in method**, habilita **Email/Password** y **Google**.
3. Para Google, elige un correo de soporte y guarda.
4. En **Authentication → Settings → Authorized domains**, `localhost` ya está autorizado. Agrega tu dominio de producción de Vercel, los dominios de preview y cualquier dominio propio. Si el inicio de sesión con Google falla en el celular, revisa primero esta lista y el correo de soporte del proveedor. En el checklist de Vercel de este README tienes un ejemplo con los dominios de este proyecto.

### 4. Crea Cloud Firestore

1. Ve a **Build → Firestore Database → Create database**.
2. Elige **Production mode**, no **Test mode**.
3. Elige la ubicación. No se puede cambiar después.

### 5. Publica las reglas

En **Firestore Database → Rules**, borra el contenido y pega las reglas completas de `firestore.rules`. Luego haz clic en **Publish**.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deniega todo por defecto.
    match /{document=**} {
      allow read, write: if false;
    }

    match /users/{userId}/mascot/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/mascotMessages/{messageId} {
      allow read, delete: if request.auth != null && request.auth.uid == userId;

      allow create: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.keys().hasAll(['role', 'content', 'createdAt'])
        && request.resource.data.role in ['user', 'assistant']
        && request.resource.data.content is string
        && request.resource.data.content.size() > 0
        && request.resource.data.content.size() <= 1000
        && request.resource.data.createdAt is string
        && request.resource.data.createdAt.size() <= 40;
    }

    match /tasks/{taskId} {
      function isSignedIn() {
        return request.auth != null;
      }

      function isOwnerExisting() {
        return isSignedIn() && request.auth.uid == resource.data.userId;
      }

      function isOwnerIncoming() {
        return isSignedIn() && request.auth.uid == request.resource.data.userId;
      }

      function hasValidShape(data) {
        return data.keys().hasAll([
            'title', 'description', 'priority', 'dueDate',
            'completed', 'repeatMonthly', 'userId', 'createdAt'
          ])
          && data.title is string
          && data.title.size() > 0
          && data.title.size() <= 200
          && data.description is string
          && data.description.size() <= 5000
          && data.priority in ['alta', 'media', 'baja']
          && data.dueDate is string
          && data.dueDate.matches('^$|^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
          && data.completed is bool
          && data.repeatMonthly is bool
          && data.userId is string
          && data.createdAt is string;
      }

      // Lectura solo para el dueño.
      allow get, list: if isOwnerExisting();

      // Creación: el userId propuesto debe ser el del usuario autenticado.
      allow create: if isOwnerIncoming() && hasValidShape(request.resource.data);

      // Update: solo el dueño, sin cambiar propietario ni fecha de creación.
      allow update: if isOwnerExisting()
        && request.resource.data.userId == resource.data.userId
        && request.resource.data.createdAt == resource.data.createdAt
        && hasValidShape(request.resource.data);

      // Delete: solo el dueño.
      allow delete: if isOwnerExisting();
    }
  }
}
```

### 6. Crea el índice compuesto

En **Firestore Database → Índices → Crear índice**, elige **Índice estructurado** y completa:

| Colección | Campo 1 | Campo 2 | Alcance |
|---|---|---|---|
| `tasks` | `userId` — Ascendente | `createdAt` — Descendente | Colección |

Espera a que el estado pase de **Compilando** a **Enabled**. El repositorio incluye el mismo índice en `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

No hacen falta otros índices compuestos. Firestore agrega `__name__` automáticamente.

### 7. Modelo de datos

- Cada tarea se guarda en `tasks/{taskId}` con `userId`, `title`, `description`, `priority`, `dueDate`, `completed`, `repeatMonthly` y `createdAt`.
- La consulta usa `where('userId', '==', uid)` y `orderBy('createdAt', 'desc')`.
- La mascota guarda sus preferencias en `users/{uid}/mascot/settings` y el historial en `users/{uid}/mascotMessages/{messageId}`.
- El perfil y avatar se guardan en Cloud Firestore en `users/{uid}`. Toda la persistencia de datos (tareas, perfil, avatar y mascota) reside 100% en la nube.
- La autenticación utiliza persistencia de sesión (`browserSessionPersistence`), evitando tokens eternos o desprotegidos en `localStorage`.

### 8. Sobre la API key de Firebase

La `apiKey` web de Firebase es pública por diseño: viaja en el bundle del navegador y no es un secreto. La seguridad real está en las reglas de Firestore y en las reglas de Authentication. Nunca pongas claves de AWS o de Gemini con prefijo `VITE_`.

> El repo incluye `firebase.json`, `firestore.rules`, `firestore.indexes.json` y `.firebaserc`. Si usas la CLI de Firebase, cambia el project ID de `.firebaserc` por el tuyo antes de desplegar.

</details>

<details>
<summary>🐾 Mi mascota y Gemini</summary>

La mascota se personaliza en `/perfil` y el chat flotante aparece en `/tareas`. Las preferencias se guardan en `users/{uid}/mascot/settings` y el historial en `users/{uid}/mascotMessages/{messageId}`. Las reglas de Firestore ya cubren ambas rutas.

### Variables del servidor

```env
GEMINI_API_KEY=tu_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
FIREBASE_API_KEY=tu_api_key_web_de_firebase
```

- `GEMINI_API_KEY` se obtiene en Google AI Studio. No lleva prefijo `VITE_` porque es un secreto de servidor.
- `GEMINI_MODEL` es opcional. El valor por defecto es `gemini-3.5-flash-lite`. El servidor verifica que el modelo exista y admita `generateContent`; si no está disponible, elige un modelo Flash disponible.
- `FIREBASE_API_KEY` es la misma API key web de Firebase. Se usa en el servidor para verificar el ID token del usuario antes de llamar a Gemini. Si no la defines, se usa `VITE_FIREBASE_API_KEY`.
- `GOOGLE_GENERATIVE_AI_API_KEY` funciona como alias de `GEMINI_API_KEY`.
- Carga estas variables en Vercel para **Production** y **Development**.

### Límites y seguridad

- El navegador nunca recibe `GEMINI_API_KEY`.
- `/api/mascot` valida el método, el mensaje, el historial, las tareas y la configuración.
- La mascota solo da recomendaciones: no puede crear, editar, completar, mover ni eliminar tareas.
- Envía como máximo 20 mensajes de historial y 30 tareas al modelo.
- La respuesta se limita a 30 palabras.
- `temperature` se limita a 0–1 y `maxTokens` a 128–1024.
- La app lee hasta 80 mensajes del historial guardado.
- El endpoint verifica el ID token de Firebase con Identity Toolkit.

### Probar en local

```bash
vercel link
vercel pull
npm run dev:vercel
```

Abre `/perfil`, personaliza la mascota y guarda. Luego abre `/tareas` y usa el chat. `npm run dev` no expone `/api/mascot`.

</details>

<details>
<summary>☁️ Amazon SES (resumen de tareas y contacto)</summary>

KeepUp utiliza Amazon SES para dos funcionalidades mediante funciones serverless en Vercel (el navegador nunca recibe las claves de AWS):

1. **Envío del resumen de tareas (`POST /api/send-summary`):** Desde la cabecera de `/tareas`, el botón **"✉ Enviar resumen"** permite enviar al correo del usuario (o al destinatario indicado) un reporte completo en HTML y texto plano con el progreso, tareas pendientes agrupadas por prioridad y tareas completadas.
2. **Formulario de contacto (`POST /api/send-email`):** En `/contacto`, permite a cualquier visitante enviar consultas o sugerencias directamente al equipo de KeepUp.

### 1. Crea el usuario IAM

1. En la consola de AWS, ve a **IAM → Users → Create user**.
2. Nombre sugerido: `keepup-ses-sender`.
3. Elige **No, I'll set up custom permissions**.
4. En **Security credentials → Create access key**, selecciona **Application running outside AWS**.
5. Copia el **Access key ID** y el **Secret access key**. El secreto no se vuelve a mostrar.

### 2. Verifica el correo remitente en SES

1. Elige una región, por ejemplo `us-east-2`, y usa la misma en todas las variables.
2. Ve a **SES → Identities → Create identity → Email address**.
3. Escribe el correo desde el que quieres enviar y confirma el enlace que llega por email.
4. La identidad debe quedar en estado **Verified**.

### 3. Da permiso para enviar

En **IAM → Users → tu usuario → Add permissions → Create policy**, usa la pestaña **JSON**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ses:SendEmail",
      "Resource": "*"
    }
  ]
}
```

Nombra la policy `ses-send-email`, créala y adjúntala al usuario. Para mínimo privilegio, reemplaza `"*"` por el ARN de tu identidad de SES.

### 4. Carga las variables

```env
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
SES_FROM_EMAIL=tu_correo_verificado@gmail.com
```

- Carga estas variables en **Vercel → Settings → Environment Variables** para **Production** y **Development**. Marca **Preview** si también quieres probar ahí.
- No llevan prefijo `VITE_`: son secretos y no deben llegar al navegador.
- El destinatario es fijo: `megaguillermo@gmail.com`. No se configura desde el formulario ni desde una variable de entorno.

### 5. Prueba el envío

```bash
vercel link
vercel pull
npm run dev:vercel
```

Abre `/contacto`, completa el formulario y envía. `npm run dev` no ejecuta la función: solo levanta Vite.

### 6. Si el correo no llega

- En el **sandbox de SES**, el destinatario fijo `megaguillermo@gmail.com` también debe estar verificado.
- Un remitente `@gmail.com` puede caer en Spam. Para producción, usa un dominio propio con SPF, DKIM y DMARC.
- Revisa los logs de `/api/send-email` en Vercel y el estado de la identidad en SES para ver si el correo se entregó, rebotó o rechazó.

</details>

<details>
<summary>📦 Versiones usadas</summary>

### Frontend

| Tecnología | Para qué se usa | Versión |
|---|---|---|
| React + React DOM | Interfaz y render en el navegador | 19.3.1 |
| TypeScript | Tipado estático y compilación | 6.0.3 |
| Vite | Servidor de desarrollo y build | 8.3.4 |
| React Router DOM | Rutas públicas y privadas | 7.18.4 |
| React Toastify | Notificaciones de éxito y error | 11.1.0 |
| vgpu + @vgpu/wgsl | Fondo animado WebGPU | 0.6.0 |

### Backend y servicios

| Tecnología | Para qué se usa | Versión |
|---|---|---|
| Firebase | Authentication y Cloud Firestore | 13.0.0 |
| Gemini API | Chat de la mascota | `gemini-3.5-flash-lite` (configurable) |
| @aws-sdk/client-ses | Envío de correos del formulario | 3.1161.0 |
| Vercel CLI | `dev:vercel` y despliegue | 65.9.0 |
| @vercel/node | Tipos de las funciones serverless | 29.0.1 |

### Herramientas

| Tecnología | Para qué se usa | Versión |
|---|---|---|
| Node.js | Runtime del proyecto | 24.12.0 (probado) |
| npm | Instalación de dependencias | 10.9.2 |
| ESLint | Análisis estático | 10.12.0 |
| typescript-eslint | Reglas de ESLint para TypeScript | 8.71.2 |
| Vitest | Pruebas (configurado, sin tests todavía) | 5.0.4 |
| Git | Control de versiones | 2.55.0 |

> Las versiones son las instaladas por `npm install`; los rangos declarados están en `package.json`. La instalación limpia con `npm ci` y `npm run build` se probó con Node 24.12.0. El build emite una advertencia de tamaño de chunk mayor a 500 kB; no impide compilar.

</details>

<details>
<summary>🗂️ Estructura del proyecto</summary>

```txt
KeepUp/
├─ api/
│  ├─ mascot.ts              Función serverless del chat con Gemini
│  ├─ send-email.ts          Función serverless del formulario de contacto con SES
│  └─ send-summary.ts        Función serverless de envío de resumen de tareas con SES
├─ public/
├─ src/
│  ├─ components/            Componentes reutilizables
│  ├─ contexts/              Sesión de Firebase (AuthProvider)
│  ├─ firebase/              Configuración de app, auth y Firestore
│  ├─ helpers/               Validaciones y mensajes de error
│  ├─ hooks/                 useTasks, useTaskFilters, useTheme, useAvatar...
│  ├─ pages/                 Landing, Contact, Login, Register, Tasks, Profile
│  ├─ routes/                Rutas de React Router
│  ├─ services/              Firestore, migración, avatar y mascota
│  ├─ types/                 Tipos TypeScript
│  ├─ utils/                 Fechas, orden e imágenes
│  ├─ App.tsx                Composición general
│  └─ main.tsx               Punto de entrada
├─ tests/                    Carpeta vacía; todavía no hay tests
├─ .env.example              Plantilla de variables de entorno
├─ .nvmrc                    Versión de Node recomendada
├─ firebase.json             Configuración de Firebase CLI
├─ firestore.indexes.json    Índice compuesto de Firestore
├─ firestore.rules           Reglas de seguridad
├─ package.json              Dependencias y scripts
└─ vite.config.ts            Configuración de Vite
```

</details>

---

Autor: **Guillermo Cely**

<!-- Agrega aquí tus enlaces de LinkedIn y portafolio cuando los tengas. -->
