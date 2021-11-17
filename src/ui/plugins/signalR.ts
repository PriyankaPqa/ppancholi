/* eslint-disable */
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import {IRootState} from '@/store';
import {HubConnection, HubConnectionBuilder} from '@microsoft/signalr';
import {Store} from 'vuex';
import Vue from "vue";
import {IMassActionEntityData, MassActionRunStatus} from "@/entities/mass-action";
import _orderBy from "lodash/orderBy";
import * as vuexModule from '@/constants/vuex-modules';
import {i18n} from "@/ui/plugins/i18n";


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
            return tokenResponse?.accessToken;
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

    // CaseFile
    this.listenForEntityChanges('caseFile', 'CaseFile');
    this.listenForMetadataChanges('caseFile', 'CaseFileMetadata');
    this.listenForEntityChanges('caseFile', 'CaseNote');
    this.listenForMetadataChanges('caseFile', 'CaseNoteMetadata');
    this.listenForEntityChanges('caseFile', 'Referral');
    this.listenForMetadataChanges('caseFile', 'ReferralMetadata');

    // Household
    this.listenForEntityChanges('household', 'Household');
    this.listenForMetadataChanges('household', 'HouseholdMetadata');

    // Team
    this.listenForEntityChanges('team', 'Team');
    this.listenForMetadataChanges('team', 'TeamMetadata');

    // UserAccount
    this.listenForEntityChanges('userAccount', 'UserAccount');
    this.listenForMetadataChanges('userAccount', 'UserAccountMetadata');

    // Mass actions
    this.listenForMassActionsChanges();
    this.massActionNotifications();
  }

  private massActionNotifications() {
    this.connection.on('caseFile.MassActionRunCompleted', (entity: IMassActionEntityData) => {
      const lastRun = _orderBy(entity.runs, 'timestamp', 'desc')[0];
      const currentUserId = this.store.getters['user/userId'];

      const initiatedByCurrentUser = currentUserId === lastRun.lastUpdatedBy || currentUserId === lastRun.createdBy;

      if (lastRun.runStatus === MassActionRunStatus.PreProcessed && initiatedByCurrentUser) {
        Vue.toasted.success(i18n.t('massAction.notification.preprocessed',  { x: entity.name }) as string)
      }

      if (lastRun.runStatus === MassActionRunStatus.Processed && initiatedByCurrentUser) {
        Vue.toasted.success(i18n.t('massAction.notification.processed',  { x: entity.name }) as string)
      }
    });
  }

  private listenForMassActionsChanges() {
    this.listenForEntityChanges('caseFile', 'MassAction', vuexModule.MASS_ACTION_ENTITIES);
    this.listenForMetadataChanges('caseFile', 'MassActionMetadata', vuexModule.MASS_ACTION_METADATA);
  }

  private listenForEntityChanges(domain: string, entityName: string, vuexModuleName = domain) {
    const target = vuexModuleName === domain ? `${vuexModuleName}Entities` : vuexModuleName;

    this.connection.on(`${domain}.${entityName}Updated`, (entity) => {
      this.store.commit(`${target}/set`, entity);
      // console.log(`${domain}.${entityName}Updated`, entity);
    });

    this.connection.on(`${domain}.${entityName}Created`, (entity) => {
      // console.log(`${domain}.${entityName}Created`, entity);
      this.store.commit(`${target}/set`, entity);
    });
  }

  private listenForMetadataChanges(domain: string, entityName: string,  vuexModuleName = domain) {
    const target = vuexModuleName === domain ? `${vuexModuleName}Metadata` : vuexModuleName;

    this.connection.on(`${domain}.${entityName}Updated`, (entity) => {
      // console.log(`${domain}.${entityName}Updated`, entity);
      this.store.commit(`${target}/set`, entity);
    });

    this.connection.on(`${domain}.${entityName}Created`, (entity) => {
      // console.log(`${domain}.${entityName}Created`, entity);
      this.store.commit(`${target}/set`, entity);
    });
  }
}

export default (store: Store<IRootState>) => new SignalRConnection(store);
