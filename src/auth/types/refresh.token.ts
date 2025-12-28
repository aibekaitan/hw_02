export type RefreshToken = {
  token: string;
  userId: string;
  isValid: boolean;
  expiresAt: Date;
};
