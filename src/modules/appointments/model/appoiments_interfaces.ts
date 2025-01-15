import { AppointmentStatus } from "@prisma/client";

interface AppointmentCreateProps {
  title: string;
  userId: string;
  date: Date;
  workId: string;
  paymentStatus: string;
  paidAmount: number;
}

interface AppointmentDeleteProps {
  id: string;
}

interface AppointmentGetOneProps {
  userId?: string;
  date?: Date;
  status?: string;
}

interface AppointmentUpdateProps {
  id: string;
  date?: Date;
  status?: AppointmentStatus;
  paymentStatus?: string;
  paidAmount?: number;
}

export { AppointmentCreateProps, AppointmentDeleteProps, AppointmentGetOneProps, AppointmentUpdateProps };
