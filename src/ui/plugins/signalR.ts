/* eslint-disable */
import AuthenticationProvider from "@/auth/AuthenticationProvider";
import { IRootState } from "@/store";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { Store } from "vuex";

export class SignalRConnection {
  private connection: HubConnection;

  private store;

  constructor(store: Store<IRootState>) {
    this.store = store;

    this.buildHubConnection();
  }

  private async buildHubConnection() {
    const isSignedIn = await AuthenticationProvider.isSignedIn();

    if (isSignedIn) {
      const connection = new HubConnectionBuilder()
        // .configureLogging(LogLevel.Debug)
        .withUrl(process.env.VUE_APP_SIGNALR_CONNECTION_HUB_URI, {
          accessTokenFactory: async () => {
            const tokenResponse = await AuthenticationProvider.acquireToken();
            return tokenResponse.accessToken;
          }
        })
        // https://docs.microsoft.com/en-us/aspnet/core/signalr/javascript-client?view=aspnetcore-3.1#reconnect-clients
        .withAutomaticReconnect()
        .build();

      connection.start();

      this.connection = connection;

      this.createBindings();
    }
  }

  private createBindings() {    
    this.listenForEntityChanges('event', 'AgreementType');
    this.listenForEntityChanges('event', 'Event');
    this.listenForEntityChanges('event', 'EventMetadata');
    this.listenForEntityChanges('event', 'EventType');
    this.listenForEntityChanges('event', 'Program');
    this.listenForEntityChanges('event', 'ProgramMetadata');
  }

  private listenForEntityChanges(domain: string, entityName: string) {
    this.connection.on(`${domain}.${entityName}Created`, data => { console.log(`${domain}.${entityName}Created`, data) });
    this.connection.on(`${domain}.${entityName}Updated`, data => { console.log(`${domain}.${entityName}Updated`, data) });    
  }
}

export default (store: Store<IRootState>) => new SignalRConnection(store);
