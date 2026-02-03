import { Request, Response, Router } from 'express';
import { AuthService } from '../domain/auth.service';
import { ResultStatus } from '../../common/result/resultCode';
import { resultCodeToHttpException } from '../../common/result/resultCodeToHttpException';
import { HttpStatuses } from '../../common/types/httpStatuses';
import { authControllerInstance } from '../../composition-root';

export class AuthController {
  constructor(protected authService: AuthService) {}

  async login(req: Request, res: Response) {
    const { loginOrEmail, password } = req.body;

    const ip = req.ip || 'unknown';
    const title = req.headers['user-agent'] || 'Unknown device';

    const result = await this.authService.loginUser(
      loginOrEmail,
      password,
      ip,
      title,
    );

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json({ errorsMessages: result.extensions ?? [] });
    }

    const { accessToken, refreshToken } = result.data!;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.status(HttpStatuses.Success).json({ accessToken });
  }
  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    const result = await this.authService.refreshTokens(refreshToken);

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json({ errorsMessages: result.extensions ?? [] });
    }

    const { accessToken, refreshToken: newRefreshToken } = result.data!;

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.status(HttpStatuses.Success).json({ accessToken });
  }
  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const result = await this.authService.logout(refreshToken);

    if (result.status !== ResultStatus.Success) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.sendStatus(HttpStatuses.NoContent);
  }
  async registration(req: Request, res: Response) {
    const { login, email, password } = req.body;

    const result = await this.authService.registerUser(login, password, email);

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json({ errorsMessages: result.extensions ?? [] });
    }

    res.sendStatus(HttpStatuses.NoContent);
  }
  async passwordRecovery(req: Request, res: Response) {
    const { email } = req.body;
    await this.authService.passwordRecovery(email);
    res.sendStatus(HttpStatuses.NoContent);
  }
  async registrationConfirmation(req: Request, res: Response) {
    const { code } = req.body;

    const result = await this.authService.confirmEmail(code);

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json({ errorsMessages: result.extensions ?? [] });
    }

    res.sendStatus(HttpStatuses.NoContent);
  }
  async newPassword(req: Request, res: Response) {
    const { recoveryCode, newPassword } = req.body;

    const result = await this.authService.changePassword(
      recoveryCode,
      newPassword,
    );

    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .json({ errorsMessages: result.extensions ?? [] });
    }

    res.sendStatus(HttpStatuses.NoContent);
  }
  async registrationEmailResending(req: Request, res: Response) {
    const { email } = req.body;

    const result = await this.authService.resendRegistrationEmail(email);
    if (!result.success) {
      return res.status(HttpStatuses.BadRequest).json({
        errorsMessages: [{ field: 'email', message: result.error }],
      });
    }
    res.sendStatus(HttpStatuses.NoContent);
  }
  async getMe(req: Request, res: Response) {
    const userId = req.user?.id as string;
    const result = await this.authService.getMe(userId);

    if (result.status !== ResultStatus.Success) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    res.status(HttpStatuses.Success).send(result.user);
  }
}
