import { FastifyInstance } from "fastify";
import { UserCreateController, UserDeleteController, UserGetController, UserGetOneController, UserUpdateController } from "../../modules/users/controllers/user_controller";

async function userRoutes(app: FastifyInstance) {
  // Rota POST para criação de usuário
  app.post("/user", async (request, reply) => {
    return new UserCreateController().handle(request, reply);
  });

  app.delete("/user", async (request, reply) => {
    return new UserDeleteController().handle(request, reply);
  });

  // Rota GET para listar todos os usuários
  app.get("/user", async (request, reply) => {
    if ((request.query as { email: string }).email) {
      // Se o parâmetro de email estiver presente, busca um usuário específico
      return new UserGetOneController().handle(request, reply);
    }
    // Caso contrário, busca todos os usuários
    return new UserGetController().handle(request, reply);
  });

  app.put("/user", async (request, reply) => {
    return new UserUpdateController().handle(request, reply);
  });
}

export default userRoutes;
