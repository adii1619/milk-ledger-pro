import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Milk, User, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AppRole } from '@/hooks/useUserRole';

const roles: { value: AppRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'user', label: 'User', icon: <User className="h-6 w-6" />, desc: 'Buy or sell milk' },
  { value: 'milkman', label: 'Milkman', icon: <Milk className="h-6 w-6" />, desc: 'Manage daily milk business' },
  { value: 'dairy_shop_owner', label: 'Dairy Shop', icon: <Store className="h-6 w-6" />, desc: 'Manage a dairy shop' },
];

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('milkman');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
    } else {
      // Store selected role in localStorage temporarily; will be saved after login
      localStorage.setItem('pending_role', selectedRole);
      toast({ title: 'Account created!', description: 'You can now login.' });
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Milk className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-sm text-muted-foreground">Choose your role and start managing</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <Label className="mb-2 block">I am a</Label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-xs font-medium transition-all ${
                      selectedRole === r.value
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {r.icon}
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-[10px] leading-tight text-muted-foreground">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-4 space-y-1 text-center text-sm text-muted-foreground">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
            </p>
            <p>
              <Link to="/" className="font-medium text-primary hover:underline">← Back to Home</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
