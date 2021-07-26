/* eslint-disable */
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import { IRootState } from '@/store';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Store } from 'vuex';

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
          },
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
    // Event
    this.listenForEntityChanges('event', 'AgreementType');
    this.listenForEntityChanges('event', 'Event');
    this.listenForMetadataChanges('event', 'EventMetadata');
    this.listenForEntityChanges('event', 'EventType');
    this.listenForEntityChanges('event', 'Program');
    this.listenForMetadataChanges('event', 'ProgramMetadata');

    //CaseFile
    this.listenForEntityChanges('caseFile', 'CaseFile');
    this.listenForMetadataChanges('caseFile', 'CaseFileMetadata');
    this.listenForEntityChanges('caseFile', 'CaseNote');
    this.listenForMetadataChanges('caseFile', 'CaseNoteMetadata');
    this.listenForEntityChanges('caseFile', 'Referral');
    this.listenForMetadataChanges('caseFile', 'ReferralMetadata');
  }

  private listenForEntityChanges(domain: string, entityName: string) {
    this.connection.on(`${domain}.${entityName}Updated`, (entity) => {
      console.log(`${domain}.${entityName}Updated`, entity);
      this.store.commit(`${domain}Entities/set`, entity);
    });

    this.connection.on(`${domain}.${entityName}Created`, (entity) => {
      console.log(`${domain}.${entityName}Created`, entity);
      this.store.commit(`${domain}Entities/set`, entity);
    });
  }

  private listenForMetadataChanges(domain: string, entityName: string) {
    this.connection.on(`${domain}.${entityName}Updated`, (entity) => {
      console.log(`${domain}.${entityName}Updated`, entity);
      this.store.commit(`${domain}Metadata/set`, entity);
    });

    this.connection.on(`${domain}.${entityName}Created`, (entity) => {
      console.log(`${domain}.${entityName}Created`, entity);
      this.store.commit(`${domain}Metadata/set`, entity);
    });
  }
}

export default (store: Store<IRootState>) => new SignalRConnection(store);
