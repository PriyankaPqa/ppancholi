import { IEntity } from '@/entities/base';

export interface IState<T extends IEntity> {
  items: Array<T>
}
