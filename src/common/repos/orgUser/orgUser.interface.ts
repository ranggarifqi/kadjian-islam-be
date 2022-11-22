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
