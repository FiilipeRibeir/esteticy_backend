import bcrypt from "bcryptjs";
import { HttpError } from "../../../config/error";
import prismaClient from "../../../prisma";
import { UserCreateProps, UserDeleteProps, UserGetOneProps, UserUpdateProps } from "../model/user_interface";
import logger from "../../../config/logger";

// Criação de usuário
class CreateUserService {
  async execute({ name, nickname, email, password }: UserCreateProps) {
    logger.info(`Tentativa de criação de usuário: ${email}`);

    if (!name || !nickname || !email || !password) {
      logger.warn("Tentativa de criação de usuário com campos vazios.");
      throw new HttpError("Preencha todos os campos", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn(`E-mail inválido: ${email}`);
      throw new HttpError("E-mail inválido", 400);
    }

    if (password.length < 8) {
      logger.warn(`Senha fraca para o e-mail: ${email}`);
      throw new HttpError("A senha deve ter pelo menos 8 caracteres", 400);
    }

    const existingUser = await prismaClient.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn(`E-mail já cadastrado: ${email}`);
      throw new HttpError("E-mail já cadastrado", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCreate = await prismaClient.user.create({
      data: { name, nickname, email, password: hashedPassword, status: true },
    });

    logger.info(`Usuário criado com sucesso: ${email}`);
    return userCreate;
  }
}

// Deletar usuário
class DeleteUserService {
  async execute({ id }: UserDeleteProps) {
    logger.info(`Tentativa de deletar usuário ID: ${id}`);

    if (!id) {
      logger.warn("ID do usuário não fornecido.");
      throw new HttpError("Informe o ID do usuário", 400);
    }

    const existingUser = await prismaClient.user.findUnique({ where: { id } });
    if (!existingUser) {
      logger.warn(`Usuário não encontrado: ${id}`);
      throw new HttpError("Usuário não encontrado", 404);
    }

    if (!existingUser.status) {
      logger.warn(`Tentativa de deletar usuário desativado: ${id}`);
      throw new HttpError("Usuário desativado, não é possível deletá-lo", 400);
    }

    await prismaClient.user.delete({ where: { id } });
    logger.info(`Usuário deletado com sucesso: ${id}`);

    return { message: "Usuário deletado com sucesso" };
  }
}

// Listar usuários
class GetUserService {
  async execute(page = 1, pageSize = 10) {
    logger.debug(`Listando usuários - Página: ${page}, Tamanho: ${pageSize}`);

    const users = await prismaClient.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return users;
  }
}

// Atualizar usuário
class UpdatedUserService {
  async execute({ id, name, nickname, email, password }: UserUpdateProps) {
    logger.info(`Tentativa de atualizar usuário ID: ${id}`);

    if (!id) {
      logger.warn("ID do usuário não fornecido.");
      throw new HttpError("Informe o ID do usuário", 400);
    }

    const existingUser = await prismaClient.user.findUnique({ where: { id } });
    if (!existingUser) {
      logger.warn(`Usuário não encontrado: ${id}`);
      throw new HttpError("Usuário não encontrado", 404);
    }

    const updateData: Partial<UserUpdateProps> = {};
    if (name) updateData.name = name;
    if (nickname) updateData.nickname = nickname;
    if (email) {
      const emailExists = await prismaClient.user.findUnique({ where: { email } });
      if (emailExists && emailExists.id !== id) {
        logger.warn(`E-mail já está em uso: ${email}`);
        throw new HttpError("E-mail já está em uso", 409);
      }
      updateData.email = email;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prismaClient.user.update({ where: { id }, data: updateData });
    logger.info(`Usuário atualizado com sucesso: ${id}`);

    return updatedUser;
  }
}

// Buscar usuário por e-mail
class GetOneUserService {
  async execute({ email }: UserGetOneProps) {
    logger.debug(`Buscando usuário por e-mail: ${email}`);

    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      logger.warn(`Usuário não encontrado: ${email}`);
      throw new HttpError("Usuário não encontrado", 404);
    }

    return user;
  }
}

export { CreateUserService, DeleteUserService, GetOneUserService, GetUserService, UpdatedUserService };
