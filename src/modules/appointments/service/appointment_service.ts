import dayjs from "dayjs";
import HttpError from '../../../config/error';
import prismaClient from '../../../prisma';
import {
  AppointmentCreateProps,
  AppointmentDeleteProps,
  AppointmentGetOneProps,
  AppointmentUpdateProps,
  AppointmentUpdateStatusProps,
} from "../model/appoiments_interfaces";
import findAppointmentById from "../utils/appoiments_utils";

class CreateAppointmentsService {
  async execute({ title, userId, date, status }: AppointmentCreateProps) {
    if (!date) {
      throw new Error('Preencha a data');
    }

    // Verifica se já existe um compromisso na mesma data e hora com status diferente de "CANCELADO"
    const existingAppointment = await prismaClient.appointment.findFirst({
      where: {
        date: date,
        status: {
          not: "CANCELADO", // Não permite criar compromisso se o status não for CANCELADO
        },
      },
    });

    if (existingAppointment) {
      throw new Error('Já existe um compromisso marcado nesta data e hora.');
    }

    const appointment = await prismaClient.appointment.create({
      data: {
        title: title,
        userId: userId,
        date: date,
        status: status,
      },
    });

    return appointment;
  }
}

class DeleteAppointmentsService {
  async execute({ id }: AppointmentDeleteProps) {
    if (!id) {
      throw new HttpError('Informe o ID do appointment', 400);
    }

    const existingAppointment = await findAppointmentById(id);
    const appointment = await prismaClient.appointment.delete({
      where: { id },
    });

    return appointment;
  }
}

class GetAppointmentsService {
  async execute() {
    const appointments = await prismaClient.appointment.findMany();
    return appointments;
  }
}

class GetFilteredAppointmentsService {
  async execute({ userId, date, status }: AppointmentGetOneProps) {
    const where: any = {};

    if (userId) where.userId = userId;

    if (date) {
      const startOfDay = dayjs(date).startOf('day').toDate(); // Início do dia
      const endOfDay = dayjs(date).endOf('day').toDate(); // Fim do dia

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (status) where.status = status;

    const appointments = await prismaClient.appointment.findMany({ where });

    if (appointments.length === 0) {
      return { message: "Nenhum agendamento encontrado para os critérios informados" };
    }

    return appointments;
  }
}

class UpdateAppointmentService {
  async execute({ id, date }: AppointmentUpdateProps) {
    if (!id || !date) {
      throw new Error('Informe o ID e a nova data para atualizar');
    }

    await findAppointmentById(id); // Verifica se o compromisso existe

    const updatedAppointment = await prismaClient.appointment.update({
      where: { id },
      data: {
        date,
        status: 'PENDENTE', // Define o status como PENDENTE ao reagendar
      },
    });

    return updatedAppointment;
  }
}

class UpdateAppointmentStatusService {
  async execute({ id, status }: AppointmentUpdateStatusProps) {
    if (!id || !status) {
      throw new Error('Informe o ID e o status para atualizar');
    }

    await findAppointmentById(id); // Verifica se o compromisso existe

    const updatedAppointment = await prismaClient.appointment.update({
      where: { id },
      data: { status },
    });

    return updatedAppointment;
  }
}

export {
  CreateAppointmentsService,
  DeleteAppointmentsService,
  GetAppointmentsService,
  GetFilteredAppointmentsService,
  UpdateAppointmentService,
  UpdateAppointmentStatusService
};

