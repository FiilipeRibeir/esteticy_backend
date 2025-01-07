import { AppointmentStatus } from "@prisma/client";

interface AppointmentCreateProps {
  title: string;
  userId: string;
  date: Date;
  status: AppointmentStatus;
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
  date: Date;
  status: AppointmentStatus;
}

// Nova interface para atualizar apenas o status
interface AppointmentUpdateStatusProps {
  id: string;
  status: AppointmentStatus;
}

export {
  AppointmentCreateProps,
  AppointmentDeleteProps,
  AppointmentGetOneProps,
  AppointmentUpdateProps,
  AppointmentUpdateStatusProps
};

