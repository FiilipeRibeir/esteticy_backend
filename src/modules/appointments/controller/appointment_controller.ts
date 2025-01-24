import { FastifyReply, FastifyRequest } from "fastify";
import handleError from "../../../config/handle_error";
import { AppointmentCreateProps, AppointmentGetOneProps, AppointmentUpdateProps } from "../model/appoiments_interfaces";
import { CreateAppointmentsService, DeleteAppointmentsService, GetAppointmentsService, GetFilteredAppointmentsService, UpdateAppointmentService } from "../service/appointment_service";

class appointmentCreateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { userId, date, workId, email } = request.body as AppointmentCreateProps;
      const appointmentService = new CreateAppointmentsService();
      const appointmentCreate = await appointmentService.execute({ userId, date, workId, email });
      response.send(appointmentCreate);
    } catch (error) {
      handleError(response, error);
    }
  }
}

class appointmentDeleteController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { id } = request.query as { id: string };
      const appointmentService = new DeleteAppointmentsService();
      await appointmentService.execute({ id });
      response.send({ message: "Appointment deletado com sucesso", id });
    } catch (error) {
      handleError(response, error);
    }
  }
}

class appointmentGetController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const appointmentService = new GetAppointmentsService();
      const appointmentGet = await appointmentService.execute();
      response.send(appointmentGet);
    } catch (error) {
      handleError(response, error);
    }
  }
}

class appointmentGetFilteredController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { userId, date, status } = request.query as AppointmentGetOneProps;
      const appointmentService = new GetFilteredAppointmentsService();
      const appointmentGet = await appointmentService.execute({ userId, date, status });
      response.send(appointmentGet);
    } catch (error) {
      handleError(response, error);
    }
  }
}

class appointmentUpdateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { id } = request.query as { id: string };
      const { date, status, paymentStatus, paidAmount } = request.body as AppointmentUpdateProps;

      if (!id) {
        response.status(400).send({ message: "O ID é obrigatório para atualizar um compromisso" });
        return;
      }

      if (!date && !status && !paymentStatus && paidAmount === undefined) {
        response.status(400).send({ message: "Informe pelo menos um campo para atualização (date, status, paymentStatus ou paidAmount)" });
        return;
      }

      const appointmentService = new UpdateAppointmentService();
      const updatedAppointment = await appointmentService.execute({
        id,
        date,
        status,
        paymentStatus,
        paidAmount,
      });

      response.status(200).send(updatedAppointment);
    } catch (error) {
      handleError(response, error);
    }
  }
}

export { appointmentCreateController, appointmentDeleteController, appointmentGetController, appointmentGetFilteredController, appointmentUpdateController };
