import { IEntity } from '../../../entities/base';

export interface IState<T extends IEntity> {
  items: Array<T>;
  newlyCreatedIds: Array<{id: uuid; createdOn: number}>;
  searchLoading: boolean;
  actionLoading: boolean;
}
