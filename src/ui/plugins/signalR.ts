/* eslint-disable no-console */
import _orderBy from 'lodash/orderBy';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import Vue from 'vue';
import { AuthenticationResult } from '@azure/msal-browser';
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import { IMassActionEntityData, MassActionRunStatus } from '@/entities/mass-action';
import { i18n } from '@/ui/plugins/i18n';
import { IStorage } from '@/store/storage';
import { IEntity } from '@/entities/base';

export class SignalR {
  private static _instance: SignalR;

  public connection: HubConnection;

  public logMessages = [] as { messageName: string, count: number, lastMessage: string, lastTime: Date }[];

  private constructor(private storage: IStorage) {
  }

  public static Initialize(storage: IStorage) {
    SignalR._instance = new SignalR(storage);
    Vue.mixin({
      beforeCreate() {
        this.$signalR = SignalR.instance;
      },
    });

    return SignalR.instance;
  }

  static get instance() {
    return SignalR._instance;
  }

  public async buildHubConnection() {
    const isSignedIn = await AuthenticationProvider.isSignedIn();

    if (isSignedIn) {
      const connection = new HubConnectionBuilder()
        // .configureLogging(LogLevel.Debug)
        .withUrl(process.env.VUE_APP_SIGNALR_CONNECTION_HUB_URI, {
          accessTokenFactory: async () => {
            const tokenResponse = await AuthenticationProvider.acquireToken() as AuthenticationResult;
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
        Vue.toasted.success(i18n.t('massAction.notification.preprocessed', { x: entity.name }) as string);
      }

      if (lastRun.runStatus === MassActionRunStatus.Processed && initiatedByCurrentUser) {
        Vue.toasted.success(i18n.t('massAction.notification.processed', { x: entity.name }) as string);
      }
    });
  }

  private listenForHouseholdModuleChanges() {
    this.listenForChanges({
      domain: 'household',
      entityName: 'Household',
      action: this.storage.household.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'household',
      entityName: 'HouseholdMetadata',
      action: this.storage.household.mutations.setMetadataFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'household',
      entityName: 'Person',
      action: this.noAction,
    });

    this.listenForChanges({
      domain: 'household',
      entityName: 'PersonMetadata',
      action: this.noAction,
    });
  }

  private listenForProgramModuleChanges() {
    this.listenForChanges({
      domain: 'event',
      entityName: 'Program',
      action: this.storage.program.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'event',
      entityName: 'ProgramMetadata',
      action: this.storage.program.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForUserAccountModuleChanges() {
    this.listenForChanges({
      domain: 'userAccount',
      entityName: 'UserAccount',
      action: this.storage.userAccount.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'userAccount',
      entityName: 'UserAccountMetadata',
      action: this.storage.userAccount.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForEventModuleChanges() {
    this.listenForChanges({
      domain: 'event',
      entityName: 'Event',
      action: this.storage.event.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'event',
      entityName: 'EventMetadata',
      action: this.storage.event.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForTeamModuleChanges() {
    this.listenForChanges({
      domain: 'team',
      entityName: 'Team',
      action: this.storage.team.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'team',
      entityName: 'TeamMetadata',
      action: this.storage.team.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForMassActionsModuleChanges() {
    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'MassAction',
      action: this.storage.massAction.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'MassActionMetadata',
      action: this.storage.massAction.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForCaseFileModuleChanges() {
    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'CaseFile',
      action: this.storage.caseFile.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'CaseFileMetadata',
      action: this.storage.caseFile.mutations.setMetadataFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'CaseFileActivity',
      action: this.noAction,
    });
  }

  private listenForCaseNoteModuleChanges() {
    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'CaseNote',
      action: this.storage.caseNote.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'CaseNoteMetadata',
      action: this.storage.caseNote.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForCaseReferralModuleChanges() {
    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'Referral',
      action: this.storage.caseFileReferral.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'ReferralMetadata',
      action: this.storage.caseFileReferral.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForFinancialAssistancePaymentModuleChanges() {
    this.listenForChanges({
      domain: 'finance',
      entityName: 'FinancialAssistancePayment',
      action: this.storage.financialAssistancePayment.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'finance',
      entityName: 'FinancialAssistancePaymentMetadata',
      action: this.storage.financialAssistancePayment.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForCaseDocumentModuleChanges() {
    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'Document',
      action: this.storage.caseFileDocument.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'caseFile',
      entityName: 'DocumentMetadata',
      action: this.storage.caseFileDocument.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForFinancialAssistanceModuleChanges() {
    this.listenForChanges({
      domain: 'finance',
      entityName: 'FinancialAssistanceTable',
      action: this.storage.financialAssistance.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'finance',
      entityName: 'FinancialAssistanceTableMetadata',
      action: this.storage.financialAssistance.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForFinancialAssistanceCategoryModuleChanges() {
    this.listenForChanges({
      domain: 'finance',
      entityName: 'FinancialAssistanceCategories',
      action: this.storage.financialAssistanceCategory.mutations.setEntityFromOutsideNotification,
    });
  }

  private listenForChanges<T extends IEntity>(
    { domain, entityName, action }: {domain: string, entityName: string, action?: (entity: T)=> void},
  ) {
    this.connection.on(`${domain}.${entityName}Updated`, (entity) => {
      if (action) {
        action(entity);
      }
      this.log(`${domain}.${entityName}Updated`, entity);
    });

    this.connection.on(`${domain}.${entityName}Created`, (entity) => {
      if (action) {
        action(entity);
      }
      this.log(`${domain}.${entityName}Created`, entity);
    });
  }

  // eslint-disable-next-line
  private log(name: string, message: any) {
    console.log(name, message.id || message);
    let entry = this.logMessages.find((m) => m.messageName === name);
    if (!entry) {
      entry = {
        messageName: name, count: 1, lastMessage: message, lastTime: new Date(),
      };
      this.logMessages.push(entry);
    } else {
      entry.count += 1;
      entry.lastMessage = message;
      entry.lastTime = new Date();
    }
  }

  /// used when logging only - can be omitted but it's easier to read...
  // eslint-disable-next-line
  private noAction() { }
}

export default SignalR;
