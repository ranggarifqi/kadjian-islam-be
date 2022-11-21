import { IOrgRequest } from 'src/common/repos/orgRequest';
import { RegisterOrgDto } from '../organisation.dto';

export abstract class BaseOrgCreationService {
  abstract createOrgRequest(
    payload: RegisterOrgDto,
    creatorId: string,
  ): Promise<IOrgRequest>;
}
