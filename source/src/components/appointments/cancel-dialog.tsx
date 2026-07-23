import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/data/appointments";

interface Props {
  appointment: Appointment | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
}

export function CancelAppointmentDialog({ appointment, onOpenChange, onConfirm }: Props) {
  const open = appointment !== null;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
          <AlertDialogDescription>
            {appointment ? (
              <>
                This will cancel {appointment.patientName}'s appointment with{" "}
                {appointment.doctorName} on{" "}
                <span className="tabular font-medium text-foreground">
                  {format(parseISO(appointment.start), "MMM d, yyyy 'at' HH:mm")}
                </span>
                . This action can be reversed by booking a new one.
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep appointment</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => {
              if (!appointment) return;
              onConfirm(appointment.id);
              toast.success(`Appointment for ${appointment.patientName} cancelled`);
            }}
          >
            Yes, cancel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
