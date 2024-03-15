/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
import _orderBy from 'lodash/orderBy';
import _pick from 'lodash/pick';
import _omit from 'lodash/omit';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import Vue from 'vue';
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import { IMassActionEntityData, MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { i18n } from '@/ui/plugins/i18n';
import { ISignalRService, ISignalRServiceMock } from '@libs/services-lib/signal-r';
import { sub } from 'date-fns';
import { IEntity } from '@libs/entities-lib/base';
import helpers from '@libs/entities-lib/helpers';
import { useEventStore, useEventMetadataStore } from '@/pinia/event/event';
import { useUserStore } from '@/pinia/user/user';
import { useCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral';
import { useUiStateStore } from '@/pinia/ui-state/uiState';
import { useCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document';
import { useProgramMetadataStore, useProgramStore } from '@/pinia/program/program';
import { useAssessmentResponseMetadataStore, useAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response';
import { useMassActionStore, useMassActionMetadataStore } from '@/pinia/mass-action/mass-action';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { useApprovalTableStore, useApprovalTableMetadataStore } from '@/pinia/approval-table/approval-table';
import { useCaseNoteStore, useCaseNoteMetadataStore } from '@/pinia/case-note/case-note';
import { ICrcWindowObject } from '@libs/entities-lib/ICrcWindowObject';
import { ISignalR } from '@libs/shared-lib/signal-r/signalR.types';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { useFinancialAssistancePaymentMetadataStore, useFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { useFinancialAssistanceMetadataStore, useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';
import { useTeamMetadataStore, useTeamStore } from '@/pinia/team/team';
import { useHouseholdMetadataStore, useHouseholdStore } from '@/pinia/household/household';
import { useCaseFileMetadataStore, useCaseFileStore } from '@/pinia/case-file/case-file';
import { UserRoles } from '@libs/entities-lib/user';
import { useNotificationStore } from '@/pinia/notification/notification';
import { useTaskStore, useTaskMetadataStore } from '@/pinia/task/task';
import { INotificationEntity } from '@libs/entities-lib/notification';

export interface IOptions {
  service: ISignalRService | ISignalRServiceMock,
  showConsole: boolean,
}

export class SignalR implements ISignalR {
  private static _instance: SignalR;

  public connection: HubConnection;

  public logMessages = [] as { messageName: string, count: number, lastMessage: string, lastTime: Date }[];

  private readonly showConsole: boolean;

  private service: ISignalRService;

  public subscriptions: Record<string, uuid[]>;

  private lastSubscribedIds: uuid[];

  private lastSubscribedNewlyCreatedIds: uuid[];

  private watchedPiniaStores: { getNewlyCreatedIds: (baseDate: Date) => Array<{ id: uuid, createdOn: number }> }[] = [];

  constructor({
    service, showConsole,
  }: IOptions) {
    this.service = service;
    this.showConsole = showConsole && false;
    this.lastSubscribedIds = [];
    this.lastSubscribedNewlyCreatedIds = [];
    this.subscriptions = {};
  }

  public static Initialize({
    service, showConsole,
  }: IOptions) {
    SignalR._instance = new SignalR({
      service, showConsole,
    });
    Vue.mixin({
      beforeCreate() {
        this.$signalR = SignalR.instance;
      },
    });

    const w: ICrcWindowObject = window;
    w.crcSingletons = w.crcSingletons || {};
    w.crcSingletons.signalR = SignalR.instance;
    return SignalR.instance;
  }

  static get instance() {
    return SignalR._instance;
  }

  public async buildHubConnection() {
    this.showConsole && console.log('building connection signalr');

    if (this.connection) {
      this.showConsole && console.log('stopping previous connection signalr');
      await this.connection.stop();
    }

    const isSignedIn = await AuthenticationProvider.isAuthenticated();
    const noAccess = useUserStore().getUser().hasRole(UserRoles.noAccess);

    if (isSignedIn && !noAccess) {
      try {
        const connection = new HubConnectionBuilder()
        // .configureLogging(LogLevel.Debug)
          .withUrl(process.env.VITE_SIGNALR_CONNECTION_HUB_URI, {
            accessTokenFactory: async () => AuthenticationProvider.accessToken,
          })
        // https://docs.microsoft.com/en-us/aspnet/core/signalr/javascript-client?view=aspnetcore-3.1#reconnect-clients
          .withAutomaticReconnect()
          .build();

        await connection.start();

        this.connection = connection;

        this.createBindings();

        window.addEventListener('beforeunload', async (e) => {
          if (this.connection.connectionId) {
            await this.unsubscribeAll();
            e.preventDefault();
            e.returnValue = false;
          }
        });

        this.connection.onreconnected((connectionId) => {
          this.showConsole && console.log(`You are reconnected with connectionId ${connectionId}`);
          // We reset the lastSubscribedIds, so we can re-subscribe to what we subscribed with previous connectionId
          this.lastSubscribedIds = [];
          this.subscribe();
        });
      } catch (e) {
        console.error('There was an error connecting to signalR', e);
      }
    }
  }

  private initiatedByCurrentUser(entity: IEntity) {
    const userId = useUserStore().getUserId();
    return userId === entity.lastUpdatedBy || userId === entity.createdBy;
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
    this.listenForTaskModuleChanges();

    // Assessments
    this.listenForAssessmentResponseModuleChanges();

    // Financial Assistance
    this.listenForFinancialAssistanceModuleChanges();

    // Household
    this.listenForHouseholdModuleChanges();

    // Team
    this.listenForTeamModuleChanges();

    // UserAccount
    this.listenForUserAccountModuleChanges();

    // Mass actions
    this.listenForMassActionsModuleChanges();
    this.massActionNotifications();

    this.listenForUserRoleChanges();

    // Approvals Table
    this.listenForApprovalTablesModuleChanges();
  }

  private listenForUserRoleChanges() {
    this.connection.on('user-account.UserAccountUpdated', async (entity) => {
      const userId = useUserStore().getUserId();
      if (entity.id === userId) {
        // Wait for the role change to take effect in the BE and the token to get updated
        // This code only displays the notification that the role has changed in AD, the log out is done after the page navigation.
        // Therefore, it is only an additional UX improvement to keep the user aware of the change, it doesn't need to be 100% reliable
        await helpers.timeout(15000);
        const roleChanged = useUserStore().isRoleChanged(await useUserStore().getCurrentRoles());
        if (roleChanged) {
          Vue.toasted.global.error(i18n.t('errors.access-change.log-out-on-navigation'));
        }
      }
    });
  }

  private massActionNotifications() {
    this.connection.on('case-file.MassActionRunCompleted', (entity: IMassActionEntityData) => {
      const lastRun = _orderBy(entity.runs, 'timestamp', 'desc')[0];

      const initiatedByCurrentUser = this.initiatedByCurrentUser(lastRun);

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
      action: useHouseholdStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'household',
      entityName: 'HouseholdMetadata',
      action: useHouseholdMetadataStore().setItemFromOutsideNotification,
    });

    this.watchedPiniaStores.push(useHouseholdStore());
    this.watchedPiniaStores.push(useHouseholdMetadataStore());

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
      prop: 'screeningIdsFetched',
      store: useCaseFileStore(),
    });

    this.listenForOptionItemChanges({
      domain: 'household',
      optionItemName: 'Gender',
      store: useRegistrationStore(),
      prop: 'gendersFetched',
    });

    this.listenForOptionItemChanges({
      domain: 'household',
      optionItemName: 'PrimarySpokenLanguage',
      store: useRegistrationStore(),
      prop: 'primarySpokenLanguagesFetched',
    });
  }

  private listenForProgramModuleChanges() {
    this.listenForChanges({
      domain: 'event',
      entityName: 'Program',
      action: useProgramStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'event',
      entityName: 'ProgramMetadata',
      action: useProgramMetadataStore().setItemFromOutsideNotification,
    });
    this.watchedPiniaStores.push(useProgramStore());
    this.watchedPiniaStores.push(useProgramMetadataStore());
  }

  private listenForUserAccountModuleChanges() {
    this.listenForChanges({
      domain: 'user-account',
      entityName: 'UserAccount',
      action: useUserAccountStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'user-account',
      entityName: 'UserAccountMetadata',
      action: useUserAccountMetadataStore().setItemFromOutsideNotification,
    });

    // Notifications: add to store on create or update when current user is recipient
    this.connection.on('user-account.NotificationCreated', (entity: INotificationEntity) => {
      const userId = useUserStore().getUserId();
      useNotificationStore().setItemFromOutsideNotification(entity, entity.recipientId === userId);
    });

    this.connection.on('user-account.NotificationUpdated', (entity: INotificationEntity) => {
      const userId = useUserStore().getUserId();
      useNotificationStore().setItemFromOutsideNotification(entity, entity.recipientId === userId);
    });

    this.watchedPiniaStores.push(useUserAccountStore());
    this.watchedPiniaStores.push(useUserAccountMetadataStore());
    this.watchedPiniaStores.push(useNotificationStore());
  }

  private listenForEventModuleChanges() {
    this.listenForChanges({
      domain: 'event',
      entityName: 'Event',
      action: useEventStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'event',
      entityName: 'EventMetadata',
      action: useEventMetadataStore().setItemFromOutsideNotification,
    });

    this.listenForOptionItemChanges({
      domain: 'event',
      optionItemName: 'AgreementType',
      store: useEventStore(),
      prop: 'agreementTypesFetched',
    });

    this.listenForOptionItemChanges({
      domain: 'event',
      optionItemName: 'EventType',
      store: useEventStore(),
      prop: 'eventTypesFetched',
    });

    this.listenForOptionItemChanges({
      domain: 'event',
      optionItemName: 'ExceptionalAuthenticationType',
      store: useEventStore(),
      prop: 'exceptionalAuthenticationTypesFetched',
    });

    this.watchedPiniaStores.push(useEventStore());
    this.watchedPiniaStores.push(useEventMetadataStore());
  }

  private listenForTeamModuleChanges() {
    this.listenForChanges({
      domain: 'team',
      entityName: 'Team',
      action: useTeamStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'team',
      entityName: 'TeamMetadata',
      action: useTeamMetadataStore().setItemFromOutsideNotification,
    });
    this.watchedPiniaStores.push(useTeamStore());
    this.watchedPiniaStores.push(useTeamMetadataStore());
  }

  private listenForMassActionsModuleChanges() {
    this.listenForChanges({
      domain: 'case-file',
      entityName: 'MassAction',
      action: useMassActionStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'MassActionMetadata',
      action: useMassActionMetadataStore().setItemFromOutsideNotification,
    });
    this.watchedPiniaStores.push(useMassActionStore());
    this.watchedPiniaStores.push(useMassActionMetadataStore());
  }

  private listenForCaseFileModuleChanges() {
    this.listenForChanges({
      domain: 'case-file',
      entityName: 'CaseFile',
      action: useCaseFileStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'CaseFileMetadata',
      action: useCaseFileMetadataStore().setItemFromOutsideNotification,
    });

    this.watchedPiniaStores.push(useCaseFileStore());
    this.watchedPiniaStores.push(useCaseFileMetadataStore());

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'CaseFileActivity',
      action: this.noAction,
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'CloseReason',
      prop: 'closeReasonsFetched',
      store: useCaseFileStore(),
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'InactiveReason',
      prop: 'inactiveReasonsFetched',
      store: useCaseFileStore(),
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'Tag',
      prop: 'tagsOptionsFetched',
      store: useCaseFileStore(),
    });
  }

  private listenForCaseNoteModuleChanges() {
    this.listenForChanges({
      domain: 'case-file',
      entityName: 'CaseNote',
      action: useCaseNoteStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'CaseNoteMetadata',
      action: useCaseNoteMetadataStore().setItemFromOutsideNotification,
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'CaseNoteCategory',
      store: useCaseNoteStore(),
      prop: 'caseNoteCategoriesFetched',
    });

    this.watchedPiniaStores.push(useCaseNoteStore());
    this.watchedPiniaStores.push(useCaseNoteMetadataStore());
  }

  private listenForCaseReferralModuleChanges() {
    this.listenForChanges({
      domain: 'case-file',
      entityName: 'Referral',
      action: useCaseFileReferralStore().setItemFromOutsideNotification,
    });

    this.watchedPiniaStores.push(useCaseFileReferralStore());

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'ReferralType',
      store: useCaseFileReferralStore(),
      prop: 'typesFetched',
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'ReferralOutcomeStatus',
      store: useCaseFileReferralStore(),
      prop: 'outcomeStatusesFetched',
    });
  }

  private listenForFinancialAssistancePaymentModuleChanges() {
    this.listenForOptionItemChanges({
      domain: 'finance',
      optionItemName: 'FinancialAssistanceCategory',
      store: useFinancialAssistancePaymentStore(),
      prop: 'financialAssistanceCategoriesFetched',
    });

    this.listenForChanges({
      domain: 'finance',
      entityName: 'FinancialAssistancePayment',
      action: useFinancialAssistancePaymentStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'finance',
      entityName: 'FinancialAssistancePaymentMetadata',
      action: useFinancialAssistancePaymentMetadataStore().setItemFromOutsideNotification,
    });
    this.watchedPiniaStores.push(useFinancialAssistancePaymentStore());
    this.watchedPiniaStores.push(useFinancialAssistancePaymentMetadataStore());
  }

  private listenForCaseDocumentModuleChanges() {
    this.listenForChanges({
      domain: 'case-file',
      entityName: 'Document',
      action: useCaseFileDocumentStore().setItemFromOutsideNotification,
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'DocumentCategory',
      store: useCaseFileDocumentStore(),
      prop: 'categoriesFetched',
    });

    this.watchedPiniaStores.push(useCaseFileDocumentStore());
  }

  private listenForAssessmentResponseModuleChanges() {
    this.listenForChanges({
      domain: 'assessment',
      entityName: 'AssessmentResponse',
      action: useAssessmentResponseStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'assessment',
      entityName: 'AssessmentResponseMetadata',
      action: useAssessmentResponseMetadataStore().setItemFromOutsideNotification,
    });
    this.watchedPiniaStores.push(useAssessmentResponseStore());
    this.watchedPiniaStores.push(useAssessmentResponseMetadataStore());
  }

  private listenForFinancialAssistanceModuleChanges() {
    this.listenForChanges({
      domain: 'finance',
      entityName: 'FinancialAssistanceTable',
      action: useFinancialAssistanceStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'finance',
      entityName: 'FinancialAssistanceTableMetadata',
      action: useFinancialAssistanceMetadataStore().setItemFromOutsideNotification,
    });

    this.watchedPiniaStores.push(useFinancialAssistanceStore());
    this.watchedPiniaStores.push(useFinancialAssistanceMetadataStore());
  }

  private listenForApprovalTablesModuleChanges() {
    this.listenForChanges({
      domain: 'finance',
      entityName: 'ApprovalTable',
      action: useApprovalTableStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'finance',
      entityName: 'ApprovalTableMetadata',
      action: useApprovalTableMetadataStore().setItemFromOutsideNotification,
    });

    this.watchedPiniaStores.push(useApprovalTableStore());
    this.watchedPiniaStores.push(useApprovalTableMetadataStore());
  }

  private listenForTaskModuleChanges() {
    this.listenForChanges({
      domain: 'case-file',
      entityName: 'Task',
      action: useTaskStore().setItemFromOutsideNotification,
    });

    this.listenForChanges({
      domain: 'case-file',
      entityName: 'TaskMetadata',
      action: useTaskMetadataStore().setItemFromOutsideNotification,
    });

    this.listenForOptionItemChanges({
      domain: 'case-file',
      optionItemName: 'TaskCategory',
      store: useTaskStore(),
      prop: 'taskCategoriesFetched',
    });

    this.watchedPiniaStores.push(useTaskStore());
    this.watchedPiniaStores.push(useTaskMetadataStore());
  }

  private listenForChanges<T extends IEntity>({ domain, entityName, action }: { domain: string, entityName: string, action?: (entity: T, byUser: boolean)=> void }) {
    this.connection.on(`${domain}.${entityName}Updated`, (entity) => {
      if (action) {
        action(entity, this.initiatedByCurrentUser(entity));
      }
      this.log(`${domain}.${entityName}Updated`, entity);
    });

    this.connection.on(`${domain}.${entityName}Created`, (entity) => {
      if (action) {
        action(entity, this.initiatedByCurrentUser(entity));
      }
      this.log(`${domain}.${entityName}Created`, entity);
    });
  }

  private listenForChangesMetadataSql<T extends IEntity>({ domain, entityName, action }: { domain: string, entityName: string, action?: (entity: T, byUser: boolean)=> void }) {
    this.connection.on(`${domain}.${entityName}`, (entity) => {
      if (action) {
        // metadata has no owner, we will always cache
        action(entity, true);
      }
      this.log(`${domain}.${entityName}`, entity);
    });
  }

  // when a list of option items is changed, we want the property [optionItemsType]Fetched to be set to false
  // so that the next time the list is needed in the UI, it is re-fetched, not used from the store cache
  private listenForOptionItemChanges({
    domain, optionItemName, store, prop,
  }: { domain: string, optionItemName: string, store: any, prop: string }) {
    this.connection.on(`${domain}.${optionItemName}Updated`, (entity) => {
      if (store && prop) {
        store[prop] = false;
        this.log(`Cache for ${domain}.${optionItemName} reset - entity updated`, entity);
      }
    });

    this.connection.on(`${domain}.${optionItemName}Created`, (entity) => {
      if (store && prop) {
        store[prop] = false;
        this.log(`Cache for ${domain}.${optionItemName} reset - entity created`, entity);
      }
    });
  }

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

  private getAllSubscriptionsIds(): uuid [] {
    return Object.values(this.subscriptions).flat();
  }

  /**
   * Returns a list of subscriptions containing only what's not related to the current path. It will be used to clean the object subscriptions.
   * @param path
   * @private
   */
  private getUnrelatedSubscriptions(path: string): Record<string, uuid[]> {
    const toPathWithoutLang = path.split('/').splice(2).join('/');
    const paths = Object.keys(this.subscriptions);
    const unrelatedPaths = paths.filter((p) => {
      const pathWithoutLang = p.split('/').splice(2).join('/');
      return !toPathWithoutLang.includes(pathWithoutLang);
    });
    this.showConsole && unrelatedPaths.length && console.log('unrelated paths', unrelatedPaths, toPathWithoutLang);
    return _pick(this.subscriptions, unrelatedPaths);
  }

  private getIdsToUnsubscribe(path: string, idsToKeep: uuid[]): uuid[] {
    const idsToUnsubscribe = Object.values(this.getUnrelatedSubscriptions(path)).flat();
    return idsToUnsubscribe.filter((id) => idsToKeep.indexOf(id) === -1);
  }

  /**
   * Subscribe to not already subscribed ids from the subscriptions object
   * @private
   */
  private async subscribe() {
    if (!this.connection) {
      return;
    }
    let idsToSubscribe = this.getAllSubscriptionsIds();

    // If nothing is new compared to last subscription
    if (idsToSubscribe.every((id) => this.lastSubscribedIds.includes(id))) {
      this.showConsole && console.log('Nothing new to subscribe');
      return;
    }

    if (idsToSubscribe?.length > 0) {
      if (this.lastSubscribedIds?.length > 0) { // Will only subscribe the difference (the new ids)
        idsToSubscribe = idsToSubscribe.filter((id) => this.lastSubscribedIds.indexOf(id) === -1);
      }
      await this.service.subscribe(this.connection.connectionId, idsToSubscribe);
      this.lastSubscribedIds = [...this.lastSubscribedIds, ...idsToSubscribe];
    } else {
      this.showConsole && console.log('Nothing to subscribe');
    }
  }

  public addSubscription(id: uuid) {
    if (!this.subscriptions[window.location.pathname]) {
      this.subscriptions[window.location.pathname] = [];
    }
    if (this.subscriptions[window.location.pathname].indexOf(id) === -1) {
      this.subscriptions[window.location.pathname] = [...this.subscriptions[window.location.pathname], id];
    }
  }

  private getNewlyCreatedItemsSince(sinceDate?: number) {
    const ids = [] as uuid[];
    const baseDate = sinceDate || sub(new Date(), { hours: 3 }); // by default 3h ago

    this.watchedPiniaStores.forEach((store) => {
      if (store?.getNewlyCreatedIds) {
        const items = store.getNewlyCreatedIds(baseDate as Date) as Array<{ id: uuid, createdOn: number }>;
        items.forEach((item) => {
          if (item.id) {
            ids.push(item.id);
          }
        });
      }
    });

    return ids;
  }

  /**
   * Subscribe to newly created ids not already subscribed
   * Unsubscribe to items not considered as newly created anymore
   * @private
   */
  private async updateNewlyCreatedItemsSubscriptions() {
    const ids = this.getNewlyCreatedItemsSince();

    const idsToSubscribe = ids.filter((id) => this.lastSubscribedNewlyCreatedIds.indexOf(id) === -1);

    if (idsToSubscribe.length > 0) {
      this.showConsole && console.log(`Will subscribe to newly items: ${idsToSubscribe}`);
      await this.service.subscribe(this.connection.connectionId, idsToSubscribe);
      this.lastSubscribedNewlyCreatedIds = [...this.lastSubscribedNewlyCreatedIds, ...idsToSubscribe];
    }

    const idsToUnsubscribe = this.lastSubscribedNewlyCreatedIds.filter((id) => ids.indexOf(id) === -1);
    if (idsToUnsubscribe.length > 0) {
      this.showConsole && console.log(`Will unsubscribe to newly items: ${idsToUnsubscribe}`);
      await this.unsubscribe(idsToUnsubscribe);
    }
    // We remove ids that were unsubscribed
    this.lastSubscribedNewlyCreatedIds = this.lastSubscribedNewlyCreatedIds.filter((id) => !idsToUnsubscribe.includes(id));
  }

  /**
   * Main method that is called every x seconds.
   * Subscriptions are divided into two groups. NewlyCreatedItems, with no linked path and others subscriptions with a linked path
   */
  public async updateSubscriptions() {
    const currentPath = window.location.pathname;
    const idsToKeep = [...useUiStateStore().getAllSearchIds(), ...this.lastSubscribedNewlyCreatedIds];
    const idsToUnsubscribe = this.getIdsToUnsubscribe(currentPath, idsToKeep);

    // We unsubscribe ids
    await this.unsubscribe(idsToUnsubscribe);

    // Clean subscriptions object
    this.cleanSubscriptionsObjectButSpecified(currentPath, idsToKeep);

    // Once cleaned, subscribe to remaining
    await this.subscribe();
    this.showConsole && console.log(this.subscriptions);

    // After all, deal with newly created items by subscribing and unsubscribing
    await this.updateNewlyCreatedItemsSubscriptions();
  }

  /**
   * Clean the subscriptions object by removing the whole path or keep the path but updating ids
   * @param path
   * @param idsToKeep
   * @private
   */
  private cleanSubscriptionsObjectButSpecified(path: string, idsToKeep: uuid[]) {
    const unrelatedSubscriptions = this.getUnrelatedSubscriptions(path);
    const unrelatedPath = Object.keys(unrelatedSubscriptions);
    const subscriptionsWithSearchState: Record<string, uuid[]> = {};
    const pathsToRemove: string[] = [];

    // For all subscription path, we keep only ids that need to be preserved, or we remove the path
    // eslint-disable-next-line @typescript-eslint/no-shadow
    unrelatedPath.forEach((path) => {
      const filteredIds = unrelatedSubscriptions[path].filter((id) => idsToKeep.indexOf(id) !== -1);
      if (filteredIds.length > 0) {
        subscriptionsWithSearchState[path] = filteredIds;
      } else {
        pathsToRemove.push(path);
      }
    });

    if (pathsToRemove.length > 0) {
      // We remove all subscriptions from a path if none are in the state ui
      this.subscriptions = _omit(this.subscriptions, pathsToRemove);
    }
    // We keep only ids from state UI if not removed
    // eslint-disable-next-line @typescript-eslint/no-shadow
    Object.keys(subscriptionsWithSearchState).forEach((path) => {
      this.subscriptions[path] = subscriptionsWithSearchState[path];
    });
  }

  private async unsubscribe(ids: uuid[]) {
    if (!this.connection) {
      return;
    }
    if (ids.length > 0) {
      this.showConsole && console.log(`You will unsubscribe from ${ids}`);
      await this.service.unsubscribe(this.connection.connectionId, ids);
      this.lastSubscribedIds = this.lastSubscribedIds.filter((id) => !ids.includes(id));
    }
  }

  public async unsubscribeAll() {
    if (!this.connection) {
      return;
    }
    await this.service.unsubscribeAll(this.connection.connectionId);
    await this.connection.stop();
  }
}

export default SignalR;
