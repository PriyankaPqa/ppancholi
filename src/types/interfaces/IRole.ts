import { IMultilingual } from './IMultilingual';

export interface IRole {
  id: string;
  name: IMultilingual;
  dashboardComponent: string;
  resourceStatus: string;
}
