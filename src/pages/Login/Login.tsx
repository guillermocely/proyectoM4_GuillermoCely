import { useEffect, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import AuthCard from '../../components/AuthCard';
import { useAuth } from '../../contexts';
import { auth, googleProvider } from '../../firebase';
import { getAuthErrorMessage } from '../../helpers/errors';
import { validateEmail, validatePassword } from '../../helpers/validations';
import type { AuthFormErrors, AuthFormTouched, AuthFormValues } from '../../types/auth';

const INITIAL_VALUES: AuthFormValues = { email: '', password: '' };
const INITIAL_ERRORS: AuthFormErrors = { email: null, password: null };
const INITIAL_TOUCHED: AuthFormTouched = { email: false, password: false };

// Pantalla de inicio de sesión.
export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [values, setValues] = useState<AuthFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<AuthFormErrors>(INITIAL_ERRORS);
  const [touched, setTouched] = useState<AuthFormTouched>(INITIAL_TOUCHED);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isFormInvalid = Boolean(
    validateEmail(values.email) || validatePassword(values.password),
  );

  // Si la sesión ya está activa (o se activó), entra al gestor.
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/tareas', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name as keyof AuthFormValues;
    const value = event.target.value;

    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({
      ...current,
      [name]: name === 'email' ? validateEmail(value) : validatePassword(value),
    }));
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const name = event.target.name as keyof AuthFormTouched;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isFormInvalid) return;

    setFormError(null);
    setIsSubmitting(true);

    try {
      await login(values.email, values.password);
      setValues(INITIAL_VALUES);
      setTouched(INITIAL_TOUCHED);
      setErrors(INITIAL_ERRORS);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setFormError(null);
    setIsGoogleLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <AuthCard title="Iniciar sesión">
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <div className="auth__field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            placeholder="ejemplo@correo.com"
            autoComplete="email"
          />
          {touched.email && errors.email && (
            <span className="auth__error">{errors.email}</span>
          )}
        </div>

        <div className="auth__field">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {touched.password && errors.password && (
            <span className="auth__error">{errors.password}</span>
          )}
        </div>

        {formError && <p className="auth__error auth__error--form">{formError}</p>}

        <div className="auth__actions">
          <button
            className="button primary"
            type="submit"
            disabled={isFormInvalid || isSubmitting || isGoogleLoading}
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
          >
            {isGoogleLoading ? 'Cargando...' : 'Ingresar con Google'}
          </button>
        </div>
      </form>

      <p className="auth__footer">
        ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
      </p>
    </AuthCard>
  );
}
