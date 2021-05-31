import { Store } from 'vuex';
import { IState as IRegistrationState } from '@crctech/registration-lib/src/store/modules/registration/registration.types';
import { IState as IHouseholdState } from '@crctech/registration-lib/src/store/modules/household/household.types';
import { IProvider, IProviderMock } from '@/services/provider';
import { IState as IUserState } from './modules/user/user.types';
import { IState as IUserAccountState } from './modules/user-account/user-account.types';
import { IState as ICaseFileState } from './modules/case-file/case-file.types';
import { IState as IDashboardState } from './modules/dashboard/dashboard.types';
import { IState as IEventState } from './modules/event/event.types';
import { IState as IOptionListState } from './modules/optionList/optionList.types';
import { IState as ITeamState } from './modules/team/team.types';
import { IState as IAppUserState } from './modules/app-user/app-user.types';
import { IState as IProgramState } from './modules/program/program.types';

export interface IRootState {
  version: string;
  user?: IUserState;
  userAccount?: IUserAccountState;
  caseFile?: ICaseFileState;
  dashboard?: IDashboardState;
  event?: IEventState;
  optionList?: IOptionListState;
  team?: ITeamState;
  appUser?: IAppUserState;
  program?: IProgramState;
  registration?: IRegistrationState;
  household?: IHouseholdState;
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
}
