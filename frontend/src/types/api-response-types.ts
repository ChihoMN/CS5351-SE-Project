export type AuthJwtPayload = {
  id: string;
  sub: string;
  emailVerified: boolean;
  role: string;
  activeOrganizationId: string;
  image: string;
  name: string | null;
  email: string;
  iat: number;
  iss: string;
  aud: string;
  exp: number;
};
