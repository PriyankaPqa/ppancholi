import { Store } from 'vuex';
import { IState as IUserState } from './modules/user/user.types';
import { IState as IDashboardState } from './modules/dashboard/dashboard.types';
import { IState as IEventState } from './modules/event/event.types';

export interface IRootState {
  version: string;
  user?: IUserState;
  dashboard?: IDashboardState;
  event?: IEventState;
}

export type IState = IRootState;

export type IStore = Store<IState>
