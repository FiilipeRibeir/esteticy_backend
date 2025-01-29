import { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../../../config/error"; // Importando HttpError para validar erros customizados
import { CreateUserService, DeleteUserService, GetOneUserService, GetUserService, UpdatedUserService } from "../services/user_service";

class UserCreateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    const userService = new CreateUserService();
    const { name, nickname, email, password } = request.body as { name: string; nickname: string; email: string; password: string };

    try {
      const userCreate = await userService.execute({ name, nickname, email, password });
      response.send(userCreate);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class UserDeleteController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    const { id } = request.query as { id: string };
    const deleteUserService = new DeleteUserService();

    try {
      const userDelete = await deleteUserService.execute({ id });
      response.send(userDelete);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class UserGetController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    const { page, pageSize } = request.query as { page?: number; pageSize?: number };
    const getUserService = new GetUserService();

    try {
      const users = await getUserService.execute(page ?? 1, pageSize ?? 10);
      response.send(users);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class UserUpdateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    const { id } = request.query as { id: string };
    const updateUserService = new UpdatedUserService();
    const { name, nickname, email, password } = request.body as { name: string; nickname: string; email: string; password: string };

    try {
      const userUpdate = await updateUserService.execute({ id, name, nickname, email, password });
      response.send(userUpdate);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

class UserGetOneController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    const { email } = request.query as { email: string };
    const getUserService = new GetOneUserService();

    try {
      const user = await getUserService.execute({ email });
      response.send(user);
    } catch (error) {
      if (error instanceof HttpError) {
        response.status(error.statusCode).send({ message: error.message });
      } else {
        response.status(500).send({ message: "Erro interno no servidor" });
      }
    }
  }
}

export { UserCreateController, UserDeleteController, UserGetController, UserGetOneController, UserUpdateController };
