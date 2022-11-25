import { OrgUser } from '@prisma/client';
import { EOrgUserRole } from 'src/common/repos/orgUser/orgUser.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { TestFactory } from './factory';

export class OrgUserFactory extends TestFactory<OrgUser> {
  static getDummyData = (data?: Partial<OrgUser>): OrgUser => {
    return {
      id: uuidv4(),
      userId: uuidv4(),
      organisationId: uuidv4(),
      isSelected: true,
      orgUserRole: EOrgUserRole.ADMIN,
      ...data,
    };
  };

  constructor(private prismaService: PrismaService) {
    super();
  }

  create(data?: Partial<OrgUser> | undefined): Promise<OrgUser> {
    const dummyData = OrgUserFactory.getDummyData(data);

    return this.prismaService.orgUser.create({
      data: dummyData,
    });
  }
}
