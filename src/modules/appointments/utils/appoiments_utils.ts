import HttpError from '../../../config/error';
import prismaClient from '../../../prisma';

async function findAppointmentById(id: string) {
  const existingAppointment = await prismaClient.appointment.findUnique({
    where: { id },
  });

  if (!existingAppointment) {
    throw new HttpError('Compromisso não encontrado', 404);
  }

  return existingAppointment;
}

export default findAppointmentById;