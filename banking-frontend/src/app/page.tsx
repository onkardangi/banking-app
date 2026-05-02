'use client';

import { useEffect, useState } from 'react';
import { checkHealth } from '@/lib/api/health';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        setHealth(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch health:', err);
        setError('Failed to connect to backend');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-linear-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold tracking-tight">
              🏦 Banking App
            </h1>
            <p className="text-lg text-muted-foreground">
              Full-stack banking application with Spring Boot & Next.js
            </p>
          </div>

          {/* Status Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Backend connection status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Checking backend connection...</span>
                  </div>
              ) : error ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Backend Offline</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Badge variant="destructive">Disconnected</Badge>
                  </div>
              ) : health ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Backend Status: {health.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{health.message}</p>
                    <Badge className="bg-green-600">Connected</Badge>
                  </div>
              ) : null}

              {/* API Info */}
              <div className="pt-4 border-t space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">API URL:</span> {process.env.NEXT_PUBLIC_API_URL}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Environment:</span> Development
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Create an account or sign in to continue</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button asChild className="flex-1" size="lg">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1" size="lg">
                <Link href="/register">Register</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tech Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Backend</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Java 21</li>
                    <li>• Spring Boot 4.0.6</li>
                    <li>• PostgreSQL</li>
                    <li>• Spring Security + JWT</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Frontend</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Next.js 14</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• Shadcn/ui</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
  );
}