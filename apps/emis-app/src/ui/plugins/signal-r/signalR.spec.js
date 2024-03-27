import { mockSignalRService } from '@libs/services-lib/signal-r';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useEventStore } from '@/pinia/event/event';
import { useCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral';
import { useUiStateStore } from '@/pinia/ui-state/uiState';
import { useCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document';
import { useProgramStore } from '@/pinia/program/program';
import { useCaseNoteStore } from '@/pinia/case-note/case-note';
import { useAssessmentResponseMetadataStore, useAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response';
import { useMassActionStore, useMassActionMetadataStore } from '@/pinia/mass-action/mass-action';
import { useApprovalTableStore } from '@/pinia/approval-table/approval-table';

import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';
import { useFinancialAssistancePaymentStore, useFinancialAssistancePaymentMetadataStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment';
import { useFinancialAssistanceStore, useFinancialAssistanceMetadataStore } from '@/pinia/financial-assistance/financial-assistance';
import { useTeamMetadataStore, useTeamStore } from '@/pinia/team/team';
import { useHouseholdMetadataStore, useHouseholdStore } from '@/pinia/household/household';
import { useCaseFileMetadataStore, useCaseFileStore } from '@/pinia/case-file/case-file';
import { useTaskMetadataStore, useTaskStore } from '@/pinia/task/task';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { SignalR } from './signalR';

const service = mockSignalRService();

const listenForChangesFct = SignalR.prototype.listenForChanges;
const listenForOptionItemChangesFct = SignalR.prototype.listenForOptionItemChanges;
SignalR.prototype.buildHubConnection = jest.fn();
SignalR.prototype.listenForChanges = jest.fn();
SignalR.prototype.listenForChangesMetadataSql = jest.fn();
SignalR.prototype.listenForOptionItemChanges = jest.fn();

let conn = new SignalR({ service, showConsole: true });

const { eventStore } = useMockEventStore();

describe('signalR', () => {
  beforeEach(() => {
    conn = new SignalR({
      service,
      showConsole: false,
    });
    conn.connection = { on: jest.fn(), stop: jest.fn() };

    eventStore.getNewlyCreatedIds = jest.fn(() => [{ id: '2', createdOn: 0 }]);
    conn.listenForEventModuleChanges();
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

    it('calls listenForTaskModuleChanges', () => {
      conn.listenForTaskModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForTaskModuleChanges)
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
          action: useHouseholdStore().setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'household',
          entityName: 'HouseholdMetadata',
          action: useHouseholdMetadataStore().setItemFromOutsideNotification,
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
          prop: 'screeningIdsFetched',
          store: useCaseFileStore(),
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'household',
          optionItemName: 'Gender',
          store: useRegistrationStore(),
          prop: 'gendersFetched',
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'household',
          optionItemName: 'PrimarySpokenLanguage',
          store: useRegistrationStore(),
          prop: 'primarySpokenLanguagesFetched',
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
          action: useProgramStore().setItemFromOutsideNotification,
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
          action: useUserAccountStore().setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'user-account',
          entityName: 'UserAccountMetadata',
          action: useUserAccountMetadataStore().setItemFromOutsideNotification,
        });
    });
    it('adds handler for NotificationCreated', () => {
      conn.listenForUserAccountModuleChanges();
      expect(conn.connection.on)
        .toHaveBeenCalledWith('user-account.NotificationCreated', expect.any(Function));
      expect(conn.connection.on)
        .toHaveBeenCalledWith('user-account.NotificationUpdated', expect.any(Function));
    });
    it('adds handler for NotificationUpdated', () => {
      conn.listenForUserAccountModuleChanges();
      expect(conn.connection.on)
        .toHaveBeenCalledWith('user-account.NotificationUpdated', expect.any(Function));
    });
  });

  describe('listenForEventModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForEventModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'event',
          entityName: 'Event',
          action: useEventStore().setItemFromOutsideNotification,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForEventModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'event',
          optionItemName: 'AgreementType',
          store: useEventStore(),
          prop: 'agreementTypesFetched',
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'event',
          optionItemName: 'EventType',
          store: useEventStore(),
          prop: 'eventTypesFetched',
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'event',
          optionItemName: 'ExceptionalAuthenticationType',
          store: useEventStore(),
          prop: 'exceptionalAuthenticationTypesFetched',
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
          action: useTeamStore().setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'team',
          entityName: 'TeamMetadata',
          action: useTeamMetadataStore().setItemFromOutsideNotification,
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
          action: useMassActionStore().setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'MassActionMetadata',
          action: useMassActionMetadataStore().setItemFromOutsideNotification,
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
          action: useCaseFileStore().setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'CaseFileMetadata',
          action: useCaseFileMetadataStore().setItemFromOutsideNotification,
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
          prop: 'closeReasonsFetched',
          store: useCaseFileStore(),
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'InactiveReason',
          prop: 'inactiveReasonsFetched',
          store: useCaseFileStore(),
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'Tag',
          prop: 'tagsOptionsFetched',
          store: useCaseFileStore(),
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
          action: useCaseNoteStore().setItemFromOutsideNotification,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseNoteModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'CaseNoteCategory',
          store: useCaseNoteStore(),
          prop: 'caseNoteCategoriesFetched',
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
          action: useCaseFileReferralStore().setItemFromOutsideNotification,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseReferralModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'ReferralType',
          store: useCaseFileReferralStore(),
          prop: 'typesFetched',
        });
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'ReferralOutcomeStatus',
          store: useCaseFileReferralStore(),
          prop: 'outcomeStatusesFetched',
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
          action: useAssessmentResponseStore().setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'assessment',
          entityName: 'AssessmentResponseMetadata',
          action: useAssessmentResponseMetadataStore().setItemFromOutsideNotification,
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
          action: useFinancialAssistancePaymentStore().setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'finance',
          entityName: 'FinancialAssistancePaymentMetadata',
          action: useFinancialAssistancePaymentMetadataStore().setItemFromOutsideNotification,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForFinancialAssistancePaymentModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'finance',
          optionItemName: 'FinancialAssistanceCategory',
          store: useFinancialAssistancePaymentStore(),
          prop: 'financialAssistanceCategoriesFetched',
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
          action: useCaseFileDocumentStore().setItemFromOutsideNotification,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseDocumentModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'DocumentCategory',
          store: useCaseFileDocumentStore(),
          prop: 'categoriesFetched',
        });
    });
  });

  describe('listenForTaskModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForTaskModuleChanges();
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'Task',
          action: useTaskStore().setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          entityName: 'TaskMetadata',
          action: useTaskMetadataStore().setItemFromOutsideNotification,
        });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForTaskModuleChanges();
      expect(conn.listenForOptionItemChanges)
        .toHaveBeenCalledWith({
          domain: 'case-file',
          optionItemName: 'TaskCategory',
          store: useTaskStore(),
          prop: 'taskCategoriesFetched',
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
          action: useFinancialAssistanceStore().setItemFromOutsideNotification,
        });
      expect(conn.listenForChanges)
        .toHaveBeenCalledWith({
          domain: 'finance',
          entityName: 'FinancialAssistanceTableMetadata',
          action: useFinancialAssistanceMetadataStore().setItemFromOutsideNotification,
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
          action: useApprovalTableStore().setItemFromOutsideNotification,
        });
    });
  });

  describe('listenForChanges', () => {
    it('attaches the action to the connection', () => {
      SignalR.prototype.listenForChanges = listenForChangesFct;
      conn = new SignalR({
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
        showConsole: false,
      });
      conn.connection = { on: jest.fn() };
      conn.listenForOptionItemChanges({
        domain: 'event',
        optionItemName: 'AgreementType',
        store: useEventStore(),
        prop: 'agreementTypesFetched',
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
      useUiStateStore().getAllSearchIds = jest.fn(() => ['2']);
      conn.unsubscribe = jest.fn();
      await conn.updateSubscriptions();
      expect(conn.unsubscribe).toBeCalledWith(['1']);
    });

    it('should call cleanSubscriptionsObjectButSpecified with path and ids to keep', async () => {
      conn.cleanSubscriptionsObjectButSpecified = jest.fn();
      useUiStateStore().getAllSearchIds = jest.fn(() => ['1']);
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
