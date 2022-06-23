/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
import _orderBy from 'lodash/orderBy';
import _camelCase from 'lodash/camelCase';
import _pick from 'lodash/pick';
import _omit from 'lodash/omit';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import Vue from 'vue';
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import { IMassActionEntityData, MassActionRunStatus } from '@/entities/mass-action';
import { i18n } from '@/ui/plugins/i18n';
import { ISignalRService, ISignalRServiceMock } from '@/services/signal-r';
import { sub } from 'date-fns';
import { IEntity } from '@libs/core-lib/entities/base';
import helpers from '@libs/registration-lib/ui/helpers';
import { IStorage } from '../../../store/storage/storage.types';
import { ISignalR } from './signalR.types';

export interface IOptions {
  service: ISignalRService | ISignalRServiceMock,
  storage: IStorage,
  showConsole: boolean,
}

export class SignalR implements ISignalR {
  private static _instance: SignalR;

  public connection: HubConnection;

  public logMessages = [] as { messageName: string, count: number, lastMessage: string, lastTime: Date }[];

  private readonly showConsole: boolean;

  private readonly storage: IStorage;

  private service: ISignalRService;

  public subscriptions: Record<string, uuid[]>;

  private lastSubscribedIds: uuid[]

  private lastSubscribedNewlyCreatedIds: uuid[]

  constructor({
    service, storage, showConsole,
  }: IOptions) {
    this.service = service;
    this.storage = storage;
    this.showConsole = showConsole && false;
    this.lastSubscribedIds = [];
    this.lastSubscribedNewlyCreatedIds = [];
    this.subscriptions = {};
  }

  public static Initialize({
    service, storage, showConsole,
  }: IOptions) {
    SignalR._instance = new SignalR({
      service, storage, showConsole,
    });
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
    this.showConsole && console.log('building connection signalr');

    if (this.connection) {
      this.showConsole && console.log('stopping previous connection signalr');
      await this.connection.stop();
    }

    const isSignedIn = await AuthenticationProvider.isAuthenticated();
    const noAccess = this.storage.user.getters.user().hasRole('noAccess');

    if (isSignedIn && !noAccess) {
      try {
        const connection = new HubConnectionBuilder()
        // .configureLogging(LogLevel.Debug)
          .withUrl(process.env.VUE_APP_SIGNALR_CONNECTION_HUB_URI, {
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

    this.listenForUserRoleChanges();
  }

  private listenForUserRoleChanges() {
    this.connection.on('user-account.UserAccountUpdated', async (entity) => {
      const userId = this.storage.user.getters.userId();
      if (entity.id === userId) {
        // Wait for the role change to take effect in the BE and the token to get updated
        // This code only displays the notification that the role has changed in AD, the log out is done after the page navigation.
        // Therefore, it is only an additional UX improvement to keep the user aware of the change, it doesn't need to be 100% reliable
        await helpers.timeout(15000);
        const roleChanged = await this.storage.user.actions.isRoleChanged(await this.storage.user.actions.getCurrentRoles());
        if (roleChanged) {
          Vue.toasted.global.error(i18n.t('errors.access-change.log-out-on-navigation'));
        }
      }
    });
  }

  private massActionNotifications() {
    this.connection.on('case-file.MassActionRunCompleted', (entity: IMassActionEntityData) => {
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

  private listenForChanges<T extends IEntity>({ domain, entityName, action }: {domain: string, entityName: string, action?: (entity: T)=> void}) {
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

  private listenForOptionItemChanges({
    domain, optionItemName, cacheResetMutationName, mutationDomain = null,
  }: {domain: string, optionItemName: string, cacheResetMutationName: string, mutationDomain?: string}) {
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
    const modules = Object.keys(this.storage) as Array<keyof IStorage>;
    const ids = [] as uuid[];
    const baseDate = sinceDate || sub(new Date(), { hours: 3 }); // by default 3h ago

    modules.forEach((module) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storageModule = this.storage[module] as any;
      if (storageModule?.getters?.getNewlyCreatedIds) {
        const items = storageModule.getters.getNewlyCreatedIds(baseDate) as Array<{id: uuid, createdOn: number}>;
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
    const idsToKeep = [...this.storage.uiState.getters.getAllSearchIds(), ...this.lastSubscribedNewlyCreatedIds];
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
