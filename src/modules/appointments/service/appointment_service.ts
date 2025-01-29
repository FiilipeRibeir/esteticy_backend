import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import dayjs from "dayjs";
import { HttpError } from "../../../config/error";
import prismaClient from '../../../prisma';
import { CreatePaymentService } from "../../payments/service/payment_service";
import { AppointmentCreateProps, AppointmentDeleteProps, AppointmentGetOneProps, AppointmentUpdateProps } from "../model/appoiments_interfaces";
import findAppointmentById from "../utils/appoiments_utils";

class CreateAppointmentsService {
  async execute({ userId, date, workId, email }: AppointmentCreateProps) {
    if (!date) {
      throw new HttpError('Preencha a data', 400);
    }

    if (!workId) {
      throw new HttpError('O ID do trabalho (workId) é obrigatório', 400);
    }

    // Busca o trabalho associado
    const Work = await prismaClient.work.findUnique({
      where: { id: workId },
    });

    if (!Work) {
      throw new HttpError('Trabalho (workId) não encontrado.', 404);
    }

    // Agora cria o compromisso, associando o pagamento
    const appointment = await prismaClient.appointment.create({
      data: {
        title: Work.name,
        userId,
        date,
        workId,
        paymentStatus: PaymentStatus.PENDENTE,
      },
    });

    try {
      const paymentService = new CreatePaymentService();
      const paymentCreate = await paymentService.execute({
        userId,
        external_reference: appointment.id,
        transactionAmount: Work.price,
        description: Work.name,
        paymentMethodId: "pix",
        email,
      });

      return {
        appointment,
        payment: paymentCreate,
      };
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      throw new HttpError("Erro ao processar pagamento.", 500);
    }
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
      throw new HttpError("Informe o ID para atualizar", 400);
    }

    if (!date && !status && !paymentStatus && paidAmount === undefined) {
      throw new HttpError("Informe pelo menos um campo para atualizar", 400);
    }

    const existingAppointment = await findAppointmentById(id);

    if (!existingAppointment) {
      throw new HttpError("Agendamento não encontrado", 404);
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
        throw new HttpError("O valor pago não pode ser negativo", 400);
      }

      const newTotalPaid = parseFloat(((existingAppointment.paidAmount || 0) + paidAmount).toFixed(2));

      const work = await prismaClient.work.findUnique({
        where: { id: existingAppointment.workId },
      });

      if (!work) {
        throw new HttpError("Trabalho associado ao agendamento não encontrado", 404);
      }

      const workPrice = parseFloat(work.price.toFixed(2));

      if (newTotalPaid >= workPrice) {
        updateData.paymentStatus = PaymentStatus.CONFIRMADO;
        updateData.paidAmount = workPrice;
      } else {
        updateData.paymentStatus = PaymentStatus.PENDENTE;
        updateData.paidAmount = newTotalPaid;
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
