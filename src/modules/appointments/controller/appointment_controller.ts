import { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../../../config/error";
import { AppointmentCreateProps, AppointmentGetOneProps, AppointmentUpdateProps } from "../model/appoiments_interfaces";
import { CreateAppointmentsService, DeleteAppointmentsService, GetAppointmentsService, GetFilteredAppointmentsService, UpdateAppointmentService } from "../service/appointment_service";

class AppointmentCreateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { userId, date, workId, email } = request.body as AppointmentCreateProps;
      const appointmentService = new CreateAppointmentsService();
      const appointmentCreate = await appointmentService.execute({ userId, date, workId, email });
      response.send(appointmentCreate);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        console.error("Erro interno:", error);
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class AppointmentDeleteController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { id } = request.query as { id: string };
      const appointmentService = new DeleteAppointmentsService();
      await appointmentService.execute({ id });
      response.send({ message: "Appointment deletado com sucesso", id });
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        console.error("Erro interno:", error);
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class AppointmentGetController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const appointmentService = new GetAppointmentsService();
      const appointmentGet = await appointmentService.execute();
      response.send(appointmentGet);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        console.error("Erro interno:", error);
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class AppointmentGetFilteredController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { userId, date, status } = request.query as AppointmentGetOneProps;
      const appointmentService = new GetFilteredAppointmentsService();
      const appointmentGet = await appointmentService.execute({ userId, date, status });
      response.send(appointmentGet);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        console.error("Erro interno:", error);
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class AppointmentUpdateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { id } = request.query as { id: string };
      const { date, status, paymentStatus, paidAmount } = request.body as AppointmentUpdateProps;

      if (!id) {
        return response.status(400).send({ message: "O ID é obrigatório para atualizar um compromisso" });
      }

      if (!date && !status && !paymentStatus && !paidAmount) {
        return response.status(400).send({ message: "Informe pelo menos um campo para atualização" });
      }

      const appointmentService = new UpdateAppointmentService();
      const updatedAppointment = await appointmentService.execute({ id, date, status, paymentStatus, paidAmount });

      response.status(200).send(updatedAppointment);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        console.error("Erro interno:", error);
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

export { AppointmentCreateController, AppointmentDeleteController, AppointmentGetController, AppointmentGetFilteredController, AppointmentUpdateController };
