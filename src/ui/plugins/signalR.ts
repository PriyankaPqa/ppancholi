import { LogLevel, HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import AuthenticationProvider from '@/auth/AuthenticationProvider';

export class SignalRConnection {
  private connection: HubConnection;

  private store;

  private EVENT_CREATED = 'event.EventCreated';

  constructor(store: Store<IRootState>) {
    this.store = store;

    this.buildHubConnection();
  }

  private async buildHubConnection() {
    const isSignedIn = await AuthenticationProvider.isSignedIn();

    if (isSignedIn) {
      const connection = new HubConnectionBuilder()
        .configureLogging(LogLevel.Debug)
        .withUrl(process.env.VUE_APP_SIGNALR_CONNECTION_HUB_URI, {
          accessTokenFactory: async () => {
            const tokenResponse = await AuthenticationProvider.acquireToken();
            return tokenResponse.accessToken;
          },
        })
        .build();

      connection.start();

      this.connection = connection;

      this.createBindings();
    }
  }

  private createBindings() {
    this.connection.on(this.EVENT_CREATED, (data) => this.store.commit('event/addOrUpdateEvent', data.event));
  }
}

export default (store: Store<IRootState>) => new SignalRConnection(store);
