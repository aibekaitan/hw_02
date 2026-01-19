import { NextFunction, Request, Response } from 'express';
import { HttpStatuses } from '../../common/types/httpStatuses';
import { usersRepository } from '../../users/infrastructure/user.repository';
import { randomUUID } from 'crypto';
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/emailExamples';

export const passwordRecoveryMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

  const user = await usersRepository.findByLoginOrEmail(email);
  if (!user) {
    return res.sendStatus(HttpStatuses.NoContent);
  }

  user.passwordRecoveryCode = randomUUID();
  await usersRepository.updatePasswordRecoveryCode(
    user._id,
    user.passwordRecoveryCode,
  );

  await nodemailerService.sendEmail(
    user.email,
    user.passwordRecoveryCode,
    emailExamples.passwordRecoveryEmail,
  );

  res.sendStatus(HttpStatuses.NoContent);

  next();
};
