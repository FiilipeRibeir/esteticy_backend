import { FastifyReply, FastifyRequest } from "fastify";
import handleError from "../../../config/handle_error";
import { WorkCreateProps, WorkGetOneProps, WorkUpdateProps } from "../model/work_interfaces";
import { WorkCreateService, WorkDeleteService, WorkGetFilteredService, WorkGetService, WorkUpdateService } from "../services/work_service";

class workCreateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { userId, name, description, price } = request.body as WorkCreateProps;
      const workService = new WorkCreateService();
      const workCreate = await workService.execute({ userId, name, description, price });
      response.send(workCreate);
    } catch (error) {
      handleError(response, error);
    }
  }
}

class workDeleteController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { id } = request.query as { id: string };
      const workService = new WorkDeleteService();
      await workService.execute({ id });
      response.send({ message: "Trabalho deletado com sucesso", id });
    } catch (error) {
      handleError(response, error);
    }
  }
}

class workGetController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const workService = new WorkGetService();
      const workGet = await workService.execute();
      response.send(workGet);
    } catch (error) {
      handleError(response, error);
    }
  }
}

class workGetFilteredController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { userId, name, description, price } = request.query as WorkGetOneProps;
      const workService = new WorkGetFilteredService();
      const workGet = await workService.execute({ userId, name, description, price });
      response.send(workGet);
    } catch (error) {
      handleError(response, error);
    }
  }
}

class workUpdateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { id } = request.query as WorkUpdateProps;
      const { name, description, price } = request.body as WorkUpdateProps;
      const workService = new WorkUpdateService();
      const workUpdate = await workService.execute({ id, name, description, price });
      response.send(workUpdate);
    } catch (error) {
      handleError(response, error);
    }
  }
}

export { workCreateController, workDeleteController, workGetController, workGetFilteredController, workUpdateController };

