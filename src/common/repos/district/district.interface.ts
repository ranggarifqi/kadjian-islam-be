import { IProvince } from '../province/province.interface';

export interface IDistrict {
  id: string;
  provinceId: string;
  name: string;

  Province?: IProvince;
}
