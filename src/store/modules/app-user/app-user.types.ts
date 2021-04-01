import { IAllUserData, IAppUserAzureData, IRolesData } from '@/entities/app-user';

export type IState = {
  allUsers: IAllUserData[];
  appUsers: IAppUserAzureData[];
  roles: IRolesData[];
  allUsersFetched: boolean;
  appUsersFetched: boolean;
  rolesFetched: boolean;
  loading: boolean;
};
