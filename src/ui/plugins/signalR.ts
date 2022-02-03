/* eslint-disable no-console */
import _orderBy from 'lodash/orderBy';
import _camelCase from 'lodash/camelCase';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import Vue from 'vue';
import authenticationProvider from '@/auth/AuthenticationProvider';
import { IMassActionEntityData, MassActionRunStatus } from '@/entities/mass-action';
import { i18n } from '@/ui/plugins/i18n';
import { IStorage } from '@/store/storage';
import { IEntity } from '@/entities/base';

export class SignalR {
  private static _instance: SignalR;

  public connection: HubConnection;

  public logMessages = [] as { messageName: string, count: number, lastMessage: string, lastTime: Date }[];

  private readonly showConsole: boolean;

  private storage: IStorage;

  private constructor({ storage, showConsole }: {storage: IStorage; showConsole: boolean}) {
    this.storage = storage;
    this.showConsole = showConsole;
  }

  public static Initialize({ storage, showConsole }: {storage: IStorage; showConsole: boolean}) {
    SignalR._instance = new SignalR({ storage, showConsole });
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
    // await authenticationProvider.loadAuthModule('signalR');
    const isSignedIn = await authenticationProvider.isAuthenticated();

    if (isSignedIn) {
      const connection = new HubConnectionBuilder()
        // .configureLogging(LogLevel.Debug)
        .withUrl(process.env.VUE_APP_SIGNALR_CONNECTION_HUB_URI, {
          accessTokenFactory: async () => authenticationProvider.accessToken,
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

    this.listenForOptionItemChanges({
      domain: 'household',
      optionItemName: 'ScreeningId',
      cacheResetMutationName: 'setScreeningIdsFetched',
      mutationDomain: 'caseFile',
    });

    this.listenForOptionItemChanges({
      domain: 'household',
      optionItemName: 'Gender',
      cacheResetMutationName: 'setGendersFetched',
      mutationDomain: 'registration',
    });

    this.listenForOptionItemChanges({
      domain: 'household',
      optionItemName: 'PrimarySpokenLanguage',
      cacheResetMutationName: 'setPrimarySpokenLanguagesFetched',
      mutationDomain: 'registration',
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
      domain: 'user-account',
      entityName: 'UserAccount',
      action: this.storage.userAccount.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'user-account',
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

    this.listenForOptionItemChanges({
      domain: 'event',
      optionItemName: 'AgreementType',
      cacheResetMutationName: 'setAgreementTypesFetched',
    });

    this.listenForOptionItemChanges({
      domain: 'event',
      optionItemName: 'EventType',
      cacheResetMutationName: 'setEventTypesFetched',
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
      domain: 'case-file',
      entityName: 'MassAction',
      action: this.storage.massAction.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'MassActionMetadata',
      action: this.storage.massAction.mutations.setMetadataFromOutsideNotification,
    });
  }

  private listenForCaseFileModuleChanges() {
    this.listenForChanges({
      domain: 'case-file',
      entityName: 'CaseFile',
      action: this.storage.caseFile.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'CaseFileMetadata',
      action: this.storage.caseFile.mutations.setMetadataFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'CaseFileActivity',
      action: this.noAction,
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'CloseReason',
      cacheResetMutationName: 'setCloseReasonsFetched',
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'InactiveReason',
      cacheResetMutationName: 'setInactiveReasonsFetched',
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'Tag',
      cacheResetMutationName: 'setTagsOptionsFetched',
    });
  }

  private listenForCaseNoteModuleChanges() {
    this.listenForChanges({
      domain: 'case-file',
      entityName: 'CaseNote',
      action: this.storage.caseNote.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'CaseNoteMetadata',
      action: this.storage.caseNote.mutations.setMetadataFromOutsideNotification,
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'CaseNoteCategory',
      cacheResetMutationName: 'setCaseNoteCategoriesFetched',
      mutationDomain: 'caseNote',
    });
  }

  private listenForCaseReferralModuleChanges() {
    this.listenForChanges({
      domain: 'case-file',
      entityName: 'Referral',
      action: this.storage.caseFileReferral.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'ReferralMetadata',
      action: this.storage.caseFileReferral.mutations.setMetadataFromOutsideNotification,
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'ReferralType',
      cacheResetMutationName: 'setTypesFetched',
      mutationDomain: 'caseFileReferral',
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'ReferralOutcomeStatus',
      cacheResetMutationName: 'setOutcomeStatusesFetched',
      mutationDomain: 'caseFileReferral',
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
      domain: 'case-file',
      entityName: 'Document',
      action: this.storage.caseFileDocument.mutations.setEntityFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'DocumentMetadata',
      action: this.storage.caseFileDocument.mutations.setMetadataFromOutsideNotification,
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'DocumentCategory',
      cacheResetMutationName: 'setCategoriesFetched',
      mutationDomain: 'caseFileDocument',
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
      entityName: 'FinancialAssistanceCategory',
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

  private listenForOptionItemChanges(
    {
      domain, optionItemName, cacheResetMutationName, mutationDomain = null,
    }: {domain: string, optionItemName: string, cacheResetMutationName: string, mutationDomain?: string},
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storage = this.storage as any;
    const storageDomain = mutationDomain || _camelCase(domain);

    this.connection.on(`${domain}.${optionItemName}Updated`, (entity) => {
      if (storage?.[storageDomain]?.mutations?.[cacheResetMutationName]) {
        storage[storageDomain].mutations[cacheResetMutationName](false);

        this.log(`Cache for ${domain}.${optionItemName} reset - entity updated`, entity);
      }
    });

    this.connection.on(`${domain}.${optionItemName}Created`, (entity) => {
      if (storage?.[storageDomain]?.mutations?.[cacheResetMutationName]) {
        storage[storageDomain].mutations[cacheResetMutationName](false);

        this.log(`Cache for ${domain}.${optionItemName} reset - entity created`, entity);
      }
    });
  }

  // eslint-disable-next-line
  private log(name: string, message?: any) {
    if (this.showConsole) {
      console.log(name, message?.id || message || '');
    }

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
