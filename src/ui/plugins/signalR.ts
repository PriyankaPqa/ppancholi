/* eslint-disable */
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import Vue from "vue";
import { IMassActionEntityData, MassActionRunStatus } from "@/entities/mass-action";
import _orderBy from "lodash/orderBy";
import { i18n } from "@/ui/plugins/i18n";
import { IStorage } from '@/store/storage';
import { IEntity } from '@/entities/base';


export class SignalRConnection {
  public connection: HubConnection;
  public logMessages = [] as { messageName: string, count: number, lastMessage: string, lastTime: Date }[];

  constructor(private storage: IStorage) {

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
    this.listenForEventModuleChanges();
    this.listenForProgramModuleChanges();

    // CaseFile
    this.listenForCaseFileModuleChanges();
    this.listenForCaseNoteModuleChanges();
    this.listenForCaseReferralModuleChanges();
    this.listenForCaseDocumentModuleChanges();
    this.listenForFinancialAssistancePaymentModuleChanges();

    // Financial Assistance
    this.listenForFinancialAssistanceModuleChanges();
    this.listenForFinancialAssistanceCategoryModuleChanges();

    // Household
    this.listenForHouseholdModuleChanges();

    // Team
    this.listenForTeamModuleChanges();

    // UserAccount
    this.listenForUserAccountModuleChanges();

    // Mass actions
    this.listenForMassActionsModuleChanges();
    this.massActionNotifications();
  }

  private massActionNotifications() {
    this.connection.on('caseFile.MassActionRunCompleted', (entity: IMassActionEntityData) => {
      const lastRun = _orderBy(entity.runs, 'timestamp', 'desc')[0];
      const currentUserId = this.storage.user.getters.userId();

      const initiatedByCurrentUser = currentUserId === lastRun.lastUpdatedBy || currentUserId === lastRun.createdBy;

      if (lastRun.runStatus === MassActionRunStatus.PreProcessed && initiatedByCurrentUser) {
        Vue.toasted.success(i18n.t('massAction.notification.preprocessed',  { x: entity.name }) as string)
      }

      if (lastRun.runStatus === MassActionRunStatus.Processed && initiatedByCurrentUser) {
        Vue.toasted.success(i18n.t('massAction.notification.processed',  { x: entity.name }) as string)
      }
    });
  }

  private listenForHouseholdModuleChanges() {
    this.listenForChanges('household', 'Household', this.storage.household.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('household', 'HouseholdMetadata', this.storage.household.mutations.setMetadataFromOutsideNotification);
    this.listenForChanges('household', 'Person', this.noAction);
    this.listenForChanges('household', 'PersonMetadata', this.noAction);
  }  

  private listenForProgramModuleChanges() {
    this.listenForChanges('event', 'Program', this.storage.program.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('event', 'ProgramMetadata', this.storage.program.mutations.setMetadataFromOutsideNotification);
  }  

  private listenForUserAccountModuleChanges() {
    this.listenForChanges('userAccount', 'UserAccount', this.storage.userAccount.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('userAccount', 'UserAccountMetadata', this.storage.userAccount.mutations.setMetadataFromOutsideNotification);
  }

  private listenForEventModuleChanges() {
    this.listenForChanges('event', 'Event', this.storage.event.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('event', 'EventMetadata', this.storage.event.mutations.setMetadataFromOutsideNotification);
  }

  private listenForTeamModuleChanges() {
    this.listenForChanges('team', 'Team', this.storage.team.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('team', 'TeamMetadata', this.storage.team.mutations.setMetadataFromOutsideNotification);
  }

  private listenForMassActionsModuleChanges() {
    this.listenForChanges('caseFile', 'MassAction', this.storage.massAction.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('caseFile', 'MassActionMetadata', this.storage.massAction.mutations.setMetadataFromOutsideNotification);
  }

  private listenForCaseFileModuleChanges() {
    this.listenForChanges('caseFile', 'CaseFile', this.storage.caseFile.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('caseFile', 'CaseFileMetadata', this.storage.caseFile.mutations.setMetadataFromOutsideNotification);
    this.listenForChanges('caseFile', 'CaseFileActivity', this.noAction);
  }
  
  private listenForCaseNoteModuleChanges() {
    this.listenForChanges('caseFile', 'CaseNote', this.storage.caseNote.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('caseFile', 'CaseNoteMetadata', this.storage.caseNote.mutations.setMetadataFromOutsideNotification);
  }

  private listenForCaseReferralModuleChanges() {
    this.listenForChanges('caseFile', 'Referral', this.storage.caseFileReferral.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('caseFile', 'ReferralMetadata', this.storage.caseFileReferral.mutations.setMetadataFromOutsideNotification);
  }

  private listenForFinancialAssistancePaymentModuleChanges() {
    this.listenForChanges('finance', 'FinancialAssistancePayment', this.storage.financialAssistancePayment.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('finance', 'FinancialAssistancePaymentMetadata', this.storage.financialAssistancePayment.mutations.setMetadataFromOutsideNotification);
  }

  private listenForCaseDocumentModuleChanges() {
    this.listenForChanges('caseFile', 'Document', this.storage.caseFileDocument.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('caseFile', 'DocumentMetadata', this.storage.caseFileDocument.mutations.setMetadataFromOutsideNotification);
  }

  private listenForFinancialAssistanceModuleChanges() {
    this.listenForChanges('finance', 'FinancialAssistanceTable', this.storage.financialAssistance.mutations.setEntityFromOutsideNotification);
    this.listenForChanges('finance', 'FinancialAssistanceTableMetadata', this.storage.financialAssistance.mutations.setMetadataFromOutsideNotification);
  }

  private listenForFinancialAssistanceCategoryModuleChanges() {
    this.listenForChanges('finance', 'FinancialAssistanceCategories', this.storage.financialAssistanceCategory.mutations.setEntityFromOutsideNotification);
  }

  private listenForChanges<T extends IEntity>(domain: string, entityName: string, action?: (entity: T) => void) {
    this.connection.on(`${domain}.${entityName}Updated`, (entity) => {
      if (action) action(entity);
      this.log(`${domain}.${entityName}Updated`, entity);
    });

    this.connection.on(`${domain}.${entityName}Created`, (entity) => {
      if (action) action(entity);
      this.log(`${domain}.${entityName}Created`, entity);
    });
  }

  private log(name: string, message: any) {
    console.log(name, message.id || message);
    let entry = this.logMessages.find((m) => m.messageName === name);
    if (!entry) {
      entry = { messageName: name, count: 1, lastMessage: message, lastTime: new Date() };
      this.logMessages.push(entry);
    } else {
      entry.count = entry.count + 1;
      entry.lastMessage = message;
      entry.lastTime = new Date();
    }
  }

  /// used when logging only - can be omitted but it's easier to read...
  private noAction() { }
}

export default (storage: IStorage): SignalRConnection => {
  const connection = new SignalRConnection(storage);

  Vue.mixin({
    beforeCreate() {
      this.$signalR = connection;
    },
  });

  return connection;
};
