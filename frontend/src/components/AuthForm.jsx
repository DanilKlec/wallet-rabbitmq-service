import { useState } from 'react';
import { Link } from 'react-router-dom';

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400';

export default function AuthForm({ title, submitLabel, loadingLabel, onSubmit, altLink, altText }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-lg font-semibold">{title}</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm">
          Email
          <input
            type="email"
            className={`mt-1 ${inputClass}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            className={`mt-1 ${inputClass}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 py-2 text-sm text-white disabled:opacity-60"
        >
          {loading ? loadingLabel : submitLabel}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        {altText}{' '}
        <Link to={altLink.to} className="font-medium text-slate-900">
          {altLink.label}
        </Link>
      </p>
    </div>
  );
}
