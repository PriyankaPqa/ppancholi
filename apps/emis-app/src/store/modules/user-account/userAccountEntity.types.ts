import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IUserAccountEntity } from '@libs/entities-lib/user-account';
import { IState } from '../base/base.types';

export interface IUserAccountEntityState extends IState<IUserAccountEntity> {
  currentUserAccount: IUserAccountEntity;
  roles: IOptionItem[];
  rolesFetched: boolean;
}
