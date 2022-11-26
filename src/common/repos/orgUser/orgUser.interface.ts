export enum EOrgUserRole {
  ADMIN = 'Admin',
  MEMBER = 'Member',
}

export interface IOrgUser {
  id: string;
  userId: string;
  organisationId: string;
  orgUserRole: string;
  isSelected: boolean;
}

export abstract class IOrgUserRepository {
  abstract findByUserId(userId: string): Promise<IOrgUser[]>;
}
