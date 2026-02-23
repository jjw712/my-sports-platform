export type UserRole = 'GUEST' | 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  role: UserRole;
}
