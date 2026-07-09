import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Bell,
  Building2,
  CreditCard,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Languages,
  Laptop,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/coming-soon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useDirection, type Direction } from "@/hooks/use-direction";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MediCore EMR" },
      {
        name: "description",
        content: "Manage profile, clinic, appearance, notifications and security preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

type SectionKey =
  | "profile"
  | "clinic"
  | "appearance"
  | "notifications"
  | "security"
  | "billing"
  | "data";

const SECTIONS: Array<{ key: SectionKey; label: string; icon: typeof UserIcon }> = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "clinic", label: "Clinic Information", icon: Building2 },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "billing", label: "Billing & Subscription", icon: CreditCard },
  { key: "data", label: "Data & Backup", icon: Database },
];

function SettingsPage() {
  const [active, setActive] = useState<SectionKey>("profile");

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Settings"
        description="Workspace preferences, appearance, security, and integrations."
      />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Left nav — desktop */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 flex flex-col gap-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = s.key === active;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(s.key)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-start text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab strip — mobile */}
        <div className="-mx-6 overflow-x-auto px-6 lg:hidden">
          <div className="flex gap-1 border-b border-border/60 pb-1">
            {SECTIONS.map((s) => {
              const isActive = s.key === active;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(s.key)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-t-md px-3 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          {active === "profile" && <ProfileSection />}
          {active === "clinic" && <ClinicSection />}
          {active === "appearance" && <AppearanceSection />}
          {active === "notifications" && <NotificationsSection />}
          {active === "security" && <SecuritySection />}
          {active === "billing" && <BillingSection />}
          {active === "data" && <DataSection />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(6, "Enter a valid phone").max(30),
  bio: z.string().max(500, "Keep bio under 500 characters").optional().or(z.literal("")),
});
type ProfileForm = z.infer<typeof profileSchema>;

function ProfileSection() {
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "Elena",
      lastName: "Reyes",
      email: "elena.reyes@medicore.health",
      phone: "+1 415 555 0102",
      bio: "Administrator overseeing clinical operations at MediCore.",
    },
  });

  const onSubmit = (values: ProfileForm) => {
    form.reset(values);
    toast.success("Profile updated");
  };

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                  DR
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Dr. Elena Reyes</span>
                  <Badge variant="secondary" className="text-[10px]">Administrator</Badge>
                </div>
                <Button type="button" variant="ghost" size="sm" className="gap-2">
                  <Upload className="h-3.5 w-3.5" /> Change Photo
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Short bio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" size="sm">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Clinic
// ---------------------------------------------------------------------------

const clinicSchema = z.object({
  name: z.string().trim().min(1, "Clinic name is required").max(120),
  address: z.string().trim().min(1, "Address is required").max(240),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(255),
  website: z.string().trim().url("Enter a valid URL").max(200).or(z.literal("")),
  taxId: z.string().trim().min(1, "Tax ID is required").max(60),
});
type ClinicForm = z.infer<typeof clinicSchema>;

function ClinicSection() {
  const form = useForm<ClinicForm>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: "MediCore Medical Center",
      address: "1284 Presidio Ave, San Francisco, CA 94115",
      phone: "+1 415 555 0100",
      email: "hello@medicore.health",
      website: "https://medicore.health",
      taxId: "US-EIN-84-1902847",
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!["image/png", "image/svg+xml"].includes(file.type)) {
      toast.error("Only PNG or SVG images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2 MB");
      return;
    }
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemove = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onSubmit = (values: ClinicForm) => {
    form.reset(values);
    toast.success("Clinic information saved");
  };

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-base">Clinic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl><Input placeholder="https://" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID / Registration</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-muted/30 hover:bg-muted/50",
                )}
                role="button"
                aria-label="Upload clinic logo"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    inputRef.current?.click();
                  }
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/svg+xml"
                  className="sr-only"
                  onChange={handleInputChange}
                  aria-hidden="true"
                />
                {logoPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={logoPreview}
                      alt="Selected clinic logo preview"
                      className="h-20 w-auto max-w-[12rem] object-contain"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                      }}
                      className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Drop a logo image or{" "}
                      <span className="font-medium text-primary">browse</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">PNG or SVG, up to 2 MB</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Appearance
