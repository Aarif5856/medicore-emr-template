import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_auth/login")({
  head: () => ({ meta: [{ title: "Sign in · MediCore EMR" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <Card className="card-glass border shadow-sm">
      <CardHeader className="items-center text-center">
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground glow-primary">
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <CardTitle className="text-xl">Sign in to MediCore</CardTitle>
        <CardDescription>Access your clinical workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" placeholder="you@clinic.com" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <Button asChild className="w-full glow-primary">
            <Link to="/dashboard">Sign in</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Protected by role-based access. Contact your administrator for credentials.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
