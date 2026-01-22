import { NextFunction, Request, Response } from 'express';
import { HttpStatuses } from '../../common/types/httpStatuses';
import { usersRepository } from '../../users/infrastructure/user.repository';
import { randomUUID } from 'crypto';
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/emailExamples';

export const emailResendingController = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await usersRepository.findByLoginOrEmail(email);
  if (!user) {
    return res.status(HttpStatuses.BadRequest).json({
      errorsMessages: [{ field: 'email', message: 'User not found' }],
    });
  }

  if (user.emailConfirmation.isConfirmed) {
    return res.status(HttpStatuses.BadRequest).json({
      errorsMessages: [{ field: 'email', message: 'Email already confirmed' }],
    });
  }

  user.emailConfirmation.confirmationCode = randomUUID();
  await usersRepository.updateConfirmationCode(
    user._id,
    user.emailConfirmation.confirmationCode,
  );

  await nodemailerService.sendEmail(
    user.email,
    user.emailConfirmation.confirmationCode,
    emailExamples.registrationEmail,
  );

  res.sendStatus(HttpStatuses.NoContent);
};
