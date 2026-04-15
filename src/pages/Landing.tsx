import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Milk, Users, FileText, MessageCircle, Clock, Shield, Brain, TrendingUp } from 'lucide-react';

const features = [
  { icon: Users, title: 'Manage Customers', desc: 'Track village suppliers and city buyers separately with individual profiles.' },
  { icon: Milk, title: 'Daily Milk Records', desc: 'Log daily milk quantities in liters for every customer with automatic totals.' },
  { icon: FileText, title: 'Auto Bill Calculation', desc: 'Bills are calculated automatically based on rate per liter and quantities.' },
  { icon: MessageCircle, title: 'WhatsApp Receipts', desc: 'Send detailed receipts directly to customers via WhatsApp with one tap.' },
  { icon: Clock, title: 'Monthly Auto Receipts', desc: 'Set receipts to auto-send at the end of every month — no manual work needed.' },
  { icon: Brain, title: 'AI Supply Forecasting', desc: 'Predict how much milk village suppliers will provide based on historical trends.' },
  { icon: TrendingUp, title: 'AI Demand Prediction', desc: 'Forecast city buyer demand during festivals, seasons, and wedding periods.' },
  { icon: Shield, title: 'Secure & Cloud Synced', desc: 'Your data is safe in the cloud with login-protected access across all devices.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Milk className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DudhBook</span>
          </div>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="outline">Login</Button></Link>
            <Link to="/signup"><Button>Sign Up Free</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Brain className="h-4 w-4" /> AI-Powered Milk Business Management
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Milk Business<span className="block text-primary">Made Intelligent</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Track daily milk purchases and sales, manage village suppliers & city buyers,
            auto-calculate bills, send WhatsApp receipts, and get AI-powered demand & supply predictions — all in one place.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="gap-2 text-base"><Milk className="h-5 w-5" /> Get Started — It's Free</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground">Everything a Milkman Needs</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm">
                <f.icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-1 text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Ready to simplify your milk business?</h2>
        <Link to="/signup"><Button size="lg">Create Your Free Account</Button></Link>
      </section>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} DudhBook — AI-Powered Milk Management for Pakistan 🇵🇰
      </footer>
    </div>
  );
}
