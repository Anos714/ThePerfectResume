export interface LocalAuthUser {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// for login and register response
export interface AuthSuccessResponse {
  success: boolean;
  message: string;
  user?: LocalAuthUser;
  token?: string;
}
