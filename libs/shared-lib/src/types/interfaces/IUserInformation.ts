import { IMultilingual } from './IMultilingual';

export interface IUserInformation {
  userId: uuid;
  userName: string;
  roleId? : uuid;
  roleName: IMultilingual;
  teamName?: string;
  teamId?: uuid;
}
