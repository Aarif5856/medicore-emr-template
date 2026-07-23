import { STAFF, fullName as staffFullName, type StaffMember } from "@/data/staff";
import { PATIENTS, type Patient } from "@/data/patients";

export type ParticipantKind = "staff" | "patient";
export type MessageDirection = "in" | "out";

export interface Message {
  id: string;
  direction: MessageDirection; // "in" = from participant, "out" = from current user
  text: string;
  at: string; // ISO
}

export interface Conversation {
  id: string;
  kind: ParticipantKind;
  refId: string; // staff or patient id
  name: string;
  subtitle: string; // role/context
  initials: string;
  unread: number;
  messages: Message[];
}

const initialsFrom = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[parts.length - 1]?.[0] ?? "";
  return `${a}${b}`.toUpperCase();
};

function staffAt(index: number): StaffMember {
  return STAFF[index % STAFF.length];
}
function patientAt(index: number): Patient {
  return PATIENTS[index % PATIENTS.length];
}

const now = new Date("2026-07-09T10:30:00Z").getTime();
const min = (n: number) => new Date(now - n * 60_000).toISOString();
const hr = (n: number) => new Date(now - n * 3_600_000).toISOString();
const day = (n: number) => new Date(now - n * 86_400_000).toISOString();

interface Seed {
  kind: ParticipantKind;
  refIndex: number;
  displayNameOverride?: string;
  subtitle: string;
  unread: number;
  messages: Array<{ dir: MessageDirection; text: string; at: string }>;
}

