import { AuthForm } from '@/components/auth-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Resume AI</h1>
          <p className="text-muted-foreground">Smart Resume Screening Platform</p>
        </div>

        <AuthForm mode="login" />

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Demo credentials available on signup</p>
        </div>
      </div>
    </div>
  );
}
