# KeepUp

KeepUp es una app de tareas personales con autenticación, perfil con avatar, prioridades, fechas límite y tareas mensuales recurrentes. Cada usuario ve y modifica únicamente sus propias tareas, guardadas en Cloud Firestore. También incluye una mascota personalizable con chat de Gemini y un formulario de contacto que envía correos con Amazon SES.

**Tecnologías**

- React 19 + TypeScript + Vite
- Firebase Authentication (correo/contraseña y Google)
- Cloud Firestore
- React Router
- React Toastify
- Google Gemini (chat de la mascota)
- AWS IAM + Amazon SES (formulario de contacto)
- Vercel (serverless functions)
- vgpu / WebGPU (fondo animado)
- VS Code, Git, npm, OpenCode y Firebase Console

<details>
<summary>✅ Requisitos previos</summary>

| Herramienta | Versión | Enlace |
|---|---|---|
| Node.js | 24.12 o superior (recomendado) | https://nodejs.org |
| npm | 10 o superior (viene con Node.js) | — |
| Git | Última versión | https://git-scm.com/downloads |
| Visual Studio Code (opcional) | Última versión | https://code.visualstudio.com |
| Cuenta de Google / Firebase | — | https://console.firebase.google.com |
| Cuenta de AWS | — | https://aws.amazon.com |

> Firebase 13 requiere Node `>=24.12.0`; Vite 8 acepta `^20.19.0 || >=22.12.0`. Node 22.14 funciona, pero `npm install` muestra warnings. Para una instalación limpia usá Node 24.12+.

</details>

<details>
<summary>🚀 Instalación y ejecución</summary>

1. Clonar el repositorio:

```bash
git clone https://github.com/guillermocely/proyectoM4_GuillermoCely.git
cd proyectoM4_GuillermoCely
```

2. Instalar todas las dependencias:

```bash
npm install
```

3. Dependencias principales (ya vienen en `package.json`; solo si las necesitás por separado):

```bash
npm install firebase
npm install react-toastify
```

- `firebase`: autenticación y base de datos Firestore.
- `react-toastify`: notificaciones de éxito y error (por ejemplo, inicio de sesión con Google o importación de tareas).

4. Dependencias de AWS y Vercel (para el formulario de contacto):

```bash
npm install @aws-sdk/client-ses
npm install -D @vercel/node
npm install -g vercel
```

- `@aws-sdk/client-ses`: envía el correo desde la función serverless.
- `@vercel/node`: tipos para la función de Vercel.
- `vercel`: CLI para probar la función en local y desplegar.

5. Crear el archivo de variables de entorno:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Completá las variables de Firebase y de AWS (ver secciones siguientes). El archivo `.env` está en `.gitignore` y no se sube al repositorio.

6. Ejecutar la app:

```bash
npm run dev
```

Abrí **http://localhost:5173**.

Para probar también el formulario de contacto y la función de AWS:

```bash
npm run dev:vercel
```

> `npm run dev` solo levanta Vite. La ruta `/api/send-email` no existe ahí; usá `npm run dev:vercel` o un deploy en Vercel.

7. Opcional, para comprobar la versión de producción:

```bash
npm run lint
npm run build
npm run preview
```

</details>

<details>
<summary>📦 Versiones usadas</summary>

| Paquete | Versión instalada | Declarada en `package.json` |
|---|---|---|
| React | 19.3.1 | `^19.2.8` |
| React DOM | 19.3.1 | `^19.2.8` |
| Vite | 8.3.4 | `^8.3.0` |
| TypeScript | 6.0.3 | `~6.0.2` |
| Firebase | 13.0.0 | `^13.0.0` |
| React Router DOM | 7.18.4 | `^7.18.4` |
| React Toastify | 11.1.0 | `^11.1.0` |
| AWS SDK para SES | 3.1161.0 | `^3.1161.0` |
| `@vercel/node` | 29.0.1 | `^29.0.1` (dev) |
| Node.js | 22.14.0 (probado) | Firebase 13 exige `>=24.12.0`; Vite 8 acepta `^20.19.0` o `>=22.12.0` |
| npm | 10.9.2 | — |

> `package.json` no define `engines`. Para evitar warnings de Firebase, usá Node 24.12+. Las versiones instaladas son las que resuelve `npm install` con los rangos declarados.

</details>

<details>
<summary>🔥 Configurar Firebase (paso a paso)</summary>