const SEEDS: Seed[] = [
  {
    kind: "staff",
    refIndex: 0,
    subtitle: "Cardiology",
    unread: 2,
    messages: [
      { dir: "in", text: "Morning! Can you review Mr. Kim's ECG from yesterday?", at: hr(26) },
      { dir: "out", text: "On it - I'll send notes within the hour.", at: hr(25) },
      { dir: "in", text: "Also, the stress test slot at 3 PM opened up.", at: hr(24) },
      { dir: "in", text: "Should I move him there?", at: min(8) },
      { dir: "in", text: "Let me know when you get a sec 🙏", at: min(3) },
    ],
  },
  {
    kind: "patient",
    refIndex: 0,
    subtitle: "Patient · PT-0001",
    unread: 1,
    messages: [
      { dir: "in", text: "Hi, is my follow-up still on for Friday?", at: hr(4) },
      { dir: "out", text: "Yes - 10:30 AM with Dr. Patel. See you then!", at: hr(3) },
      { dir: "in", text: "Perfect, thank you!", at: min(42) },
    ],
  },
  {
    kind: "staff",
    refIndex: 2,
    subtitle: "Pediatrics",
    unread: 0,
    messages: [
      { dir: "out", text: "Elena, do you have the vaccine inventory report?", at: hr(6) },
      { dir: "in", text: "Just uploaded it to the shared drive.", at: hr(5) },
      { dir: "out", text: "Got it - thanks!", at: hr(5) },
    ],
  },
  {
    kind: "staff",
    refIndex: 8,
    subtitle: "Nursing · Cardiology",
    unread: 3,
    messages: [
      { dir: "in", text: "Bed 12 vitals are trending down.", at: min(45) },
      { dir: "in", text: "BP 92/58, HR 108.", at: min(44) },
      { dir: "in", text: "Calling the on-call doc now.", at: min(12) },
    ],
  },
  {
    kind: "patient",
    refIndex: 5,
    subtitle: "Patient · PT-0006",
    unread: 0,
    messages: [
      { dir: "in", text: "My chest pain came back last night.", at: day(1) },
      { dir: "out", text: "Please come in this morning - we'll fit you in.", at: day(1) },
      { dir: "in", text: "Heading over now.", at: hr(20) },
    ],
  },
  {
    kind: "staff",
    refIndex: 18,
    subtitle: "Administration",
    unread: 0,
    messages: [
      { dir: "in", text: "Payroll cycle closes Friday - submit timesheets.", at: day(2) },
      { dir: "out", text: "Will do, thanks Nadia.", at: day(2) },
    ],
  },
  {
    kind: "patient",
    refIndex: 2,
    subtitle: "Patient · PT-0003",
    unread: 0,
    messages: [
      { dir: "in", text: "Can I get a copy of my lab results?", at: day(3) },
      { dir: "out", text: "Sent to your patient portal - check the Results tab.", at: day(3) },
      { dir: "in", text: "Found them, thanks!", at: day(3) },
    ],
  },
  {
    kind: "staff",
    refIndex: 3,
    subtitle: "Neurology",
    unread: 1,
    messages: [
      { dir: "in", text: "MRI scheduled for Mrs. Rossi tomorrow at 9.", at: hr(9) },
      { dir: "in", text: "Please confirm pre-op instructions.", at: hr(2) },
    ],
  },
  {
    kind: "staff",
    refIndex: 6,
    subtitle: "Emergency",
    unread: 0,
    messages: [
      { dir: "out", text: "Priya, can you cover the 8 PM shift tomorrow?", at: day(1) },
      { dir: "in", text: "Yes, I can swap.", at: day(1) },
      { dir: "out", text: "Lifesaver 🙌", at: day(1) },
    ],
  },
  {
    kind: "patient",
    refIndex: 10,
    subtitle: "Patient · PT-0011",
    unread: 0,
    messages: [
      { dir: "in", text: "Prescription refill needed for my inhaler.", at: day(4) },
      { dir: "out", text: "Sent to your pharmacy - ready by 5 PM.", at: day(4) },
    ],
  },
  {
    kind: "staff",
    refIndex: 20,
    subtitle: "Pharmacy",
    unread: 0,
    messages: [
      { dir: "in", text: "Amoxicillin stock is down to 20 units.", at: day(2) },
      { dir: "out", text: "Placing the reorder now.", at: day(2) },
      { dir: "in", text: "Thanks 👍", at: day(2) },
    ],
  },
  {
    kind: "patient",
    refIndex: 12,
    subtitle: "Patient · PT-0013",
    unread: 2,
    messages: [
      { dir: "in", text: "Hi, do you have any evening slots this week?", at: hr(3) },
      { dir: "in", text: "Preferably after 6 PM.", at: min(28) },
    ],
  },
  {
    kind: "staff",
    refIndex: 10,
    subtitle: "Nursing · Nurse Nyongo",
    unread: 0,
    messages: [
      { dir: "in", text: "Post-op rounds done, all stable.", at: hr(7) },
      { dir: "out", text: "Great work - go grab a break.", at: hr(7) },
    ],
  },
  {
    kind: "patient",
    refIndex: 7,
    subtitle: "Patient · PT-0008",
    unread: 0,
    messages: [
      { dir: "in", text: "Question about my medication side effects.", at: day(5) },
      { dir: "out", text: "Happy to help - what are you experiencing?", at: day(5) },
      { dir: "in", text: "Mild nausea in the mornings.", at: day(5) },
      {
        dir: "out",
        text: "That's expected in week 1. If it persists past 10 days, call us.",
        at: day(5),
      },
    ],
  },
  {
    kind: "staff",
    refIndex: 22,
    subtitle: "IT & Records",
    unread: 0,
    messages: [
      { dir: "in", text: "EMR maintenance tonight 11 PM – 12 AM.", at: day(1) },
      { dir: "out", text: "Noted, will inform night shift.", at: day(1) },
    ],
  },
  {
    kind: "patient",
    refIndex: 13,
    subtitle: "Patient · PT-0014",
    unread: 1,
    messages: [
      { dir: "in", text: "Insurance pre-auth confirmation?", at: hr(11) },
      { dir: "in", text: "Surgery is in 3 days.", at: hr(1) },
    ],
  },
  {
    kind: "staff",
    refIndex: 5,
    subtitle: "General Medicine",
    unread: 0,
    messages: [
      { dir: "out", text: "Sam, referral for Ms. Alvarez ready?", at: day(2) },
      { dir: "in", text: "Yes, sent to Dr. Reyes.", at: day(2) },
    ],
  },
  {
    kind: "patient",
    refIndex: 4,
    subtitle: "Patient · PT-0005",
    unread: 0,
    messages: [
      { dir: "in", text: "Thanks for the great care last week!", at: day(6) },
      { dir: "out", text: "So glad to hear you're feeling better 🌟", at: day(6) },
    ],
  },
];

function build(): Conversation[] {
  return SEEDS.map((seed, i) => {
    let name = "";
    let refId = "";
    if (seed.kind === "staff") {
      const s = staffAt(seed.refIndex);
      name = `Dr. ${staffFullName(s)}`.replace(/^Dr\. Dr\./, "Dr.");
      if (s.role !== "Doctor") name = staffFullName(s);
      refId = s.id;
    } else {
      const p = patientAt(seed.refIndex);
      name = `${p.firstName} ${p.lastName}`;
      refId = p.id;
    }
    const messages: Message[] = seed.messages.map((m, j) => ({
      id: `MSG-${i + 1}-${j + 1}`,
      direction: m.dir,
      text: m.text,
      at: m.at,
    }));
    return {
      id: `CV-${String(i + 1).padStart(3, "0")}`,
      kind: seed.kind,
      refId,
      name,
      subtitle: seed.subtitle,
      initials: initialsFrom(name),
      unread: seed.unread,
      messages,
    };
  }).sort((a, b) => {
    const at = new Date(a.messages[a.messages.length - 1]?.at ?? 0).getTime();
    const bt = new Date(b.messages[b.messages.length - 1]?.at ?? 0).getTime();
    return bt - at;
  });
}

export const CONVERSATIONS: Conversation[] = build();

export function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = now - t;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date(now);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const y = new Date(now - 86_400_000);
  if (same(d, today)) return "Today";
  if (same(d, y)) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
