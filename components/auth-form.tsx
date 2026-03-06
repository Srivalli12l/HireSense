'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type UserRole } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, signup, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setError('Please fill in all fields');
          return;
        }
        await login(email, password);
      } else {
        if (!email || !password || !name) {
          setError('Please fill in all fields');
          return;
        }
        await signup(email, password, name, role);
      }

      // For signup, use the selected role. For login, use the actual role from DB.
      const userRole = mode === 'signup' ? role : (user?.role || role);
      router.push(userRole === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-border">
      <CardHeader>
        <CardTitle className="text-2xl">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login' ? 'Sign in to access your dashboard' : 'Join HireSense to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">I am a...</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground disabled:opacity-50"
            >
              <option value="candidate">Job Seeker / Candidate</option>
              <option value="recruiter">Recruiter / HR</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <a href="/signup" className="text-accent hover:underline font-semibold">
                  Sign up
                </a>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <a href="/login" className="text-accent hover:underline font-semibold">
                  Sign in
                </a>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
