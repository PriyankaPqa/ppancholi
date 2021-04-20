import { Store } from 'vuex';
import { IState as IUserState } from './modules/user/user.types';
import { IState as ICaseFileState } from './modules/case-file/case-file.types';
import { IState as IDashboardState } from './modules/dashboard/dashboard.types';
import { IState as IEventState } from './modules/event/event.types';
import { IState as IOptionListState } from './modules/optionList/optionList.types';
import { IState as ITeamState } from './modules/team/team.types';
import { IState as IAppUserState } from './modules/app-user/app-user.types';

export interface IRootState {
  version: string;
  user?: IUserState;
  caseFile?: ICaseFileState;
  dashboard?: IDashboardState;
  event?: IEventState;
  optionList?: IOptionListState;
  team?: ITeamState;
  appUser?: IAppUserState;
}

export type IState = IRootState;

export type IStore = Store<IState>
