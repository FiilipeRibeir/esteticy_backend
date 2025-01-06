import bcrypt from "bcryptjs";
import HttpError from "../../../config/error";
import prismaClient from "../../../prisma";

interface UserCreateProps {
  name: string;
  nickname: string;
  email: string;
  password: string;
}

interface UserDeleteProps {
  id: string;
}

interface UserUpdateProps {
  id: string; // ID obrigatório para identificar o usuário
  name?: string;
  nickname?: string;
  email?: string;
  password?: string;
}

interface UserGetOneProps {
  email: string;
}

class CreateUserService {
  async execute({ name, nickname, email, password }: UserCreateProps) {
    // Verifica se todos os campos foram preenchidos
    if (!name || !nickname || !email || !password) {
      throw new HttpError("Preencha todos os campos", 400);
    }

    // Valida o formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError("E-mail inválido", 400);
    }

    // Verifica se o e-mail já existe no banco de dados
    const existingUser = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      throw new HttpError("E-mail já cadastrado", 409);
    }

    // Faz o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no banco de dados
    const userCreate = await prismaClient.user.create({
      data: {
        name,
        nickname,
        email,
        password: hashedPassword,
        status: true,
      },
    });

    return userCreate;
  }
}

class DeleteUserService {
  async execute({ id }: UserDeleteProps) {
    // Verifica se o ID foi informado
    if (!id) {
      throw new HttpError("Informe o ID do usuário", 400);
    }

    // Verifica se o usuário existe
    const existingUser = await prismaClient.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingUser) {
      throw new HttpError("Usuário não encontrado", 404);
    }

    // Deleta o usuário
    await prismaClient.user.delete({
      where: {
        id: id,
      },
    });

    return { message: "Usuário deletado com sucesso" };

  }
}

class GetUserService {
  async execute() {
    const users = await prismaClient.user.findMany();
    return users;
  }
}

class UpdatedUserService {
  async execute({ id, name, nickname, email, password }: UserUpdateProps) {
    // Verifica se o ID foi informado
    if (!id) {
      throw new HttpError("Informe o ID do usuário", 400);
    }

    // Verifica se o usuário existe no banco
    const existingUser = await prismaClient.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingUser) {
      throw new HttpError("Usuário não encontrado", 404);
    }

    // Prepara os dados para atualização
    const updateData: Partial<UserUpdateProps> = {};

    if (name) updateData.name = name;
    if (nickname) updateData.nickname = nickname;
    if (email) {
      // Verifica se o e-mail já está em uso por outro usuário
      const emailExists = await prismaClient.user.findUnique({
        where: {
          email: email,
        },
      });

      if (emailExists && emailExists.id !== id) {
        throw new HttpError("E-mail já está em uso", 409);
      }
      updateData.email = email;
    }
    if (password) {
      // Faz o hash da nova senha
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Atualiza o usuário no banco de dados
    const updatedUser = await prismaClient.user.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    return updatedUser;
  }
}

class GetOneUserService {
  async execute({ email }: UserGetOneProps) {
    const user = await prismaClient.user.findUnique({
      where: {
        email: email, 
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado"); // Tratar caso o usuário não exista
    }

    return user;
  }
}


export { CreateUserService, DeleteUserService, GetOneUserService, GetUserService, UpdatedUserService };

