import { Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { useTheme } from '../contexts/ThemeContext';

export default function ComponentsDemo() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
            <p className="text-muted-foreground mt-2">
              Clean, crisp, modern components with minimal rounding
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>

        <Separator />

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <Separator />

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  This card has no shadow by default. Hover over it to see a subtle shadow appear.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
                <CardDescription>With minimal rounding</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Notice the sharp, crisp edges with just 4px border radius.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clean Design</CardTitle>
                <CardDescription>Breathing space</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Components have room to breathe with generous padding.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Form Components Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Form Components</h2>
          <Card>
            <CardHeader>
              <CardTitle>Sample Form</CardTitle>
              <CardDescription>Form components with clean design</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Enter your message" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>

              <div className="flex gap-4">
                <Button>Submit</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Typography Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Typography</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <h2 className="text-3xl font-bold">Heading 2</h2>
              <h3 className="text-2xl font-semibold">Heading 3</h3>
              <h4 className="text-xl font-semibold">Heading 4</h4>
              <p className="text-base">
                This is body text. Clean, readable, and well-spaced.
              </p>
              <p className="text-sm text-muted-foreground">
                This is muted text for secondary information.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8">
          <p>Frontend V3 • Clean, Crisp, Modern Design</p>
        </div>
      </div>
    </div>
  );
}
