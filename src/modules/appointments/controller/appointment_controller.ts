import { AppointmentStatus } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateAppointmentsService,
  DeleteAppointmentsService,
  GetAppointmentsService,
  GetFilteredAppointmentsService,
  UpdateAppointmentService,
  UpdateAppointmentStatusService,
} from "../service/appointment_service";

// Função genérica para tratamento de erros
const handleError = (response: FastifyReply, error: Error | unknown) => {
  if (error instanceof Error) {
    response.status(400).send({ error: error.message });
  } else {
    response.status(400).send({ error: "Erro desconhecido" });
  }
};

// Função genérica para extrair dados da requisição
const extractData = (request: FastifyRequest) => {
  const body = request.body as { date: Date; status: AppointmentStatus; title: string; userId: string };
  return {
    id: (request.query as { id: string }).id,
    date: body.date,
    status: body.status,
    title: body.title,
    userId: body.userId,
  };
};

class appointmentCreateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { title, userId, date, status } = extractData(request);
      const appointmentService = new CreateAppointmentsService();
      const appointmentCreate = await appointmentService.execute({ title, userId, date, status });
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
      const { userId, date, status } = request.query as { userId?: string; date?: Date; status?: string };
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
      const { id, date } = extractData(request);
      if (!id || !date) {
        response.status(400).send({ message: "ID e data são obrigatórios" });
        return;
      }

      const appointmentService = new UpdateAppointmentService();
      const updatedAppointment = await appointmentService.execute({ id, date, status: AppointmentStatus.PENDENTE });
      response.status(200).send(updatedAppointment);
    } catch (error) {
      handleError(response, error);
    }
  }
}

class appointmentUpdateStatusController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { id, status } = extractData(request);
      if (!id || !status) {
        response.status(400).send({ message: "ID e status são obrigatórios" });
        return;
      }

      const appointmentService = new UpdateAppointmentStatusService();
      const updatedAppointment = await appointmentService.execute({ id, status });
      response.status(200).send(updatedAppointment);
    } catch (error) {
      handleError(response, error);
    }
  }
}

export {
  appointmentCreateController,
  appointmentDeleteController,
  appointmentGetController,
  appointmentGetFilteredController,
  appointmentUpdateController,
  appointmentUpdateStatusController,
};
