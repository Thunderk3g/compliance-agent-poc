import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, FileCheck, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-[60px] border-b border-zinc-800 flex items-center justify-between px-6 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-bold text-sm">▲</span>
          </div>
          <span className="text-lg font-semibold">Compliance Agent</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/onboarding">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl font-bold mb-6 text-white">
              Adaptive Compliance Engine
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
              Automate compliance checks with AI-powered analysis. Ensure your content meets IRDAI, brand, and SEO guidelines instantly.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/onboarding">
                <Button size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">IRDAI Compliance</h3>
              <p className="text-sm text-zinc-400">
                Automatically verify content against IRDAI regulations and guidelines.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Brand Guidelines</h3>
              <p className="text-sm text-zinc-400">
                Ensure consistency with your brand voice, tone, and visual identity.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">SEO Optimization</h3>
              <p className="text-sm text-zinc-400">
                Optimize content for search engines while maintaining compliance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
              <p className="text-sm text-zinc-400">
                Get instant feedback and suggestions as you create content.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-12"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg text-zinc-400 mb-8">
              Join teams who trust Compliance Agent to streamline their compliance workflow.
            </p>
            <Link to="/onboarding">
              <Button size="lg" className="gap-2">
                Start Your Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            © 2024 Compliance Agent. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
