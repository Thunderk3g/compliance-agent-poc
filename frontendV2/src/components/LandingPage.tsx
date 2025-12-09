import { BlurText } from '@/components/react-bits/BlurText';
import LightPillar from '@/components/react-bits/LightPillar';
import { RevealOnScroll } from '@/components/react-bits/RevealOnScroll';
import { ShinyButton } from '@/components/react-bits/ShinyButton';
import { SpotlightCard } from '@/components/react-bits/SpotlightCard';
import { LucideArrowRight, LucideBrainCircuit, LucideCheckCircle, LucideLayoutDashboard, LucideScale, LucideShieldCheck, LucideWrench, LucideZap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();
  const onEnterApp = () => navigate('/tools');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden selection:bg-primary/20 transition-colors duration-300">
      
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="flex items-center gap-2 p-2 rounded-full border border-surface-200/50 dark:border-white/10 bg-white/80 dark:bg-[#0A0520]/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 max-w-4xl w-full justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 pl-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-bold text-xs">V</div>
                <span className="font-bold tracking-tight text-foreground">Vantage</span>
            </div>

            {/* Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <button onClick={() => scrollToSection('features')} className="hover:text-foreground transition-colors">Features</button>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-foreground transition-colors">How it Works</button>
                <button onClick={() => scrollToSection('tech-specs')} className="hover:text-foreground transition-colors">Technology</button>
                <button onClick={() => navigate('/tools')} className="flex items-center gap-1 text-primary hover:text-primary-hover transition-colors font-semibold">
                    <LucideWrench className="w-3 h-3" /> Tools
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pr-2">

                <ShinyButton onClick={onEnterApp} className="px-5 py-2 text-xs font-semibold !rounded-full" variant="primary">
                Get Started
                </ShinyButton>
            </div>
        </nav>
      </div>

      <section className="relative pt-48 pb-20 lg:pt-64 lg:pb-32 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center bg-transparent">
        {/* Three.js Light Pillar Background - Rich Dark Gradient for Dark Mode, Light Gradient for Light Mode */}
        {/* Fixed: Default is Light (Indigo-50), 'dark:' is Dark (Slate-950) */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-[#020617] dark:via-[#050510] dark:to-[#0B0F1A]">
             <LightPillar 
                interactive={false} 
                topColor="#5227ff" 
                bottomColor="#ff9ffc"
                intensity={1}
                rotationSpeed={0.3}
                glowAmount={0.002}
                pillarRotation={25}
                pillarWidth={4.6}
            />
        </div>
        
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md border border-surface-200 dark:border-slate-800 text-xs font-medium text-primary mb-4 animate-fade-in-up pointer-events-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New: Deep Analysis Mode & Rule Generation
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-foreground leading-[1] pointer-events-auto">
            <BlurText text="Compliance intelligence" delay={0.2} animateBy="words" className="text-foreground inline-block" />
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                <BlurText text="Refined." delay={0.6} animateBy="words" className="inline-block" />
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up pointer-events-auto" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            Automate IRDAI, Brand, and SEO compliance checks with our AI-powered platform. 
          </p>

          <div className="flex items-center justify-center gap-4 pt-8 opacity-0 animate-fade-in-up pointer-events-auto" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
            <ShinyButton onClick={onEnterApp} className="group text-lg px-8 py-4">
              Start Free Audit
              <LucideArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </ShinyButton>
            <ShinyButton variant="outline" onClick={() => scrollToSection('features')} className="text-lg px-8 py-4 backdrop-blur-sm bg-white/10 border-foreground/10 text-foreground hover:bg-white/20">
              View Features
            </ShinyButton>
          </div>
        </div>
      </section>

      {/* Features Section with Spotlight Cards */}
      <section id="features" className="py-32 bg-gradient-to-b from-white via-indigo-50/50 to-white dark:from-[#0B0F1A] dark:via-[#050510] dark:to-[#020617] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">Comprehensive Compliance Tools</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to audit, analyze, and approve documents with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RevealOnScroll className="h-full">
            <SpotlightCard className="bg-white border-surface-200 dark:bg-card dark:border-white/10 shadow-sm hover:shadow-md h-full">
              <FeatureContent 
                icon={LucideScale} 
                title="Automated Rule Matching" 
                description="Our AI engine creates dynamic checklists from your guidelines (IRDAI, Brand) and scores every submission automatically." 
              />
            </SpotlightCard>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1} className="h-full">
            <SpotlightCard className="bg-white border-surface-200 dark:bg-card dark:border-white/10 shadow-sm hover:shadow-md h-full">
              <FeatureContent 
                icon={LucideZap} 
                title="Deep Analysis Mode" 
                description="Go beyond surface checks. Our Deep Analysis performs line-by-line scrutiny to catch even the most subtle compliance violations." 
              />
            </SpotlightCard>
            </RevealOnScroll>
            <RevealOnScroll delay={0.2} className="h-full">
            <SpotlightCard className="bg-white border-surface-200 dark:bg-card dark:border-white/10 shadow-sm hover:shadow-md h-full">
              <FeatureContent 
                icon={LucideLayoutDashboard} 
                title="Real-time Reporting" 
                description="Track compliance trends, identified risks, and team performance in a centralized, interactive dashboard." 
              />
            </SpotlightCard>
            </RevealOnScroll>
            <RevealOnScroll delay={0.3} className="h-full">
             <SpotlightCard className="bg-white border-surface-200 dark:bg-card dark:border-white/10 shadow-sm hover:shadow-md h-full">
              <FeatureContent 
                icon={LucideCheckCircle} 
                title="Auto-Fix Suggestions" 
                description="Don't just find errors—fix them. Get actionable, AI-generated suggestions to remediate violations instantly." 
              />
            </SpotlightCard>
            </RevealOnScroll>
            <RevealOnScroll delay={0.4} className="h-full">
             <SpotlightCard className="bg-white border-surface-200 dark:bg-card dark:border-white/10 shadow-sm hover:shadow-md h-full">
              <FeatureContent 
                icon={LucideShieldCheck} 
                title="Role-Based Security" 
                description="Secure your workflow with granular permissions for Agents, Reviewers, and Super Admins." 
              />
            </SpotlightCard>
            </RevealOnScroll>
            <RevealOnScroll delay={0.5} className="h-full">
             <SpotlightCard className="bg-white border-surface-200 dark:bg-card dark:border-white/10 shadow-sm hover:shadow-md h-full">
              <FeatureContent 
                icon={LucideBrainCircuit} 
                title="Adaptive Learning" 
                description="The system improves over time, learning from new rule sets and user feedback to increase accuracy." 
              />
            </SpotlightCard>
            </RevealOnScroll>
          </div>
        </div>
      </section>

       {/* Tech Specs Section */}
      <section id="tech-specs" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
           <div className="flex-1 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Powered by Advanced AI</h2>
              <p className="text-lg text-muted-foreground">
                Built on a robust stack featuring <strong>FastAPI, Ollama, and Qwen 2.5</strong>, Vantage delivers enterprise-grade performance.
              </p>
              <ul className="space-y-4">
                <TechItem label="Local LLM Inference for Data Privacy" />
                <TechItem label="Scalable Document Chunking & Processing" />
                <TechItem label="Real-time SSE Streaming for Analysis" />
                <TechItem label="Deterministic Scoring Algorithms" />
              </ul>
              <ShinyButton variant="secondary" onClick={onEnterApp} className="mt-4 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700">
                Explore the Tech
              </ShinyButton>
           </div>
           <div className="flex-1 w-full">
              <RevealOnScroll delay={0.2}>
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
                 <code className="text-sm font-mono text-slate-300 relative z-10 block space-y-2">
                   <div className="text-slate-500">{'// Compliance Analysis Pipeline'}</div>
                   <div><span className="text-purple-400">await</span> complianceEngine.<span className="text-blue-400">analyze</span>(doc);</div>
                   <div><span className="text-purple-400">const</span> violations = <span className="text-purple-400">await</span> deepAnalysis.<span className="text-blue-400">scan</span>(</div>
                   <div className="pl-4"><span className="text-green-400">content</span>: chunks,</div>
                   <div className="pl-4"><span className="text-green-400">model</span>: <span className="text-yellow-300">"qwen2.5:7b"</span>,</div>
                   <div className="pl-4"><span className="text-green-400">rules</span>: activeRules</div>
                   <div>);</div>
                   <div className="text-slate-500 mt-4">{'// Result: 98% Compliance Score'}</div>
                 </code>
              </div>
              </RevealOnScroll>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
         
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
            <RevealOnScroll>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">Ready to elevate your compliance?</h2>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Join leading organizations that trust Vantage for their document compliance needs.
              Start your free trial today.
            </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
            <div className="flex items-center justify-center gap-4">
              <ShinyButton onClick={onEnterApp} variant="primary" className="text-lg px-8 py-4">
                Get Started Now
              </ShinyButton>
            </div>
            </RevealOnScroll>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-background text-muted-foreground py-12 border-t border-surface-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-bold text-xs">V</div>
                <span className="font-bold text-foreground">Vantage</span>
             </div>
             <p className="text-sm">
               Building the future of compliance intelligence.
             </p>
             <div className="mt-4 text-xs">
               © 2024 Vantage Compliance. All rights reserved.
             </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><button className="hover:text-primary">Features</button></li>
              <li><button className="hover:text-primary">Integrations</button></li>
              <li><button className="hover:text-primary">Enterprise</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><button className="hover:text-primary">About Us</button></li>
              <li><button className="hover:text-primary">Careers</button></li>
              <li><button className="hover:text-primary">Blog</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><button className="hover:text-primary">Privacy</button></li>
              <li><button className="hover:text-primary">Terms</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components

function FeatureContent({ icon: Icon, title, description }: any) {
  return (
    <div className="p-8 h-full flex flex-col">
       <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center text-primary mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed flex-1">
        {description}
      </p>
      <div className="mt-6 flex items-center text-sm font-medium text-primary cursor-pointer hover:underline">
        Learn more <LucideArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  )
}

function TechItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
        <LucideCheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
      </div>
      <span className="text-foreground font-medium">{label}</span>
    </div>
  )
}
