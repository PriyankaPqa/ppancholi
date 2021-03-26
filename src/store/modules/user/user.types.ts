import { IUserData, IFilter } from '@/entities/user';

export interface IState extends IUserData {
  filters: IFilter[]
}
