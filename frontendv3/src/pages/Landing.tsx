import PixelBlast from "@/components/react-bits/pixel-blast";
import { ArrowRight, CheckCircle2, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function Landing() {
  return (
    <div className="relative min-h-screen z-[1]">
      <div className="absolute inset-0 -z-[1]">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>
      {/* Hero Section with DotGrid Background */}
      <section className="relative w-full h-screen mx-auto px-6 pt-20 pb-32 z-[1]">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/50 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Compliance</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              Compliance Made
              <br />
              <span className="text-primary">Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automate compliance checks, analyze submissions, and ensure brand
              consistency with our intelligent compliance bot.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link to="/login">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/demo">View Demo</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
            <div className="space-y-1">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">10x</div>
              <div className="text-sm text-muted-foreground">
                Faster Reviews
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Automated Checks</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically analyze submissions against your brand
                  guidelines and compliance rules.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Real-time Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant feedback on compliance violations with detailed
                  reports and suggestions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Custom Rules</h3>
                <p className="text-sm text-muted-foreground">
                  Define your own compliance rules and brand guidelines for
                  tailored analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 pb-32">
        <Card className="border-2">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join teams using Compliance Bot to streamline their compliance
              workflows and maintain brand consistency.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild>
                <Link to="/login">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