// ---------------------------------------------------------------------------

type ThemeChoice = "light" | "dark" | "system";

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [choice, setChoice] = useState<ThemeChoice>(theme);
  const [compact, setCompact] = useState(false);

  const handleSelect = (next: ThemeChoice) => {
    setChoice(next);
    if (next === "system") {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    } else {
      setTheme(next);
    }
  };

  const options: Array<{
    key: ThemeChoice;
    label: string;
    icon: typeof Sun;
    swatch: string;
  }> = [
    { key: "light", label: "Light", icon: Sun, swatch: "bg-white border-slate-200" },
    { key: "dark", label: "Dark", icon: Moon, swatch: "bg-slate-900 border-slate-700" },
    {
      key: "system",
      label: "System",
      icon: Monitor,
      swatch: "bg-gradient-to-r from-white to-slate-900 border-slate-400",
    },
  ];

  // Keep local "choice" reflecting external theme changes (e.g. header toggle)
  // unless the user picked "system", which we preserve.
  useEffect(() => {
    if (choice !== "system" && choice !== theme) {
      setChoice(theme);
    }
  }, [theme, choice]);

  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {options.map((opt) => {
              const Icon = opt.icon;
              const selected = choice === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelect(opt.key)}
                  className={cn(
                    "group flex flex-col gap-3 rounded-lg border p-3 text-start transition-all",
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                      : "border-border hover:border-primary/40 hover:bg-muted/40",
                  )}
                  aria-pressed={selected}
                >
                  <div
                    className={cn(
                      "h-16 w-full rounded-md border",
                      opt.swatch,
                    )}
                  />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon className="h-4 w-4" /> {opt.label}
                    </span>
                    <span
                      className={cn(
                        "h-3 w-3 rounded-full border",
                        selected
                          ? "border-primary bg-primary"
                          : "border-border bg-transparent",
                      )}
                      aria-hidden
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-base">Display</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-md border border-border/60 p-3">
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Laptop className="h-4 w-4" /> Compact mode
              </div>
              <p className="text-xs text-muted-foreground">
                Tighter spacing across tables and lists for denser layouts.
              </p>
            </div>
            <Switch checked={compact} onCheckedChange={setCompact} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

type NotifKey =
  | "email.appointments"
  | "email.labs"
  | "email.billing"
  | "email.system"
  | "push.appointments"
  | "push.labs"
  | "push.billing"
  | "push.system";

const NOTIF_ROWS: Array<{ key: NotifKey; label: string }> = [
  { key: "email.appointments", label: "Appointment reminders" },
  { key: "email.labs", label: "Lab results ready" },
  { key: "email.billing", label: "Billing alerts" },
  { key: "email.system", label: "System updates" },
  { key: "push.appointments", label: "Appointment reminders" },
  { key: "push.labs", label: "Lab results ready" },
  { key: "push.billing", label: "Billing alerts" },
  { key: "push.system", label: "System updates" },
];

function NotificationsSection() {
  const [prefs, setPrefs] = useState<Record<NotifKey, boolean>>({
    "email.appointments": true,
    "email.labs": true,
    "email.billing": true,
    "email.system": false,
    "push.appointments": true,
    "push.labs": true,
    "push.billing": false,
    "push.system": true,
  });

  const toggle = (k: NotifKey) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const emailRows = NOTIF_ROWS.filter((r) => r.key.startsWith("email."));
  const pushRows = NOTIF_ROWS.filter((r) => r.key.startsWith("push."));

  const renderGroup = (title: string, rows: Array<{ key: NotifKey; label: string }>) => (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="divide-y divide-border/60 rounded-md border border-border/60">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-4 px-3 py-2.5">
            <Label htmlFor={r.key} className="cursor-pointer text-sm">
              {r.label}
            </Label>
            <Switch
              id={r.key}
              checked={prefs[r.key]}
              onCheckedChange={() => toggle(r.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-base">Notification preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderGroup("Email notifications", emailRows)}
        {renderGroup("Push / In-app notifications", pushRows)}
        <div className="flex justify-end">
          <Button size="sm" onClick={() => toast.success("Preferences saved")}>
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------

const passwordSchema = z
  .object({
    current: z.string().min(1, "Current password is required"),
    next: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.next === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

interface SessionRow {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
}
const SESSIONS: SessionRow[] = [
  { id: "s1", device: "Chrome on macOS", location: "San Francisco, CA", lastActive: "Active now", current: true },
  { id: "s2", device: "Safari on iPhone", location: "San Francisco, CA", lastActive: "2 hours ago" },
  { id: "s3", device: "Firefox on Windows", location: "Oakland, CA", lastActive: "Yesterday" },
];

function SecuritySection() {
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [twoFA, setTwoFA] = useState(false);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });

  const onSubmit = () => {
    form.reset({ current: "", next: "", confirm: "" });
    toast.success("Password updated");
  };

  const eyeButton = (key: keyof typeof show) => (
    <button
      type="button"
      onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
      className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      aria-label={show[key] ? "Hide password" : "Show password"}
    >
      {show[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="current"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={show.current ? "text" : "password"}
                          autoComplete="current-password"
                          className="pe-9"
                          {...field}
                        />
                        {eyeButton("current")}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="next"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={show.next ? "text" : "password"}
                            autoComplete="new-password"
                            className="pe-9"
                            {...field}
                          />
                          {eyeButton("next")}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm new password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={show.confirm ? "text" : "password"}
                            autoComplete="new-password"
                            className="pe-9"
                            {...field}
                          />
                          {eyeButton("confirm")}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm">Update Password</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-base">Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-0.5">
              <div className="text-sm font-medium text-foreground">Require a second step at sign-in</div>
              <p className="text-xs text-muted-foreground">
                Add an authenticator app or SMS code on top of your password for stronger account security.
              </p>
            </div>
            <Switch checked={twoFA} onCheckedChange={setTwoFA} />
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-base">Active sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/60 rounded-md border border-border/60">
            {SESSIONS.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="truncate">{s.device}</span>
                    {s.current && (
                      <Badge variant="secondary" className="text-[10px]">This device</Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.location} · {s.lastActive}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={s.current}
                  onClick={() => toast.success(`Session on ${s.device} revoked`)}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

function BillingSection() {
  const features = [
    "Unlimited patient records",
    "Advanced lab & pharmacy modules",
    "Priority support with 4h SLA",
    "Automated backups and audit logs",
  ];
  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-base">Current plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-foreground">Professional Plan</span>
                <Badge className="bg-primary text-primary-foreground text-[10px]">Active</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Renews on August 12, 2026</p>
            </div>
            <div className="text-end">
              <div className="text-2xl font-semibold text-foreground tabular">$249</div>
              <div className="text-[11px] text-muted-foreground">/month · billed annually</div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Included
          </h3>
          <ul className="space-y-1.5 text-sm text-foreground">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast("Subscription management is available in the full version")}
          >
            Manage Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Data & Backup
// ---------------------------------------------------------------------------

function DataSection() {
  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-base">Export data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-xs text-muted-foreground">
            Download a snapshot of your clinic data for archiving or migration.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => toast.success("CSV export queued")}
            >
              <Download className="h-4 w-4" /> Export as CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => toast.success("PDF export queued")}
            >
              <FileText className="h-4 w-4" /> Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-base">Backup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">Last backup</div>
              <div className="text-xs text-muted-foreground">
                July 9, 2026 · 02:14 AM · 2.4 GB
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Backup started")}
            >
              Backup Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
