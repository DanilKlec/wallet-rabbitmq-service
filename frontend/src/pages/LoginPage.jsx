import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { login } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <AuthForm
        title="Sign in"
        submitLabel="Sign in"
        loadingLabel="Signing in..."
        altText="No account?"
        altLink={{ to: '/register', label: 'Register' }}
        onSubmit={async (email, password) => {
          const data = await login(email, password);
          setAuth(data.token, data.user);
          navigate('/dashboard');
        }}
      />
    </div>
  );
}
