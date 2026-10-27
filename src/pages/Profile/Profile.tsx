import { useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from '../../components/UserAvatar';
import { useAuth } from '../../contexts';
import { useAvatar } from '../../hooks/useAvatar';
import './Profile.css';

const PROVIDER_LABELS: Record<string, string> = {
  password: 'Email y contraseña',
  'google.com': 'Google',
};

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// Perfil del usuario: datos de la cuenta, avatar y cierre de sesión.
export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { avatar, updateAvatar, resetAvatar } = useAvatar(user?.uid);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  if (!user) return null;

  const provider = user.providerData[0]?.providerId ?? 'password';
  const providerLabel = PROVIDER_LABELS[provider] ?? provider;

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    try {
      await updateAvatar(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la imagen.');
    }
  }

  async function handleLogout() {
    setIsLeaving(true);
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <main className="profile">
      <section className="profile__card">
        <header className="profile__header">
          <UserAvatar uid={user.uid} email={user.email} size="lg" />
          <div>
            <h1>{user.displayName || 'Mi perfil'}</h1>
            <p>{user.email}</p>
          </div>
        </header>

        <div className="profile__avatar-actions">
          <label className="button secondary profile__upload">
            Cambiar foto
            <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
          </label>
          {avatar && (
            <button className="button ghost" type="button" onClick={resetAvatar}>
              Quitar foto
            </button>
          )}
        </div>
        {error && <p className="profile__error">{error}</p>}

        <dl className="profile__data">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Método de acceso</dt>
            <dd>{providerLabel}</dd>
          </div>
          <div>
            <dt>Miembro desde</dt>
            <dd>{formatDate(user.metadata.creationTime)}</dd>
          </div>
          <div>
            <dt>ID de usuario</dt>
            <dd className="profile__uid">{user.uid}</dd>
          </div>
        </dl>

        <div className="profile__links">
          <Link className="button primary" to="/tareas">Ir a mis tareas</Link>
        </div>

        <footer className="profile__footer">
          <button
            className="button secondary profile__logout"
            type="button"
            onClick={handleLogout}
            disabled={isLeaving}
          >
            {isLeaving ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </footer>
      </section>
    </main>
  );
}
