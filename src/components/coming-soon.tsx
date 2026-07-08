import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="truncate">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader title={title} description={description} />

      <Card className="card-glass border-dashed">
        <CardHeader className="items-center text-center">
          <div className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary glow-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="pb-10 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            This module is part of the MediCore EMR template and will be shipped in an
            upcoming iteration. The shell, design tokens, and navigation are ready to build on.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
