import { HttpError } from "../../../config/error";
import logger from "../../../config/logger"; // Importando logger
import prismaClient from "../../../prisma";
import { WorkCreateProps, WorkDeleteProps, WorkGetOneProps, WorkUpdateProps } from "../model/work_interfaces";

class WorkCreateService {
  async execute({ userId, name, description, price }: WorkCreateProps) {
    logger.info(`Tentativa de criação de trabalho para usuário: ${userId}`);

    if (!userId || !name || !price) {
      logger.warn("Campos obrigatórios não preenchidos ao criar trabalho.");
      throw new HttpError("Usuário, nome e preço são obrigatórios", 400);
    }

    const existingUser = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      logger.warn(`Usuário não encontrado: ${userId}`);
      throw new HttpError("Usuário não encontrado", 404);
    }

    const work = await prismaClient.work.create({
      data: { userId, name, description, price },
    });

    logger.info(`Trabalho criado com sucesso para usuário: ${userId}`);
    return work;
  }
}

class WorkDeleteService {
  async execute({ id }: WorkDeleteProps) {
    logger.info(`Tentativa de deletar trabalho ID: ${id}`);

    if (!id) {
      logger.warn("ID do trabalho não informado.");
      throw new HttpError("Informe o ID do trabalho", 400);
    }

    const existingWork = await prismaClient.work.findUnique({ where: { id } });
    if (!existingWork) {
      logger.warn(`Trabalho não encontrado: ${id}`);
      throw new HttpError("Trabalho não encontrado", 404);
    }

    await prismaClient.work.delete({ where: { id } });
    logger.info(`Trabalho deletado com sucesso: ${id}`);

    return { message: "Trabalho deletado com sucesso" };
  }
}

class WorkGetService {
  async execute() {
    logger.debug("Listando todos os trabalhos.");
    const works = await prismaClient.work.findMany();
    return works;
  }
}

class WorkGetFilteredService {
  async execute({ userId, name, description, price }: WorkGetOneProps) {
    logger.debug("Filtrando trabalhos com critérios fornecidos.");

    const where: any = {};
    if (name) where.name = { contains: name, mode: "insensitive" };
    if (description) where.description = { contains: description, mode: "insensitive" };
    if (userId) where.userId = userId;
    if (price !== undefined && price !== null) {
      const parsedPrice = parseFloat(price.toString());
      if (isNaN(parsedPrice)) {
        logger.warn("Tentativa de filtro com preço inválido.");
        throw new HttpError("O preço deve ser um número válido", 400);
      }
      where.price = parsedPrice;
    }

    const works = await prismaClient.work.findMany({ where });
    logger.debug(`Encontrados ${works.length} trabalhos com os filtros aplicados.`);
    return works;
  }
}

class WorkUpdateService {
  async execute({ id, name, description, price }: WorkUpdateProps) {
    logger.info(`Tentativa de atualização do trabalho ID: ${id}`);

    if (!id) {
      logger.warn("ID do trabalho não informado.");
      throw new HttpError("Informe o ID do trabalho", 400);
    }

    const existingWork = await prismaClient.work.findUnique({ where: { id } });
    if (!existingWork) {
      logger.warn(`Trabalho não encontrado: ${id}`);
      throw new HttpError("Trabalho não encontrado", 404);
    }

    const work = await prismaClient.work.update({
      where: { id },
      data: { name, description, price },
    });

    logger.info(`Trabalho atualizado com sucesso: ${id}`);
    return work;
  }
}

export { WorkCreateService, WorkDeleteService, WorkGetFilteredService, WorkGetService, WorkUpdateService };
