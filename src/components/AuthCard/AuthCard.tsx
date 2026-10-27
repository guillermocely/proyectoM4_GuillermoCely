import type { AuthCardProps } from './AuthCard.types';
import './AuthCard.css';

// Contenedor visual compartido por las pantallas de autenticación.
export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <main className="auth">
      <section className="auth__card">
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}
