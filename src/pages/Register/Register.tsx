import { useEffect, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import AuthCard from '../../components/AuthCard';
import { useAuth } from '../../contexts';
import { auth } from '../../firebase';
import { getAuthErrorMessage } from '../../helpers/errors';
import { validateEmail, validatePassword } from '../../helpers/validations';
import type { AuthFormErrors, AuthFormTouched, AuthFormValues } from '../../types/auth';

const INITIAL_VALUES: AuthFormValues = { email: '', password: '' };
const INITIAL_ERRORS: AuthFormErrors = { email: null, password: null };
const INITIAL_TOUCHED: AuthFormTouched = { email: false, password: false };

// Pantalla de registro de una cuenta nueva.
export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [values, setValues] = useState<AuthFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<AuthFormErrors>(INITIAL_ERRORS);
  const [touched, setTouched] = useState<AuthFormTouched>(INITIAL_TOUCHED);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormInvalid = Boolean(
    validateEmail(values.email) || validatePassword(values.password),
  );

  // Al registrarse, la sesión se inicia y se entra directo al perfil.
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/perfil', { replace: true });
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
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      setValues(INITIAL_VALUES);
      setTouched(INITIAL_TOUCHED);
      setErrors(INITIAL_ERRORS);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard title="Crear cuenta">
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <div className="auth__field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
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
          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {touched.password && errors.password && (
            <span className="auth__error">{errors.password}</span>
          )}
        </div>

        {formError && <p className="auth__error auth__error--form">{formError}</p>}

        <div className="auth__actions">
          <button className="button primary" type="submit" disabled={isFormInvalid || isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrarme'}
          </button>
        </div>
      </form>

      <p className="auth__footer">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </AuthCard>
  );
}
