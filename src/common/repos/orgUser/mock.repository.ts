import { OrgUserFactory } from 'src/common/testUtil/factories';
import { IOrgUser, IOrgUserRepository } from './orgUser.interface';

export class MockOrgUserRepository extends IOrgUserRepository {
  findByUserId(userId: string): Promise<IOrgUser[]> {
    const dummy = OrgUserFactory.getDummyData({ userId });
    return Promise.resolve([dummy]);
  }

  findByMainKey(
    userId: string,
    organisationId: string,
  ): Promise<IOrgUser | null> {
    const dummy = OrgUserFactory.getDummyData({ userId, organisationId });
    return Promise.resolve(dummy);
  }

  selectOrgByMainKey(
    userId: string,
    organisationId: string,
  ): Promise<IOrgUser[]> {
    const dummy = OrgUserFactory.getDummyData({ userId, organisationId });
    return Promise.resolve([dummy]);
  }
}
