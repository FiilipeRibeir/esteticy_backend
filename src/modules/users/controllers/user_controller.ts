import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserService, DeleteUserService, GetOneUserService, GetUserService, UpdatedUserService } from "../services/user_service";


class UserCreateController {
  async handle(request: FastifyRequest, response: FastifyReply) {

    const userService = new CreateUserService();

    const { name, nickname, email, password } = request.body as { name: string; nickname: string; email: string; password: string };
    const userCreate = await userService.execute({ name, nickname, email, password });

    response.send(userCreate);
  }
}

class UserDeleteController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    const { id } = request.query as { id: string };

    const deleteUserService = new DeleteUserService();
    const userDelete = await deleteUserService.execute({ id });

    response.send(userDelete);
  }
}

class UserGetController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    const getUserService = new GetUserService();
    const users = await getUserService.execute();

    response.send(users);
  }
}

class UserUpdateController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    const { id } = request.query as { id: string };

    const updateUserService = new UpdatedUserService();
    const { name, nickname, email, password } = request.body as { name: string; nickname: string; email: string; password: string };
    const userUpdate = await updateUserService.execute({ id, name, nickname, email, password });

    response.send(userUpdate);
  }
}

class UserGetOneController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    const { email } = request.query as { email: string };

    const getUserService = new GetOneUserService();
    const user = await getUserService.execute({ email });

    response.send(user);
  }
}

export { UserCreateController, UserDeleteController, UserGetController, UserGetOneController, UserUpdateController };

