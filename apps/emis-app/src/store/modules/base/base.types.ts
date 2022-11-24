import { IEntity } from '@libs/entities-lib/base';

export interface IState<T extends IEntity> {
  items: Array<T>,
  newlyCreatedIds: Array<{ id: uuid, createdOn: number }>,
  searchLoading: boolean,
  maxTimeInSecondsForNewlyCreatedIds: number,
}
