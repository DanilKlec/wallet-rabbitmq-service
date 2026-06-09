import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { register } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <AuthForm
        title="Create account"
        submitLabel="Register"
        loadingLabel="Creating..."
        altText="Already have an account?"
        altLink={{ to: '/login', label: 'Sign in' }}
        onSubmit={async (email, password) => {
          const data = await register(email, password);
          setAuth(data.token, data.user);
          navigate('/dashboard');
        }}
      />
    </div>
  );
}
