import { IEntity } from './IEntity';

export interface IResettable extends IEntity {
  reset(): void;
}
