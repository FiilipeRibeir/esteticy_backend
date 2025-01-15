import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import dayjs from "dayjs";
import HttpError from '../../../config/error';
import prismaClient from '../../../prisma';
import { AppointmentCreateProps, AppointmentDeleteProps, AppointmentGetOneProps, AppointmentUpdateProps } from "../model/appoiments_interfaces";
import findAppointmentById from "../utils/appoiments_utils";

class CreateAppointmentsService {
  async execute({ title, userId, date, workId, paidAmount }: AppointmentCreateProps) {
    if (!date) {
      throw new HttpError('Preencha a data', 400);
    }

    if (!workId) {
      throw new HttpError('O ID do trabalho (workId) é obrigatório', 400);
    }

    // Busca o trabalho associado
    const existingWork = await prismaClient.work.findUnique({
      where: { id: workId },
    });

    if (!existingWork) {
      throw new HttpError('Trabalho (workId) não encontrado.', 404);
    }

    const workPrice = existingWork.price;

    // Verifica se o valor pago é pelo menos metade do preço do trabalho
    const minimumPayment = workPrice / 2;

    if (!paidAmount || paidAmount < minimumPayment) {
      throw new HttpError(
        `O valor pago deve ser pelo menos metade do preço do trabalho (${minimumPayment.toFixed(
          2
        )}).`,
        400
      );
    }

    // Define o status de pagamento com base no valor pago
    const paymentStatus =
      paidAmount >= workPrice ? "CONFIRMADO" : "PENDENTE";

    // Cria o compromisso
    const appointment = await prismaClient.appointment.create({
      data: {
        title,
        userId,
        date,
        workId,
        paidAmount,
        paymentStatus,
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
      const startOfDay = dayjs(date).startOf('day').toDate();
      const endOfDay = dayjs(date).endOf('day').toDate();

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
  async execute({ id, date, status, paymentStatus, paidAmount }: AppointmentUpdateProps) {
    if (!id) {
      throw new Error('Informe o ID para atualizar');
    }

    if (!date && !status && !paymentStatus && paidAmount === undefined) {
      throw new Error('Informe pelo menos um campo para atualizar');
    }

    const existingAppointment = await findAppointmentById(id);

    if (!existingAppointment) {
      throw new Error('Agendamento não encontrado');
    }

    const updateData: Record<string, any> = {};

    if (date) {
      updateData.date = date;
      updateData.status = AppointmentStatus.PENDENTE;
    }

    if (status) {
      updateData.status = status;
    }

    if (paidAmount !== undefined) {
      if (paidAmount < 0) {
        throw new Error('O valor pago (paidAmount) não pode ser negativo');
      }

      // Soma o valor pago ao total atual, usando precisão de ponto flutuante
      const newTotalPaid = parseFloat(
        ((existingAppointment.paidAmount || 0) + paidAmount).toFixed(2)
      );

      // Obtém o preço do trabalho associado
      const work = await prismaClient.work.findUnique({
        where: { id: existingAppointment.workId },
      });

      if (!work) {
        throw new Error('Trabalho associado ao agendamento não encontrado');
      }

      // Verifica se o pagamento está completo
      const workPrice = parseFloat(work.price.toFixed(2));
      const roundedTotalPaid = parseFloat(newTotalPaid.toFixed(2));

      if (roundedTotalPaid >= workPrice) {
        updateData.paymentStatus = PaymentStatus.CONFIRMADO; // Enum correto
        updateData.paidAmount = workPrice; // Garante que o valor não exceda
      } else {
        updateData.paymentStatus = PaymentStatus.PENDENTE;
        updateData.paidAmount = roundedTotalPaid;
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const updatedAppointment = await prismaClient.appointment.update({
      where: { id },
      data: updateData,
    });

    return updatedAppointment;
  }
}

export { CreateAppointmentsService, DeleteAppointmentsService, GetAppointmentsService, GetFilteredAppointmentsService, UpdateAppointmentService };
