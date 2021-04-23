import { Store } from 'vuex';
import { IState as IRegistrationState } from '@crctech/registration-lib/src/store/modules/registration/registration.types';
import { IState as IBeneficiaryState } from '@crctech/registration-lib/src/store/modules/beneficiary/beneficiary.types';
import { IProvider, IProviderMock } from '@/services/provider';
import { IState as IUserState } from './modules/user/user.types';
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
  caseFile?: ICaseFileState;
  dashboard?: IDashboardState;
  event?: IEventState;
  optionList?: IOptionListState;
  team?: ITeamState;
  appUser?: IAppUserState;
  program?: IProgramState;
  registration?: IRegistrationState;
  beneficiary?: IBeneficiaryState;
}

export type IState = IRootState;

export interface IStore<S> extends Store<S> {
  $services: IProvider | IProviderMock;
}
