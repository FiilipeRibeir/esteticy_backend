import { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../../../config/error";
import logger from "../../../config/logger";
import { WorkCreateProps, WorkGetOneProps, WorkUpdateProps } from "../model/work_interfaces";
import { WorkCreateService, WorkDeleteService, WorkGetFilteredService, WorkGetService, WorkUpdateService } from "../services/work_service";

class WorkCreateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      logger.info("Recebida requisição para criação de trabalho.");
      const { userId, name, description, price } = request.body as WorkCreateProps;
      const workService = new WorkCreateService();
      const workCreate = await workService.execute({ userId, name, description, price });
      response.send(workCreate);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class WorkDeleteController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { id } = request.query as { id: string };
      logger.info(`Recebida requisição para deletar trabalho ID: ${id}`);
      const workService = new WorkDeleteService();
      await workService.execute({ id });
      response.send({ message: "Trabalho deletado com sucesso", id });
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class WorkGetController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      logger.debug("Recebida requisição para listar trabalhos.");
      const workService = new WorkGetService();
      const workGet = await workService.execute();
      response.send(workGet);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class WorkGetFilteredController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      logger.debug("Recebida requisição para filtrar trabalhos.");
      const { userId, name, description, price } = request.query as WorkGetOneProps;
      const workService = new WorkGetFilteredService();
      const workGet = await workService.execute({ userId, name, description, price });
      response.send(workGet);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class WorkUpdateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { id } = request.query as WorkUpdateProps;
      const { name, description, price } = request.body as WorkUpdateProps;
      logger.info(`Recebida requisição para atualizar trabalho ID: ${id}`);
      const workService = new WorkUpdateService();
      const workUpdate = await workService.execute({ id, name, description, price });
      response.send(workUpdate);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

export { WorkCreateController, WorkDeleteController, WorkGetController, WorkGetFilteredController, WorkUpdateController };