1. Crear el proyecto:

- Entrá a https://console.firebase.google.com
- **Agregar proyecto** → escribí un nombre → **Crear proyecto**.

2. Registrar la app web:

- **Project settings → General → Your apps**.
- Clic en el ícono **`</>`** → nombre de la app → **Register app**.
- Copiá los valores de `firebaseConfig` al archivo `.env`:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

El código lee estas variables con `import.meta.env.VITE_...`; por ejemplo, `import.meta.env.VITE_FIREBASE_API_KEY`.

3. Activar los métodos de ingreso:

- **Build → Authentication → Get started**.
- **Sign-in method → Email/Password → Enable → Save**.
- **Sign-in method → Google → Enable** → elegí el correo de soporte → **Save**.
- **Authentication → Settings → Authorized domains**: agregá tu dominio de despliegue. `localhost` ya está autorizado.

4. Crear Cloud Firestore:

- **Build → Firestore Database → Create database**.
- Elegí **Production mode** (no Test mode).
- Elegí la ubicación. **No se puede cambiar después.**

5. Pegar las reglas de seguridad:

- **Firestore Database → Rules**.
- Borrá todo y pegá el contenido de `firestore.rules` (también está acá abajo).
- Clic en **Publish**.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deniega todo por defecto.
    match /{document=**} {
      allow read, write: if false;
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

6. Crear el índice compuesto:

- **Firestore Database → Índices → Crear índice**.
- Elegí **índice estructurado**.
- Completá:

| Colección | Campo 1 | Campo 2 | Alcance |
|---|---|---|---|
| `tasks` | `userId` — Ascendente | `createdAt` — Descendente | Colección |

- Clic en **Crear** y esperá a que pase de **Compilando** a **Enabled**.

> No hacen falta otros índices compuestos. Firestore agrega `__name__` automáticamente.

7. Estructura de datos:

- Cada tarea se guarda en `tasks/{taskId}`.
- Campos: `userId`, `title`, `description`, `priority`, `dueDate`, `completed`, `repeatMonthly` y `createdAt`.
- La consulta usa `where('userId', '==', uid)` y `orderBy('createdAt', 'desc')`.

> El repositorio incluye `firebase.json`, `firestore.rules` y `firestore.indexes.json`. Si vas a desplegar con la CLI, cambiá el project ID de `.firebaserc` por el tuyo.

</details>

<details>
<summary>Configurar Mi mascota y Gemini</summary>

La personalización de la mascota está en `/perfil`, como una sección adicional que no modifica los datos de la cuenta. El chat flotante aparece en `/tareas`.

1. Publicar las reglas de Firestore:

- Copiá el contenido actualizado de `firestore.rules` en **Firestore Database → Rules**.
- Las preferencias se guardan en `users/{uid}/mascot/settings` y el historial en `users/{uid}/mascotMessages/{messageId}`.
- Solo el usuario dueño puede leer y escribir sus propios documentos.

2. Configurar las variables del servidor:

```env
GEMINI_API_KEY=tu_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
FIREBASE_API_KEY=tu_api_key_web_de_firebase
```

- `GEMINI_API_KEY` se obtiene en [Google AI Studio](https://aistudio.google.com/app/apikey) y nunca debe llevar el prefijo `VITE_`.
- `GEMINI_MODEL` es opcional. El servidor consulta los modelos disponibles y usa el indicado si admite `generateContent`; si no, elige un modelo Flash disponible.
- `FIREBASE_API_KEY` es la misma API key web de Firebase. Se usa solo en el servidor para verificar el ID token del usuario antes de llamar a Gemini.
- Cargalas en **Vercel → Settings → Environment Variables** para **Production** y **Development**.

3. Probar en local:

```bash
vercel link
npm run dev:vercel
```

- `npm run dev` solo ejecuta Vite y no expone `/api/mascot`.
- Abrí `/perfil`, personalizá la mascota y guardá.
- Abrí `/tareas`, tocá la mascota y enviá una pregunta.

4. Seguridad y comportamiento:

- El navegador nunca recibe `GEMINI_API_KEY`.
- `api/mascot.ts` valida el método, el tamaño de los mensajes, la temperatura y el límite de tokens.
- Antes de generar la respuesta verifica el ID token de Firebase con Identity Toolkit.
- El modelo se valida contra la lista de modelos disponibles de Gemini.
- Las respuestas son completas, en español rioplatense y de un máximo de 30 palabras.
- El historial y las preferencias son privados por usuario mediante las reglas de Firestore.

</details>

<details>
<summary>☁️ Configurar Amazon SES (formulario de contacto)</summary>

El formulario de `/contacto` llama a `POST /api/send-email`. Esa función de Vercel usa Amazon SES; el navegador nunca recibe las claves de AWS.

1. Crear el usuario IAM:

- En la consola de AWS, buscá **IAM → Users → Create user**.
- Nombre sugerido: `keepup-ses-sender`.
- Dejá **No, I'll set up custom permissions**.
- En **Security credentials → Create access key**, elegí **Application running outside AWS**.
- Copiá el **Access key ID** y el **Secret access key** (no se vuelven a mostrar).

2. Verificar el correo remitente en SES:

- Elegí una región, por ejemplo **`us-east-2`**, y usá la misma en todas las variables.
- **SES → Identities → Create identity → Email address**.
- Escribí el correo desde el que querés enviar y confirmá el link que llega por email.
- La identidad debe quedar en estado **Verified**.

3. Dar permiso para enviar:

- **IAM → Users → tu usuario → Add permissions → Create policy**.
- Pestaña **JSON**:

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

- Nombre de la policy: `ses-send-email` → **Create policy**.
- Volvé al usuario → **Add permissions** → adjuntá `ses-send-email`.
- Para mínimo privilegio, reemplazá `"*"` por el ARN de tu identidad SES.

4. Cargar las variables:

```env
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
SES_FROM_EMAIL=tu_correo_verificado@gmail.com
SES_TO_EMAIL=destinatario@example.com
```

- Cargalas en **Vercel → Settings → Environment Variables** y marcalas para **Production** y **Development** (y Preview si querés).
- Para `vercel dev`, la función toma las variables del proyecto linkeado; el `.env` de Vite no se usa para la API.
- **No** llevan prefijo `VITE_`: son secretos y Vite no debe incluirlos en el bundle.
- El destinatario es fijo (`SES_TO_EMAIL`). El correo del formulario solo se usa como `Reply-To`.

5. Probar el envío:

```bash
vercel link
npm run dev:vercel
```

- `vercel link` vincula la carpeta con tu proyecto; `vercel dev` descarga las variables del entorno **Development**.
- Abrí `/contacto`, completá el formulario y enviá.
- Para producción, desplegá con `vercel --prod` y agregá las cinco variables en Vercel antes de redeployar.
- `npm run dev` no ejecuta la función: solo Vite.

6. Si el correo no llega:

- En **SES sandbox**, el destinatario también debe estar verificado en SES.
- Un remitente `@gmail.com` puede caer en Spam; para producción usá un dominio propio con SPF, DKIM y DMARC.
- Revisá **CloudWatch → Logs → `SES-RESPONSE`** para ver si SES entregó, rebotó o rechazó el mensaje.

</details>

<details>
<summary>🗂️ Estructura del proyecto</summary>

```txt
api/
├── send-email.ts  Función serverless que envía correos con SES
└── mascot.ts      Función serverless que valida la sesión y consulta Gemini

src/
├── components/   Componentes reutilizables (TaskCard, Navbar, Mascot...)
├── contexts/     Sesión de Firebase (AuthProvider)
├── firebase/     Configuración de app, auth y Firestore
├── helpers/      Validaciones y mensajes de error
├── hooks/        useTasks, useTaskFilters, useTheme, useAvatar, useMascotSettings
├── pages/        Landing, Contact, Login, Register, Tasks, Profile
├── routes/       Rutas de React Router
├── services/     Firestore, migración de tareas, avatar y mascota
├── types/        Tipos TypeScript
├── utils/        Fechas, orden e imágenes
├── App.tsx       Composición general
└── main.tsx      Punto de entrada
```

Archivos importantes en la raíz:

- `api/send-email.ts`: backend del formulario de contacto con AWS SES.
- `api/mascot.ts`: backend seguro del chat con Gemini.
- `firestore.rules`: reglas de seguridad.
- `firestore.indexes.json`: índice compuesto de Firestore.
- `firebase.json` y `.firebaserc`: configuración de Firebase CLI.
- `.env.example`: plantilla de variables de entorno de Firebase, AWS y Gemini.

</details>

---

Autor: **Guillermo Cely**
