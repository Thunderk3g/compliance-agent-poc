import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Navbar */}
      <nav className="h-[60px] border-b border-zinc-800 flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-bold text-sm">▲</span>
          </div>
          <span className="text-lg font-semibold">Compliance Agent</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Docs
          </a>
          <Button variant="outline" size="sm">
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Adaptive Compliance Engine
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Ensure your marketing materials comply with IRDAI regulations, brand guidelines, and SEO best practices using AI-powered analysis.
          </p>
          <Link to="/login">
            <Button size="lg" className="group">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
        >
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-zinc-400 text-sm">
              Advanced AI models analyze your content against regulatory requirements and brand guidelines in seconds.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">IRDAI Compliance</h3>
            <p className="text-zinc-400 text-sm">
              Stay compliant with insurance regulatory requirements. Automatic detection of violations and suggested fixes.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-zinc-400 text-sm">
              Track compliance scores, violations, and trends with comprehensive dashboards and reports.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
