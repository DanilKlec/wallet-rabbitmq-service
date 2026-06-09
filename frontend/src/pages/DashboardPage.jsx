import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  deposit,
  getTransactions,
  getWallet,
  transfer,
  withdraw,
} from '../api/client';

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [depositForm, setDepositForm] = useState({ amount: '', description: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', description: '' });
  const [transferForm, setTransferForm] = useState({ toUserId: '', amount: '', description: '' });

  const loadData = useCallback(async () => {
    const [walletData, txData] = await Promise.all([
      getWallet(),
      getTransactions({ page: 1, limit: 10, sort: 'desc' }),
    ]);
    setWallet(walletData);
    setTransactions(txData.items);
  }, []);

  useEffect(() => {
    loadData().catch((err) => setError(err.message));
  }, [loadData]);

  const run = async (fn, reset) => {
    setError('');
    setMessage('');
    try {
      await fn();
      setMessage('Done');
      reset();
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Wallet Service</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-sm text-slate-600 hover:text-slate-900">
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-8">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Balance</p>
          <p className="text-3xl font-semibold">${wallet?.balance ?? '—'}</p>
          <p className="mt-2 text-xs text-slate-400">Wallet: {wallet?.walletId}</p>
        </section>

        {(message || error) && (
          <p className={`text-sm ${error ? 'text-red-600' : 'text-emerald-600'}`}>
            {error || message}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <form
            className="rounded-xl border bg-white p-4 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              run(
                () => deposit(depositForm.amount, depositForm.description),
                () => setDepositForm({ amount: '', description: '' })
              );
            }}
          >
            <h2 className="mb-3 font-medium">Deposit</h2>
            <input
              className={inputClass}
              placeholder="Amount"
              value={depositForm.amount}
              onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
              required
            />
            <input
              className={`mt-2 ${inputClass}`}
              placeholder="Description"
              value={depositForm.description}
              onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })}
            />
            <button className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-sm text-white">
              Deposit
            </button>
          </form>

          <form
            className="rounded-xl border bg-white p-4 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              run(
                () => withdraw(withdrawForm.amount, withdrawForm.description),
                () => setWithdrawForm({ amount: '', description: '' })
              );
            }}
          >
            <h2 className="mb-3 font-medium">Withdraw</h2>
            <input
              className={inputClass}
              placeholder="Amount"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
              required
            />
            <input
              className={`mt-2 ${inputClass}`}
              placeholder="Description"
              value={withdrawForm.description}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, description: e.target.value })}
            />
            <button className="mt-3 w-full rounded-lg bg-amber-600 py-2 text-sm text-white">
              Withdraw
            </button>
          </form>

          <form
            className="rounded-xl border bg-white p-4 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              run(
                () =>
                  transfer(
                    transferForm.toUserId,
                    transferForm.amount,
                    transferForm.description
                  ),
                () => setTransferForm({ toUserId: '', amount: '', description: '' })
              );
            }}
          >
            <h2 className="mb-3 font-medium">Transfer</h2>
            <input
              className={inputClass}
              placeholder="Recipient User ID"
              value={transferForm.toUserId}
              onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}
              required
            />
            <input
              className={`mt-2 ${inputClass}`}
              placeholder="Amount"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              required
            />
            <button className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-sm text-white">
              Transfer
            </button>
          </form>
        </div>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-medium">Recent transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2">Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100">
                    <td className="py-2">{tx.type}</td>
                    <td>{tx.amount}</td>
                    <td>{tx.description || '—'}</td>
                    <td className="text-slate-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
