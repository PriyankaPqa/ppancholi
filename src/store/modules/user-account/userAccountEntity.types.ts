import { IOptionItem } from '@/entities/optionItem';
import { IUserAccountEntity } from '@/entities/user-account';
import { IState } from '../base/base.types';

export interface IUserAccountEntityState extends IState<IUserAccountEntity> {
  currentUserAccount: IUserAccountEntity;
  roles: IOptionItem[];
  rolesFetched: boolean;
}
