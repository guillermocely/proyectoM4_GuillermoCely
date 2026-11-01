import ContactForm from '../../components/ContactForm';
import './Contact.css';

// Página pública de contacto: el correo se envía con Amazon SES desde /api/send-email.
export default function Contact() {
  return (
    <main className="contact">
      <section className="contact__card">
        <h1>Contacto</h1>
        <p>
          ¿Tenés una consulta, una sugerencia o encontraste un problema? Escribinos
          y te respondemos por correo.
        </p>
        <ContactForm />
      </section>
    </main>
  );
}
