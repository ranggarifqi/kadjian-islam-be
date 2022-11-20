import { IOrgRequest, IOrgRequestCreation } from 'src/common/repos/orgRequest';

export abstract class BaseOrgCreationService {
  abstract createOrgRequest(
    payload: IOrgRequestCreation,
    creatorId: string,
  ): Promise<IOrgRequest>;
}
