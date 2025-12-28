import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Placeholder logic - accept any credentials
    // Generate a simple userId and store in localStorage
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    localStorage.setItem('userId', userId);
    localStorage.setItem('userEmail', email);

    setIsLoading(false);
    navigate('/projects');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      {/* Simple Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-[60px] border-b border-zinc-800 flex items-center px-6 bg-black z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-bold text-sm">▲</span>
          </div>
          <span className="text-lg font-semibold">Compliance Agent</span>
        </div>
      </nav>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-zinc-400">Sign in to your compliance workspace</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              size="lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              Demo mode - enter any credentials to continue
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400">
            Don't have an account?{' '}
            <a href="#" className="text-blue-500 hover:underline">
              Contact admin
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
