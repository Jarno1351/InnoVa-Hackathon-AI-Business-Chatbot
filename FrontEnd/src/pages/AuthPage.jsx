import { useEffect, useState } from 'react';
import { loginUser, registerBusiness } from '../services/authService.js';

const slides = [
  {
    badge: 'LOCAL TRADE',
    title: 'Want to look for products and services that are available locally?',
    text: "Nel-Jay Bot is here to help. Ask about the product or service you're looking for and we will find nearby shops and their available inventory.",
    color: '#8B5CF6'
  },
  {
    badge: 'GUARANTEED LOCAL FIRST',
    title: 'Having trouble finding what you need?',
    text: 'Ask anything and Nel-Jay will search local matches first. The platform prioritizes local shops and services to support your community.',
    color: '#34d399'
  },
  {
    badge: 'EASY AND ACCESSIBLE',
    title: 'A sleek interface for effortless local commerce exploration',
    text: 'Nel-Jay keeps discovery simple, helping users connect with nearby businesses faster.',
    color: '#fbbf24'
  }
];

export default function AuthPage({ onAuthenticated }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    category: ''
  });

  useEffect(() => {
    const interval = setInterval(() => setActiveSlide((prev) => (prev + 1) % slides.length), 4200);
    return () => clearInterval(interval);
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await loginUser(loginForm);
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Password doesn't match. Verify inputs.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await registerBusiness({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        companyName: registerForm.companyName,
        category: registerForm.category
      });
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  }

  const slide = slides[activeSlide];

  return (
    <main className="auth-screen">
      <div className="auth-card">
        <section className="auth-carousel">
          <div className="auth-brand">
            <div className="auth-logo">
              <img src="../../public/logo.png" alt="" />
                          <span>Nel-Jay</span>

            </div>
          </div>

          <div className="auth-slide">
            <div className="auth-badge" style={{ color: slide.color, borderColor: `${slide.color}55`, backgroundColor: `${slide.color}18` }}>{slide.badge}</div>
            <h2>{slide.title}</h2>
            <p>{slide.text}</p>
          </div>

          <div className="auth-dots">
            {slides.map((item, index) => (
              <button key={item.badge} type="button" className={index === activeSlide ? 'active' : ''} onClick={() => setActiveSlide(index)} aria-label={`Show slide ${index + 1}`}></button>
            ))}
          </div>
        </section>

        <section className="auth-form-panel">
          {!isRegistering ? (
            <div className="auth-form-block">
              <div>
                <h1>LOGIN</h1>
                <p>Login to NEL-JAY for better access</p>
              </div>

              <form onSubmit={handleLogin} className="auth-form">
                <label>Email</label>
                <input required type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} placeholder="name@domain.com" />

                <label>Password</label>
                <input required type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} placeholder="••••••••" />

                {error && <p className="auth-error">{error}</p>}

                <button className="auth-submit" disabled={isLoading} type="submit">{isLoading ? 'Logging in...' : 'LOGIN'}</button>
              </form>

              <p className="auth-switch">Don't have an account? <button type="button" onClick={() => { setError(''); setIsRegistering(true); }}>Create Account</button></p>
            </div>
          ) : (
            <div className="auth-form-block">
              <div>
                <h1>Create an Account</h1>
                <p>Manage and secure your businesses</p>
              </div>

              <form onSubmit={handleRegister} className="auth-form">
                <label>Owner Name</label>
                <input required value={registerForm.name} onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })} placeholder="Merchant name" />

                <label>Contact Email</label>
                <input required type="email" value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} placeholder="corp@domain.com" />

                <div className="auth-grid">
                  <div>
                    <label>Company Name</label>
                    <input required value={registerForm.companyName} onChange={(event) => setRegisterForm({ ...registerForm, companyName: event.target.value })} placeholder="Nel-Jay Corp" />
                  </div>
                  <div>
                    <label>Category</label>
                    <input required value={registerForm.category} onChange={(event) => setRegisterForm({ ...registerForm, category: event.target.value })} placeholder="IT Supplies" />
                  </div>
                </div>

                <label>Password</label>
                <input required type="password" value={registerForm.password} onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })} placeholder="••••••••" />

                <label>Confirm Password</label>
                <input required type="password" value={registerForm.confirmPassword} onChange={(event) => setRegisterForm({ ...registerForm, confirmPassword: event.target.value })} placeholder="••••••••" />

                {error && <p className="auth-error">{error}</p>}

                <button className="auth-submit" disabled={isLoading} type="submit">{isLoading ? 'Registering...' : 'Register Account'}</button>
              </form>

              <p className="auth-switch">Already have an account? <button type="button" onClick={() => { setError(''); setIsRegistering(false); }}>Sign In</button></p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
