import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import dayjs from "dayjs";
import { HttpError } from "../../../config/error";
import logger from "../../../config/logger";
import prismaClient from '../../../prisma';
import { CreatePaymentService } from "../../payments/service/payment_service";
import { AppointmentCreateProps, AppointmentDeleteProps, AppointmentGetOneProps, AppointmentUpdateProps } from "../model/appoiments_interfaces";
import findAppointmentById from "../utils/appoiments_utils";

class CreateAppointmentsService {
  async execute({ userId, date, workId, email }: AppointmentCreateProps) {
    logger.info("Starting appointment creation process");

    if (!date) {
      logger.warn("Date is missing");
      throw new HttpError('Please provide a date', 400);
    }

    if (!workId) {
      logger.warn("Work ID is missing");
      throw new HttpError('The work ID (workId) is required', 400);
    }

    // Verifica se já existe um compromisso na mesma data dentro do intervalo de uma hora
    const existingAppointments = await prismaClient.appointment.findMany({
      where: {
        date: {
          gte: dayjs(date).subtract(0.9, 'hour').toDate(),
          lte: dayjs(date).add(0.9, 'hour').toDate(),
        },
        status: {
          not: AppointmentStatus.CANCELADO,
        },
      },
    });

    if (existingAppointments.length > 0) {
      logger.warn("Appointment already exists within the one-hour interval");
      throw new HttpError('There is already an appointment within the one-hour interval.', 400);
    }

    // Busca o trabalho associado
    const Work = await prismaClient.work.findUnique({
      where: { id: workId },
    });

    if (!Work) {
      logger.error("Work not found");
      throw new HttpError('Work (workId) not found.', 404);
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

    logger.info(`Appointment created successfully with ID: ${appointment.id}`);

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

      logger.info("Payment process completed successfully");
      return {
        appointment,
        payment: paymentCreate,
      };
    } catch (error) {
      logger.error("Error creating payment:", error);

      const delappointment = new DeleteAppointmentsService();
      await delappointment.execute({ id: appointment.id });

      logger.info(`Appointment with ID ${appointment.id} deleted due to payment failure`);

      throw new HttpError("Error processing payment.", 500);
    }
  }
}

class DeleteAppointmentsService {
  async execute({ id }: AppointmentDeleteProps) {
    logger.info(`Attempting to delete appointment with ID: ${id}`);
    if (!id) {
      logger.warn("Appointment ID is missing");
      throw new HttpError('Provide the appointment ID', 400);
    }

    const appointment = await prismaClient.appointment.delete({
      where: { id },
    });

    logger.info(`Appointment with ID ${id} deleted successfully`);
    return appointment;
  }
}

class GetAppointmentsService {
  async execute() {
    logger.info("Fetching all appointments");
    const appointments = await prismaClient.appointment.findMany();
    return appointments;
  }
}

class GetFilteredAppointmentsService {
  async execute({ userId, date, status }: AppointmentGetOneProps) {
    logger.info("Fetching filtered appointments");
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
      logger.warn("No appointments found for the given criteria");
      return { message: "No appointments found for the given criteria" };
    }

    return appointments;
  }
}

class UpdateAppointmentService {
  async execute({ id, date, status, paymentStatus, paidAmount }: AppointmentUpdateProps) {
    logger.info(`Updating appointment with ID: ${id}`);
    if (!id) {
      logger.warn("Appointment ID is missing");
      throw new HttpError("Provide the ID to update", 400);
    }

    if (!date && !status && !paymentStatus && !paidAmount) {
      logger.warn("No fields provided to update");
      throw new HttpError("Provide at least one field to update", 400);
    }

    const existingAppointment = await findAppointmentById(id);

    if (!existingAppointment) {
      logger.error("Appointment not found");
      throw new HttpError("Appointment not found", 404);
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
        logger.warn("Paid amount cannot be negative");
        throw new HttpError("Paid amount cannot be negative", 400);
      }
    }

    const updatedAppointment = await prismaClient.appointment.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Appointment with ID ${id} updated successfully`);
    return updatedAppointment;
  }
}

export { CreateAppointmentsService, DeleteAppointmentsService, GetAppointmentsService, GetFilteredAppointmentsService, UpdateAppointmentService };

