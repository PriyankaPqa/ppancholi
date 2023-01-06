import { mockStorage } from '@/storage';
import { mockSignalRService } from '@libs/services-lib/signal-r';
import { useMockUiStateStore } from '@/pinia/ui-state/uiState.mock';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral.mock';
import { SignalR } from './signalR';

const storage = mockStorage();
const service = mockSignalRService();

const listenForChangesFct = SignalR.prototype.listenForChanges;
const listenForOptionItemChangesFct = SignalR.prototype.listenForOptionItemChanges;
SignalR.prototype.buildHubConnection = jest.fn();
SignalR.prototype.listenForChanges = jest.fn();
SignalR.prototype.listenForOptionItemChanges = jest.fn();

let conn = new SignalR({ service, storage, showConsole: true });

const { eventStore, eventMetadataStore } = useMockEventStore();
const { caseFileReferralStore, caseFileReferralMetadataStore } = useMockCaseFileReferralStore();
const { uiStateStore } = useMockUiStateStore();

describe('signalR', () => {
  beforeEach(() => {
    conn = new SignalR({
      service,
      storage,
      showConsole: false,
    });

    eventStore.getNewlyCreatedIds = jest.fn(() => [{ id: '2', createdOn: 0 }]);
    conn.connection = { on: jest.fn(), stop: jest.fn() };
    conn.setPinia({
      eventStore,
      eventMetadataStore,
      caseFileReferralStore,
      caseFileReferralMetadataStore,
      uiStateStore,
    });
  });

  describe('createBindings', () => {
    it('calls listenForEventModuleChanges', () => {
      conn.listenForEventModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForEventModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForProgramModuleChanges', () => {
      conn.listenForProgramModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForProgramModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForCaseFileModuleChanges', () => {
      conn.listenForCaseFileModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForCaseFileModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForCaseNoteModuleChanges', () => {
      conn.listenForCaseNoteModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForCaseNoteModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForCaseReferralModuleChanges', () => {
      conn.listenForCaseReferralModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForCaseReferralModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForCaseDocumentModuleChanges', () => {
      conn.listenForCaseDocumentModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForCaseDocumentModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForFinancialAssistancePaymentModuleChanges', () => {
      conn.listenForFinancialAssistancePaymentModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForFinancialAssistancePaymentModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForCaseReferralModuleChanges', () => {
      conn.listenForCaseReferralModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForCaseReferralModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForFinancialAssistanceModuleChanges', () => {
      conn.listenForFinancialAssistanceModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForFinancialAssistanceModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForFinancialAssistanceCategoryModuleChanges', () => {
      conn.listenForFinancialAssistanceCategoryModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForFinancialAssistanceCategoryModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForHouseholdModuleChanges', () => {
      conn.listenForHouseholdModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForHouseholdModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForTeamModuleChanges', () => {
      conn.listenForTeamModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForTeamModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForUserAccountModuleChanges', () => {
      conn.listenForUserAccountModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForUserAccountModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls listenForMassActionsModuleChanges', () => {
      conn.listenForMassActionsModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForMassActionsModuleChanges)
        .toHaveBeenCalled();
    });

    it('calls massActionNotifications', () => {
      conn.massActionNotifications = jest.fn();
      conn.createBindings();
      expect(conn.massActionNotifications)
        .toHaveBeenCalled();
    });
  });

  describe('listenForHouseholdModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForHouseholdModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'household',
          entityName: 'Household',
          action: conn.storage.household.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'household',
          entityName: 'HouseholdMetadata',
          action: conn.storage.household.mutations.setMetadataFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'household',
          entityName: 'Person',
          action: conn.noAction,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'household',
          entityName: 'PersonMetadata',
          action: conn.noAction,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForHouseholdModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'household',
          optionItemName: 'ScreeningId',
          cacheResetMutationName: 'setScreeningIdsFetched',
          mutationDomain: 'caseFile',
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'household',
          optionItemName: 'Gender',
          cacheResetMutationName: 'setGendersFetched',
          mutationDomain: 'registration',
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'household',
          optionItemName: 'PrimarySpokenLanguage',
          cacheResetMutationName: 'setPrimarySpokenLanguagesFetched',
          mutationDomain: 'registration',
        });
    });
  });

  describe('listenForProgramModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForProgramModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'event',
          entityName: 'Program',
          action: conn.storage.program.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'event',
          entityName: 'ProgramMetadata',
          action: conn.storage.program.mutations.setMetadataFromOutsideNotification,
        });
    });
  });

  describe('listenForUserAccountModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForUserAccountModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'user-account',
          entityName: 'UserAccount',
          action: conn.storage.userAccount.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'user-account',
          entityName: 'UserAccountMetadata',
          action: conn.storage.userAccount.mutations.setMetadataFromOutsideNotification,
        });
    });
  });

  describe('listenForEventModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForEventModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'event',
          entityName: 'Event',
          action: conn.pinia.eventStore.setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'event',
          entityName: 'EventMetadata',
          action: conn.pinia.eventMetadataStore.setItemFromOutsideNotification,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForEventModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'event',
          optionItemName: 'AgreementType',
          cacheResetMutationName: 'setAgreementTypesFetched',
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'event',
          optionItemName: 'EventType',
          cacheResetMutationName: 'setEventTypesFetched',
        });
    });
  });

  describe('listenForTeamModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForTeamModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'team',
          entityName: 'Team',
          action: conn.storage.team.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'team',
          entityName: 'TeamMetadata',
          action: conn.storage.team.mutations.setMetadataFromOutsideNotification,
        });
    });
  });

  describe('listenForMassActionsModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForMassActionsModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'MassAction',
          action: conn.storage.massAction.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'MassActionMetadata',
          action: conn.storage.massAction.mutations.setMetadataFromOutsideNotification,
        });
    });
  });

  describe('listenForCaseFileModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForCaseFileModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'CaseFile',
          action: conn.storage.caseFile.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'CaseFileMetadata',
          action: conn.storage.caseFile.mutations.setMetadataFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'CaseFileActivity',
          action: conn.noAction,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseFileModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'CloseReason',
          cacheResetMutationName: 'setCloseReasonsFetched',
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'InactiveReason',
          cacheResetMutationName: 'setInactiveReasonsFetched',
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'Tag',
          cacheResetMutationName: 'setTagsOptionsFetched',
        });
    });
  });

  describe('listenForCaseNoteModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForCaseNoteModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'CaseNote',
          action: conn.storage.caseNote.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'CaseNoteMetadata',
          action: conn.storage.caseNote.mutations.setMetadataFromOutsideNotification,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseNoteModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'CaseNoteCategory',
          cacheResetMutationName: 'setCaseNoteCategoriesFetched',
          mutationDomain: 'caseNote',
        });
    });
  });

  describe('listenForCaseReferralModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForCaseReferralModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'Referral',
          action: conn.pinia.caseFileReferralStore.setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'ReferralMetadata',
          action: conn.pinia.caseFileReferralMetadataStore.setItemFromOutsideNotification,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseReferralModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'ReferralType',
          cacheResetMutationName: 'setTypesFetched',
          mutationDomain: 'caseFileReferral',
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'ReferralOutcomeStatus',
          cacheResetMutationName: 'setOutcomeStatusesFetched',
          mutationDomain: 'caseFileReferral',
        });
    });
  });

  describe('listenForAssessmentResponseModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForAssessmentResponseModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'assessment',
          entityName: 'AssessmentResponse',
          action: conn.storage.assessmentResponse.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'assessment',
          entityName: 'AssessmentResponseMetadata',
          action: conn.storage.assessmentResponse.mutations.setMetadataFromOutsideNotification,
        });
    });
  });

  describe('listenForFinancialAssistancePaymentModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForFinancialAssistancePaymentModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'finance',
          entityName: 'FinancialAssistancePayment',
          action: conn.storage.financialAssistancePayment.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'finance',
          entityName: 'FinancialAssistancePaymentMetadata',
          action: conn.storage.financialAssistancePayment.mutations.setMetadataFromOutsideNotification,
        });
    });
  });

  describe('listenForCaseDocumentModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForCaseDocumentModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'Document',
          action: conn.storage.caseFileDocument.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'DocumentMetadata',
          action: conn.storage.caseFileDocument.mutations.setMetadataFromOutsideNotification,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseDocumentModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'DocumentCategory',
          cacheResetMutationName: 'setCategoriesFetched',
          mutationDomain: 'caseFileDocument',
        });
    });
  });

  describe('listenForFinancialAssistanceModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForFinancialAssistanceModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'finance',
          entityName: 'FinancialAssistanceTable',
          action: conn.storage.financialAssistance.mutations.setEntityFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'finance',
          entityName: 'FinancialAssistanceTableMetadata',
          action: conn.storage.financialAssistance.mutations.setMetadataFromOutsideNotification,
        });
    });
  });

  describe('listenForFinancialAssistanceCategoryModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForFinancialAssistanceCategoryModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'finance',
          entityName: 'FinancialAssistanceCategory',
          action: conn.storage.financialAssistanceCategory.mutations.setEntityFromOutsideNotification,
        });
    });
  });

  describe('listenForApprovalTablesModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForApprovalTablesModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'finance',
          entityName: 'ApprovalTable',
          action: conn.storage.approvalTable.mutations.setEntityFromOutsideNotification,
        });

      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'finance',
          entityName: 'ApprovalTableMetadata',
          action: conn.storage.approvalTable.mutations.setMetadataFromOutsideNotification,
        });
    });
  });

  describe('listenForChanges', () => {
    it('attaches the action to the connection', () => {
      SignalR.prototype.listenForChanges = listenForChangesFct;
      conn = new SignalR({
        storage,
        showConsole: false,
      });
      conn.connection = { on: jest.fn() };
      conn.listenForChanges({
        domain: 'financialAssistance',
        entityName: 'FinancialAssistanceCategory',
      });
      expect(conn.connection.on)
        .toHaveBeenCalledWith('financialAssistance.FinancialAssistanceCategoryUpdated', expect.any(Function));
      expect(conn.connection.on)
        .toHaveBeenCalledWith('financialAssistance.FinancialAssistanceCategoryCreated', expect.any(Function));
    });
  });

  describe('listenForOptionItemChanges', () => {
    it('attaches the action to the connection', () => {
      SignalR.prototype.listenForOptionItemChanges = listenForOptionItemChangesFct;
      conn = new SignalR({
        storage,
        showConsole: false,
      });
      conn.connection = { on: jest.fn() };
      conn.listenForOptionItemChanges({
        domain: 'event',
        optionItemName: 'AgreementType',
        cacheResetMutationName: 'setAgreementTypesFetched',
      });
      expect(conn.connection.on)
        .toHaveBeenCalledWith('event.AgreementTypeUpdated', expect.any(Function));
      expect(conn.connection.on)
        .toHaveBeenCalledWith('event.AgreementTypeCreated', expect.any(Function));
    });
  });

  describe('getAllSubscriptionsIds', () => {
    it('should all subscriptions ids', () => {
      conn.subscriptions = {
        'en/casefiles': ['1', '2'],
        'en/events': ['3', '4'],
      };
      const res = conn.getAllSubscriptionsIds();
      expect(res)
        .toEqual(['1', '2', '3', '4']);
    });
  });

  describe('getUnrelatedSubscriptions', () => {
    it('should return a list of unrelated subscriptions for a different domain', () => {
      conn.subscriptions = {
        '/en/home': ['1', '2'],
        '/en/casefile/': ['4', '5', '6'],
        '/en/casefile/4': ['8', '9'],
        '/en/casefile/4/note': ['note_1', 'note_2'],
      };

      const toPath = '/en/home';

      const expected = conn.getUnrelatedSubscriptions(toPath);

      expect(expected)
        .toMatchObject({
          '/en/casefile/': ['4', '5', '6'],
          '/en/casefile/4': ['8', '9'],
          '/en/casefile/4/note': ['note_1', 'note_2'],
        });
    });

    it('should return a list of unrelated subscriptions when changing url within a same domain', () => {
      conn.subscriptions = {
        '/en/casefile/': ['4', '5', '6'],
        '/en/casefile/4': ['8', '9'],
        '/en/casefile/4/note': ['note_1', 'note_2'],
      };

      const toPath = '/en/casefile/4/documents';

      const expected = conn.getUnrelatedSubscriptions(toPath);

      expect(expected)
        .toMatchObject({
          '/en/casefile/4/note': ['note_1', 'note_2'],
        });
    });
  });

  describe('getIdsToUnsubscribe', () => {
    it('should return a list of unrelated ids but the one to keep', () => {
      conn.getUnrelatedSubscriptions = jest.fn(() => ({
        '/en/casefile/': ['1'],
        '/en/casefile/4': ['2'],
      }));

      const expected = conn.getIdsToUnsubscribe('path', ['1']);

      expect(expected).toEqual(['2']);
    });
  });

  describe('subscribe', () => {
    it('should do nothing if no subscriptions at all', async () => {
      conn.getAllSubscriptionsIds = jest.fn(() => []);

      await conn.subscribe();

      expect(service.subscribe)
        .not
        .toBeCalled();
      expect(conn.lastSubscribedIds)
        .toEqual([]);
    });

    it('should do nothing if no new subscriptions', async () => {
      conn.getAllSubscriptionsIds = jest.fn(() => ['1', '2', '3']);
      conn.lastSubscribedIds = ['1', '2', '3'];

      await conn.subscribe();

      expect(service.subscribe)
        .not
        .toBeCalled();
      expect(conn.lastSubscribedIds)
        .toEqual(['1', '2', '3']);
    });

    it('should subscribe to new ids if there are some and set lastSubscribedIds', async () => {
      conn.getAllSubscriptionsIds = jest.fn(() => ['1', '2', '3', '4', '5', '6']);
      conn.lastSubscribedIds = ['1', '2', '3'];

      await conn.subscribe();

      expect(service.subscribe)
        .toBeCalledWith(conn.connection.connectionId, ['4', '5', '6']);
      expect(conn.lastSubscribedIds)
        .toEqual(['1', '2', '3', '4', '5', '6']);
    });
  });

  describe('addSubscription', () => {
    it('should add the subscription ids with the corresponding path while avoiding duplication', () => {
      expect(conn.subscriptions)
        .toEqual({});
      conn.addSubscription('1');
      expect(conn.subscriptions)
        .toEqual({ '/': ['1'] });
      conn.addSubscription('2');
      expect(conn.subscriptions)
        .toEqual({ '/': ['1', '2'] });
      conn.addSubscription('2');
      expect(conn.subscriptions)
        .toEqual({ '/': ['1', '2'] });
    });
  });

  describe('getNewlyCreatedItemsSince', () => {
    it('should return a flat array of all newlyCreatedIds', () => {
      conn.storage.caseFile.getters.getNewlyCreatedIds = jest.fn(() => [
        { id: '1', createdOn: 0 },
      ]);

      const res = conn.getNewlyCreatedItemsSince();

      expect(res).toEqual(['1', '2']);
    });
  });

  describe('updateNewlyCreatedItemsSubscriptions', () => {
    it('should subscribe to non already-subscribed newlyAddedItems and update lastSubscribedNewlyCreatedIds', async () => {
      conn.getNewlyCreatedItemsSince = jest.fn(() => ['1', '2']);
      await conn.updateNewlyCreatedItemsSubscriptions();

      expect(conn.service.subscribe).toBeCalledWith(conn.connection.connectionId, ['1', '2']);
      expect(conn.lastSubscribedNewlyCreatedIds).toEqual(['1', '2']);

      conn.getNewlyCreatedItemsSince = jest.fn(() => ['1', '2', '3']);
      await conn.updateNewlyCreatedItemsSubscriptions();

      expect(conn.service.subscribe).toBeCalledWith(conn.connection.connectionId, ['3']);
      expect(conn.lastSubscribedNewlyCreatedIds).toEqual(['1', '2', '3']);
    });

    it('should unsubscribe and update lastSubscribedNewlyCreatedIds', async () => {
      conn.unsubscribe = jest.fn();
      conn.lastSubscribedNewlyCreatedIds = ['1', '2', '3'];
      conn.getNewlyCreatedItemsSince = jest.fn(() => ['1']);
      await conn.updateNewlyCreatedItemsSubscriptions();

      expect(conn.unsubscribe).toBeCalledWith(['2', '3']);
      expect(conn.lastSubscribedNewlyCreatedIds).toEqual(['1']);
    });
  });

  describe('updateSubscriptions', () => {
    it('should call unsubscribe with correct ids', async () => {
      conn.getIdsToUnsubscribe = jest.fn(() => ['1']);
      conn.pinia.uiStateStore.getAllSearchIds = jest.fn(() => ['2']);
      conn.unsubscribe = jest.fn();
      await conn.updateSubscriptions();
      expect(conn.unsubscribe).toBeCalledWith(['1']);
    });

    it('should call cleanSubscriptionsObjectButSpecified with path and ids to keep', async () => {
      conn.cleanSubscriptionsObjectButSpecified = jest.fn();
      conn.pinia.uiStateStore.getAllSearchIds = jest.fn(() => ['1']);
      conn.lastSubscribedNewlyCreatedIds = ['2'];
      await conn.updateSubscriptions();
      expect(conn.cleanSubscriptionsObjectButSpecified).toBeCalledWith('/', ['1', '2']);
    });

    it('should call subscribe', async () => {
      conn.subscribe = jest.fn();
      await conn.updateSubscriptions();
      expect(conn.subscribe).toBeCalled();
    });

    it('should call updateNewlyCreatedItemsSubscriptions', async () => {
      conn.updateNewlyCreatedItemsSubscriptions = jest.fn();
      await conn.updateSubscriptions();
      expect(conn.updateNewlyCreatedItemsSubscriptions).toBeCalled();
    });
  });

  describe('cleanSubscriptionsObjectButSpecified', () => {
    it('should remove unrelated subscriptions if no ids are in state, otherwise update ids and keep the path', () => {
      // Path that will be removed or filtered
      conn.getUnrelatedSubscriptions = jest.fn(() => ({
        '/en/page1/': ['1', '2', '3'],
        '/en/page2/': ['4', '5'],
        '/en/page4/': ['8'],
      }));

      conn.subscriptions = {
        '/en/page1/': ['1', '2', '3'],
        '/en/page2/': ['4', '5'],
        '/en/page3/': ['6'],
        '/en/page4/': ['8'],
      };

      const idsToKeep = ['1', '4', '5'];
      conn.cleanSubscriptionsObjectButSpecified('path', idsToKeep);

      expect(conn.subscriptions).toEqual({
        '/en/page1/': ['1'],
        '/en/page2/': ['4', '5'],
        '/en/page3/': ['6'],
      });
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe to ids pass in parameters', async () => {
      const ids = ['1', '2'];
      await conn.unsubscribe(ids);
      expect(service.unsubscribe)
        .toHaveBeenCalledWith(conn.connection.connectionId, ['1', '2']);
    });
  });

  describe('unsubscribeAll', () => {
    it('should call unsubscribeAll with connectionId', async () => {
      await conn.unsubscribeAll();
      expect(conn.service.unsubscribeAll)
        .toHaveBeenCalledWith(conn.connection.connectionId);
    });

    it('should stop the connection', async () => {
      await conn.unsubscribeAll();
      expect(conn.connection.stop)
        .toBeCalled();
    });
  });
});
