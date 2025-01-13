import HttpError from "../../../config/error";
import prismaClient from "../../../prisma";
import { WorkCreateProps, WorkDeleteProps, WorkGetOneProps, WorkUpdateProps } from "../model/work_interfaces";

class WorkCreateService {
  async execute({ userId, name, description, price }: WorkCreateProps) {
    // Validação de campos obrigatórios
    if (!userId || !name || !price) {
      throw new HttpError("Usuário, name e preço são obrigatórios", 400);
    }

    // Verificar se o usuário existe
    const existingUser = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      throw new HttpError("Usuário não encontrado", 404);
    }

    // Criar o trabalho
    const work = await prismaClient.work.create({
      data: {
        userId,
        name,
        description,
        price: price,
      },
    });

    return work;
  }
}

class WorkDeleteService {
  async execute({ id }: WorkDeleteProps) {
    if (!id) {
      throw new HttpError("Informe o ID do trabalho", 400);
    }

    const existingWork = await prismaClient.work.findUnique({ where: { id } });
    if (!existingWork) {
      throw new HttpError("Trabalho não encontrado", 404);
    }

    const work = await prismaClient.work.delete({ where: { id } });

    return work;
  }
}

class WorkGetService {
  async execute() {
    const works = await prismaClient.work.findMany();
    return works;
  }
}

class WorkGetFilteredService {
  async execute({ userId, name, description, price }: WorkGetOneProps) {
    // Inicializa o objeto `where` para os filtros
    const where: any = {};

    // Adiciona filtros condicionalmente, se os parâmetros forem fornecidos
    if (name) {
      where.name = {
        contains: name, // Filtro que verifica se o nome contém a string fornecida
        mode: 'insensitive', // Ignora maiúsculas/minúsculas
      };
    }

    if (description) {
      where.description = {
        contains: description, // Filtro que verifica se a descrição contém a string fornecida
        mode: 'insensitive', // Ignora maiúsculas/minúsculas
      };
    }

    if (userId) {
      where.userId = userId;
    }

    if (price !== undefined && price !== null) {
      const parsedPrice = parseFloat(price.toString());
      if (isNaN(parsedPrice)) {
        throw new HttpError("O preço deve ser um número válido", 400);
      }
      where.price = parsedPrice; // Filtro exato para o preço
    }

    // Realiza a consulta no banco de dados com os filtros aplicados
    const works = await prismaClient.work.findMany({ where });

    return works;
  }
}

class WorkUpdateService {
  async execute({ id, name, description, price }: WorkUpdateProps) {
    if (!id) {
      throw new HttpError("Informe o ID do trabalho", 400);
    }

    const existingWork = await prismaClient.work.findUnique({ where: { id } });
    if (!existingWork) {
      throw new HttpError("Trabalho não encontrado", 404);
    }

    const work = await prismaClient.work.update({
      where: { id },
      data: {
        name,
        description,
        price,
      },
    });

    return work;
  }
}

export { WorkCreateService, WorkDeleteService, WorkGetFilteredService, WorkGetService, WorkUpdateService };