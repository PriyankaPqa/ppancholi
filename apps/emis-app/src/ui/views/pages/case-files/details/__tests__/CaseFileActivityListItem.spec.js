import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFileActivityType, mockCaseFileActivities, HouseholdCaseFileActivityType } from '@libs/entities-lib/case-file';
import { ERegistrationMethod } from '@libs/shared-lib/src/types/enums/ERegistrationMethod';
import { ApprovalAction } from '@libs/entities-lib/financial-assistance-payment';
import Component from '../case-file-activity/components/CaseFileActivityListItem.vue';

const localVue = createLocalVue();
const item = mockCaseFileActivities()[0];

describe('CaseFileActivityListItem.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          item,
        },
        computed: {
          content() {
            return {
              title: 'mock-title',
              body: 'mock-body',
            };
          },
        },
      });
    });

    describe('content', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileActivity-listItem-content');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render if the content is null', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            item,
          },
          computed: {
            content() {
              return null;
            },
          },
        });

        const element = wrapper.findDataTest('caseFileActivity-listItem-content');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('content title', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileActivity-listItem-content-title');
        expect(element.exists()).toBeTruthy();
      });
      it('contains the content title', () => {
        const element = wrapper.findDataTest('caseFileActivity-listItem-content-title');
        expect(element.text()).toEqual(wrapper.vm.content.title);
      });
    });

    describe('content body', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body');
        expect(element.exists()).toBeTruthy();
      });
      it('contains the content body', () => {
        const element = wrapper.findDataTest('caseFileActivity-listItem-content-body');
        expect(element.text()).toEqual(wrapper.vm.content.body);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          item,
        },

      });
    });

    describe('content', () => {
      it('calls the right method when action type is AddedTag', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForTags').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.AddedTag)[0],
        });
        expect(wrapper.vm.makeContentForTags).toHaveBeenCalledWith(CaseFileActivityType.AddedTag);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when action type is RemovedTag', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForTags').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.RemovedTag)[0],
        });
        expect(wrapper.vm.makeContentForTags).toHaveBeenCalledWith(CaseFileActivityType.RemovedTag);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when action type is AddedDuplicateFlag', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForAddedDuplicateFlag').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.AddedDuplicateFlag)[0],
        });
        expect(wrapper.vm.makeContentForAddedDuplicateFlag).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when action type is RemovedDuplicateFlag', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForRemovedDuplicateFlag').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.RemovedDuplicateFlag)[0],
        });
        expect(wrapper.vm.makeContentForRemovedDuplicateFlag).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when action type is TriageUpdated', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForTriageUpdated').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.TriageUpdated)[0],
        });
        expect(wrapper.vm.makeContentForTriageUpdated).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the right object in default case', async () => {
        await wrapper.setProps({
          item: {
            activityType: 'foo',
          },
        });
        expect(wrapper.vm.content).toEqual(null);
      });

      it('calls the right method when action type is CaseNoteAdded', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForCaseNote').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.CaseNoteAdded)[0],
        });
        expect(wrapper.vm.makeContentForCaseNote).toHaveBeenCalledWith(CaseFileActivityType.CaseNoteAdded);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when action type is CaseNoteUpdated', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForCaseNote').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.CaseNoteUpdated)[0],
        });
        expect(wrapper.vm.makeContentForCaseNote).toHaveBeenCalledWith(CaseFileActivityType.CaseNoteUpdated);
        expect(wrapper.vm.content).toEqual(mockContent);
      });

      it('returns the correct data when activity type is FinancialAssistancePayment', async () => {
        const mockContent = { title: 'mock-title', body: 'mock-body' };
        jest.spyOn(wrapper.vm, 'makeContentForFinancialAssistancePayment').mockImplementation(() => (mockContent));
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.FinancialAssistancePayment)[0],
        });
        expect(wrapper.vm.makeContentForFinancialAssistancePayment).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.content).toEqual(mockContent);
      });
    });

    describe('icon', () => {
      it('returns the correct icon when action type is AddedTag', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.AddedTag)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is RemovedTag', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.RemovedTag)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is AddedDuplicateFlag', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.AddedDuplicateFlag)[0],

        });
        expect(wrapper.vm.icon).toEqual('$rctech-duplicate');
      });

      it('returns the correct icon when action type is RemovedDuplicateFlag', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.RemovedDuplicateFlag)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-duplicate');
      });

      it('returns the correct icon when action type is TriageUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.TriageUpdated)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is CaseFileStatusDeactivated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.CaseFileStatusDeactivated)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is CaseFileStatusClosed', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.CaseFileStatusClosed)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-lock');
      });

      it('returns the correct icon when action type is CaseFileStatusReopen', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.CaseFileStatusReopened)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-lock-open');
      });

      it('returns the correct icon when action type is CaseFileStatusArchived', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.CaseFileStatusArchived)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is AssignedToCaseFile', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.AssignedToCaseFile)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is UnassignedFromCaseFile', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.UnassignedFromCaseFile)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is IdentityAuthenticationUpdatedStatus', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.IdentityAuthenticationUpdatedStatus)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-shield-check');
      });

      it('returns the correct icon when action type is IdentityAuthenticationUpdatedId', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.IdentityAuthenticationUpdatedId)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-shield-check');
      });

      it('returns the correct icon when action type is ImpactStatusValidationUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.ImpactStatusValidationUpdated)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-map-check');
      });
      it('returns the correct icon in default case', async () => {
        await wrapper.setProps({
          item: {
            item: {
              userName: 'Jane Doe',
              roleName: { translation: { en: 'sys admin' } },
              actionDateTime: '2021-01-02',
              activityType: 'foo',
              details: { tags: [{ name: { translation: { en: 'tag 1' } } }, { name: { translation: { en: 'Tag 2' } } }] },
            },
          },
        });

        expect(wrapper.vm.icon).toEqual('mdi-message-text');
      });

      it('returns the correct icon when action type is ReferralAdded', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.ReferralAdded)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is ReferralUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.ReferralUpdated)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is DocumentDeactivated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.DocumentDeactivated)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is DocumentUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.DocumentUpdated)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is DocumentAdded', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.DocumentAdded)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when action type is CaseNoteAdded', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.CaseNoteAdded)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-message-text');
      });

      it('returns the correct icon when action type is CaseNoteUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.CaseNoteUpdated)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-message-text');
      });

      it('returns the correct icon when action type is PaymentCompleted', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.PaymentCompleted)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-currency-usd');
      });

      it('returns the correct icon when action type is AssessmentCompleted', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.AssessmentCompleted)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-message-text');
      });

      it('returns the correct icon when activity type is FinancialAssistancePayment', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.FinancialAssistancePayment)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-currency-usd');
      });
    });

    describe('Methods', () => {
      describe('makeContentForTags', () => {
        it('returns the correct data when action type is AddedTag', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.AddedTag)[0],

          });
          expect(wrapper.vm.makeContentForTags(CaseFileActivityType.AddedTag)).toEqual({
            title: `caseFileActivity.activityList.title.${CaseFileActivityType[CaseFileActivityType.AddedTag]}`,
            body: 'caseFileActivity.activityList.tags.tag_names: tag 1, Tag 2',
          });
        });

        it('returns the correct data when action type is RemovedTag', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.RemovedTag)[0],
          });

          expect(wrapper.vm.makeContentForTags(CaseFileActivityType.RemovedTag)).toEqual({
            title: `caseFileActivity.activityList.title.${CaseFileActivityType[CaseFileActivityType.RemovedTag]}`,
            body: 'caseFileActivity.activityList.tags.tag_names: tag 4',
          });
        });
      });

      describe('makeContentForAddedDuplicateFlag', () => {
        it('returns the correct data when action type is AddedDuplicateFlag', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.AddedDuplicateFlag)[0],
          });

          expect(wrapper.vm.makeContentForAddedDuplicateFlag()).toEqual({
            title: 'caseFileActivity.activityList.title.addedDuplicateFlag',
            body: 'DuplicateStatus.Added',
          });
        });
      });

      describe('makeContentForRemovedDuplicateFlag', () => {
        it('returns the correct data when action type is RemovedDuplicateFlag', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.RemovedDuplicateFlag)[0],
          });

          expect(wrapper.vm.makeContentForRemovedDuplicateFlag()).toEqual({
            title: 'caseFileActivity.activityList.title.removedDuplicateFlag',
            body: 'DuplicateStatus.Removed',
          });
        });
      });

      describe('makeContentForTriageUpdated', () => {
        it('returns the correct data when action type is TriageUpdated', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.TriageUpdated)[0],
          });

          expect(wrapper.vm.makeContentForTriageUpdated()).toEqual({
            title: 'caseFileActivity.activityList.title.triageUpdated',
            body: 'caseFileActivity.activityList.triage.new_triage: Tier 1',
          });
        });
      });

      describe('makeContentForCaseFileStatusDeactivated', () => {
        it('returns the correct data when action type is CaseFileStatusDeactivated', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.CaseFileStatusDeactivated)[0],
          });

          expect(wrapper.vm.makeContentForCaseFileStatusDeactivated()).toEqual({
            title: 'caseFileActivity.activityList.title.CaseFileStatusDeactivated',
            body: 'caseFileActivity.activityList.status.reason: Deceased\ncaseFileActivity.activityList.status.rationale: test',
          });
        });
      });

      describe('makeContentForCaseFileStatusClosed', () => {
        it('returns the correct data when action type is CaseFileStatusClosed', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.CaseFileStatusClosed)[0],
          });

          expect(wrapper.vm.makeContentForCaseFileStatusClosed()).toEqual({
            title: 'caseFileActivity.activityList.title.CaseFileStatusClosed',
            body: 'caseFileActivity.activityList.status.reason: End of CRC support\ncaseFileActivity.activityList.status.rationale: test',
          });
        });
      });

      describe('makeContentForCaseFileStatusArchived', () => {
        it('returns the correct data when action type is CaseFileStatusArchived', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.CaseFileStatusArchived)[0],
          });

          expect(wrapper.vm.makeContentForCaseFileStatusArchived()).toEqual({
            title: 'caseFileActivity.activityList.title.CaseFileStatusArchived',
            body: null,
          });
        });
      });

      describe('makeContentForCaseFileStatusReopened', () => {
        it('returns the correct data when action type is CaseFileStatusReopened', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.CaseFileStatusReopened)[0],
          });

          expect(wrapper.vm.makeContentForCaseFileStatusReopened()).toEqual({
            title: 'caseFileActivity.activityList.title.CaseFileStatusReopened',
            body: 'caseFileActivity.activityList.status.rationale: test',
          });
        });
      });

      describe('makeContentForAssignedToCaseFile', () => {
        it('returns the correct data when action type is makeContentForAssignedToCaseFile and there is only one name to display', async () => {
          const activity = {
            ...mockCaseFileActivities(CaseFileActivityType.AssignedToCaseFile)[0],
            details: {
              teams: [],
              individuals: [{ id: '1', name: 'Jack White' }],
            },

          };
          await wrapper.setProps({
            item: activity,
          });

          expect(wrapper.vm.makeContentForAssignedToCaseFile()).toEqual({
            title: 'caseFileActivity.activityList.title.AssignedToCaseFile',
            body: null,
          });
        });

        it(
          'returns the correct data when action type is makeContentForAssignedToCaseFile and there are several individuals and no team',
          async () => {
            const activity = {
              ...mockCaseFileActivities(CaseFileActivityType.AssignedToCaseFile)[0],
              details: {
                teams: [],
                individuals: [{ id: '1', name: 'Jack White' }, { id: '2', name: 'Joe Black' }],
              },

            };
            await wrapper.setProps({
              item: activity,
            });

            expect(wrapper.vm.makeContentForAssignedToCaseFile()).toEqual({
              title: 'caseFileActivity.activityList.title.assigned_new_users_teams',
              body: 'caseFileActivity.activityList.assign.new_user: Jack White, Joe Black\ncaseFileActivity.activityList.assign.new_team: -',
            });
          },
        );

        it(
          'returns the correct data when action type is makeContentForAssignedToCaseFile and there are several teams and no individuals',
          async () => {
            const activity = {
              ...mockCaseFileActivities(CaseFileActivityType.AssignedToCaseFile)[0],
              details: {
                teams: [{ id: '1', name: 'Team 1' }, { id: '1', name: 'Team 2' }],
                individuals: [],
              },

            };
            await wrapper.setProps({
              item: activity,
            });

            expect(wrapper.vm.makeContentForAssignedToCaseFile()).toEqual({
              title: 'caseFileActivity.activityList.title.assigned_new_users_teams',
              body: 'caseFileActivity.activityList.assign.new_user: -\ncaseFileActivity.activityList.assign.new_team: Team 1, Team 2',
            });
          },
        );
      });

      describe('makeContentForUnassignedFromCaseFile', () => {
        it('returns the correct data when action type is CaseFileStatusReopened', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.UnassignedFromCaseFile)[0],
          });

          expect(wrapper.vm.makeContentForUnassignedFromCaseFile()).toEqual({
            title: 'caseFileActivity.activityList.title.UnassignedFromCaseFile',
            body: null,
          });
        });
      });

      describe('makeContentForIdentityAuthenticationUpdatedStatus', () => {
        it('returns the correct data when action type is IdentityAuthenticationUpdated and status is Passed', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.IdentityAuthenticationUpdatedStatus)[0],
          });

          expect(wrapper.vm.makeContentForIdentityAuthenticationUpdatedStatus()).toEqual({
            title: 'caseFileActivity.activityList.title.IdentityAuthenticationUpdated',
            body: 'caseFileActivity.activityList.identity_authentication_updated: caseFile.beneficiaryIdentityVerificationStatus.Passed',
          });
        });

        it('returns the correct data when action type is IdentityAuthenticationUpdated and status is Failed', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.IdentityAuthenticationUpdatedStatus)[1],
          });

          expect(wrapper.vm.makeContentForIdentityAuthenticationUpdatedStatus()).toEqual({
            title: 'caseFileActivity.activityList.title.IdentityAuthenticationUpdated',
            body: 'caseFileActivity.activityList.identity_authentication_updated: caseFile.beneficiaryIdentityVerificationStatus.Failed',
          });
        });

        it('returns the correct data when action type is IdentityAuthenticationUpdated and status is NotVerified', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.IdentityAuthenticationUpdatedStatus)[2],
          });

          expect(wrapper.vm.makeContentForIdentityAuthenticationUpdatedStatus()).toEqual({
            title: 'caseFileActivity.activityList.title.IdentityAuthenticationUpdated',
            body: 'caseFileActivity.activityList.identity_authentication_updated: caseFile.beneficiaryIdentityVerificationStatus.NotVerified',
          });
        });
      });

      describe('makeContentForIdentityAuthenticationUpdatedId', () => {
        it('returns the correct data when action type is IdentityAuthenticationUpdatedId', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.IdentityAuthenticationUpdatedId)[0],
          });

          expect(wrapper.vm.makeContentForIdentityAuthenticationUpdatedId()).toEqual({
            title: 'caseFileActivity.activityList.title.IdentityAuthenticationUpdatedId',
            body: 'caseFileActivity.activityList.title.IdentityAuthenticationUpdatedId.idUpdated',
          });
        });
      });

      describe('makeContentForImpactStatusValidationUpdated', () => {
        it('returns the correct data when action type is ImpactStatusValidationUpdated and status is Impacted', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.ImpactStatusValidationUpdated)[0],
          });

          expect(wrapper.vm.makeContentForImpactStatusValidationUpdated()).toEqual({
            title: 'caseFileActivity.activityList.title.ImpactStatusValidationUpdated',
            body: 'caseFileActivity.activityList.impact_status_validation_updated: caseFile.beneficiaryImpactValidationStatus.Impacted',
          });
        });

        it('returns the correct data when action type is ImpactStatusValidationUpdated and status is NotImpacted', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.ImpactStatusValidationUpdated)[1],
          });

          expect(wrapper.vm.makeContentForImpactStatusValidationUpdated()).toEqual({
            title: 'caseFileActivity.activityList.title.ImpactStatusValidationUpdated',
            body: 'caseFileActivity.activityList.impact_status_validation_updated: caseFile.beneficiaryImpactValidationStatus.NotImpacted',
          });
        });

        it('returns the correct data when action type is ImpactStatusValidationUpdated and status is Undetermined', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.ImpactStatusValidationUpdated)[2],
          });

          expect(wrapper.vm.makeContentForImpactStatusValidationUpdated()).toEqual({
            title: 'caseFileActivity.activityList.title.ImpactStatusValidationUpdated',
            body: 'caseFileActivity.activityList.impact_status_validation_updated: caseFile.beneficiaryImpactValidationStatus.Undetermined',
          });
        });
      });

      describe('makeContentForReferralAdded', () => {
        it('returns the correct data when action type is ReferralAdded', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.ReferralAdded)[0],
          });

          expect(wrapper.vm.makeContentForReferralAdded()).toEqual({
            title: 'caseFileActivity.activityList.title.ReferralAdded',
            body: 'caseFileActivity.activityList.referral.referral_name: Mental Health',
          });
        });
      });

      describe('makeContentForReferralUpdated', () => {
        it('returns the correct data when action type is ReferralUpdated', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.ReferralUpdated)[0],
          });

          expect(wrapper.vm.makeContentForReferralUpdated()).toEqual({
            title: 'caseFileActivity.activityList.title.ReferralUpdated',
            body: 'caseFileActivity.activityList.referral.referral_name: Mental Health',
          });
        });
      });

      describe('makeContentForDocumentDeactivated', () => {
        it('returns the correct data when action type is DocumentDeactivated', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.DocumentDeactivated)[0],
          });

          expect(wrapper.vm.makeContentForDocumentDeactivated()).toEqual({
            title: 'caseFileActivity.activityList.title.DocumentDeactivated',
            body: 'caseFileActivity.activityList.document.document_name: void_cheque_rbc.pdf',
          });
        });
      });

      describe('makeContentForDocumentUpdated', () => {
        it('returns the correct data when action type is DocumentUpdated', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.DocumentUpdated)[0],
          });

          expect(wrapper.vm.makeContentForDocumentUpdated()).toEqual({
            title: 'caseFileActivity.activityList.title.DocumentUpdated',
            body: 'caseFileActivity.activityList.document.document_name: void_cheque_rbc.pdf',
          });
        });
      });

      describe('makeContentForDocumentAdded', () => {
        it('returns the correct data when action type is DocumentAdded', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.DocumentAdded)[0],
          });

          expect(wrapper.vm.makeContentForDocumentAdded()).toEqual({
            title: 'caseFileActivity.activityList.title.DocumentAdded',
            body: 'caseFileActivity.activityList.document.document_name: void_cheque_rbc.pdf',
          });
        });
      });

      describe('makeContentForCaseNote', () => {
        it('returns the correct data when action type is CaseNoteAdded', async () => {
          const item = mockCaseFileActivities(CaseFileActivityType.CaseNoteAdded)[0];

          await wrapper.setProps({
            item,
          });

          const category = item.details.caseNoteCategory.name.translation.en;
          let body = `caseFileActivity.activityList.caseNote.subject: ${item.details.subject}`;
          body += `\ncaseFileActivity.activityList.caseNote.category: ${category}`;

          expect(wrapper.vm.makeContentForCaseNote(CaseFileActivityType.CaseNoteAdded)).toEqual({
            title: 'caseFileActivity.activityList.title.CaseNoteAdded',
            body,
          });
        });

        it('returns the correct data when action type is CaseNoteUpdated', async () => {
          const item = mockCaseFileActivities(CaseFileActivityType.CaseNoteUpdated)[0];

          await wrapper.setProps({
            item,
          });

          const category = item.details.caseNoteCategory.name.translation.en;
          let body = `caseFileActivity.activityList.caseNote.subject: ${item.details.subject}`;
          body += `\ncaseFileActivity.activityList.caseNote.category: ${category}`;

          expect(wrapper.vm.makeContentForCaseNote(CaseFileActivityType.CaseNoteUpdated)).toEqual({
            title: 'caseFileActivity.activityList.title.CaseNoteUpdated',
            body,
          });
        });
      });

      describe('makeContentForRegistration', () => {
        it('returns the correct data when action type is Registration,  RegistrationType is crc and there is a registration method', async () => {
          const item = mockCaseFileActivities(CaseFileActivityType.Registration)[0];
          await wrapper.setProps({
            item,
          });
          const body = 'caseFileActivity.activityList.body.CRCRegistration\ncaseFileActivity.activityList.body.registrationMethod: enums.RegistrationMethod.Phone';

          expect(wrapper.vm.makeContentForRegistration()).toEqual({
            title: 'caseFileActivity.activityList.title.Registration',
            body,
          });
        });

        it('returns the correct data when action type is Registration,  RegistrationType is crc and registration method is in person and has location', async () => {
          const item = {
            ...mockCaseFileActivities(CaseFileActivityType.Registration)[0],
            details: {
              ...mockCaseFileActivities(CaseFileActivityType.Registration)[0].details,
              registrationMethod: ERegistrationMethod.InPerson,
              registrationLocation: { translation: { en: 'Town Hall', fr: '' } },
            },
          };
          await wrapper.setProps({
            item,
          });
          let body = 'caseFileActivity.activityList.body.CRCRegistration\ncaseFileActivity.activityList.body.registrationMethod: enums.RegistrationMethod.InPerson';
          body += '\ncaseFileActivity.activityList.body.registrationLocation: Town Hall';

          expect(wrapper.vm.makeContentForRegistration()).toEqual({
            title: 'caseFileActivity.activityList.title.Registration',
            body,
          });
        });

        it('returns the correct data when action type is Registration and RegistrationType is public', async () => {
          const item = mockCaseFileActivities(CaseFileActivityType.Registration)[1];

          await wrapper.setProps({
            item,
          });
          const body = 'caseFileActivity.activityList.body.PublicRegistration';

          expect(wrapper.vm.makeContentForRegistration()).toEqual({
            title: 'caseFileActivity.activityList.title.Registration',
            body,
          });
        });
      });

      it('returns the correct data when action type is PaymentSubmitted', async () => {
        const item = mockCaseFileActivities(CaseFileActivityType.PaymentSubmitted)[0];

        await wrapper.setProps({
          item,
        });
        const amount = wrapper.vm.$formatCurrency(item.details.totalAmount);
        const body = `${item.details.paymentName}: ${amount}`;
        expect(wrapper.vm.makeContentForFinancialAssistancePaymentSubmit()).toEqual({
          title: 'caseFileActivity.activityList.title.PaymentSubmitted',
          body,
        });
      });

      it('returns the correct data when action type is HouseholdEdited', async () => {
        const item = mockCaseFileActivities(CaseFileActivityType.HouseholdEdited)[0];
        wrapper.vm.makeHouseholdEditedBody = jest.fn(() => 'mock-body');

        await wrapper.setProps({
          item,
        });
        expect(wrapper.vm.makeContentForHouseholdEdited()).toEqual({
          title: 'caseFileActivity.activityList.title.HouseholdEdited',
          body: 'mock-body',
        });
      });

      describe('makeContentForAssessmentCompleted', () => {
        it('returns the correct data when activity type is AssessmentCompleted', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.AssessmentCompleted)[0],
          });

          const body = wrapper.vm.$t('caseFileActivity.activityList.body.assessmentCompleted.name', { x: 'mock assessment' });

          expect(wrapper.vm.makeContentForAssessmentCompleted()).toEqual({
            title: 'caseFileActivity.activityList.title.AssessmentCompleted',
            body,
          });
        });
      });
    });

    describe('makeContentForHouseholdSplit', () => {
      it('returns the correct data when action type is HouseholdSplit', async () => {
        const item = mockCaseFileActivities(CaseFileActivityType.HouseholdSplit)[0];

        await wrapper.setProps({
          item,
        });
        expect(wrapper.vm.makeContentForHouseholdSplit()).toEqual({
          title: 'caseFileActivity.activityList.title.HouseholdSplitTo',
          body: 'caseFileActivity.activityList.body.HouseholdSplitfirstname1 lastname, firstname2 lastname',
        });
      });
    });

    describe('makeContentForHouseholdCreatedAfterSplit', () => {
      it('returns the correct data when action type is HouseholdCreatedAfterSplit', async () => {
        const item = mockCaseFileActivities(CaseFileActivityType.HouseholdCreatedAfterSplit)[0];

        await wrapper.setProps({
          item,
        });
        expect(wrapper.vm.makeContentForHouseholdCreatedAfterSplit()).toEqual({
          title: 'caseFileActivity.activityList.title.HouseholdSplitFrom',
          body: 'caseFileActivity.activityList.body.HouseholdSplitfirstname1 lastname, firstname2 lastname',
        });
      });
    });

    describe('makeContentForHouseholdMovedMembersOut', () => {
      it('returns the correct data when activity type is HouseholdMovedMembersOut', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.HouseholdMovedMembersOut)[0],
        });

        expect(wrapper.vm.makeContentForHouseholdMovedMembersOut()).toEqual({
          title: 'caseFileActivity.activityList.title.HouseholdMovedMembersOut',
          body: 'caseFileActivity.activityList.body.HouseholdMovedMembersfirstname1 lastname, firstname2 lastname',
        });
      });
    });

    describe('makeContentForHouseholdMovedMembersIn', () => {
      it('returns the correct data when activity type is HouseholdMovedMembersIn', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.HouseholdMovedMembersIn)[0],
        });

        expect(wrapper.vm.makeContentForHouseholdMovedMembersIn()).toEqual({
          title: 'caseFileActivity.activityList.title.HouseholdMovedMembersIn',
          body: 'caseFileActivity.activityList.body.HouseholdMovedMembersfirstname1 lastname, firstname2 lastname',
        });
      });
    });

    describe('makeContentForFinancialAssistancePaymentCompleted', () => {
      it('returns the correct data when activity type is PaymentCompleted', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.PaymentCompleted)[0],
        });

        let body = 'caseFileActivity.activityList.body.paymentCompleted.name: mock payment';
        body += '\ncaseFileActivity.activityList.body.paymentCompleted.modality: enums.PaymentModality.DirectDeposit';
        body += '\ncaseFileActivity.activityList.body.paymentCompleted.amount: $5,115.20';

        expect(wrapper.vm.makeContentForFinancialAssistancePaymentCompleted()).toEqual({
          title: 'caseFileActivity.activityList.title.PaymentCompleted',
          body,
        });
      });
    });

    describe('makeContentForFinancialAssistancePayment', () => {
      it('returns the correct data when action type is PaymentRequestAdditionalInfo', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.FinancialAssistancePayment)[0],
        });
        let title = `${wrapper.vm.$t('caseFileActivity.activityList.title.FinancialAssistancePayment')} - `;
        title += wrapper.vm.$t(`enums.approvalAction.${ApprovalAction[wrapper.vm.item.details.approvalAction]}`);
        let body = 'caseFileActivity.activityList.body.paymentCompleted.name: mock payment';
        body += '\ncaseFileActivity.activityList.body.paymentCompleted.amount: $5,115.20';

        expect(wrapper.vm.makeContentForFinancialAssistancePayment()).toEqual({
          title,
          body,
        });
      });
    });

    describe('makeHouseholdEditedBody', () => {
      it('returns the right string', async () => {
        let item = {
          ...mockCaseFileActivities(CaseFileActivityType.HouseholdEdited)[0],
          details: { householdActivityType: HouseholdCaseFileActivityType.IdentitySetEdited },
        };
        await wrapper.setProps({ item });
        expect(wrapper.vm.makeHouseholdEditedBody()).toEqual('household.history.action.personal_information_changed');

        item = {
          ...mockCaseFileActivities(CaseFileActivityType.HouseholdEdited)[0],
          details: { householdActivityType: HouseholdCaseFileActivityType.ContactInformationEdited },
        };
        await wrapper.setProps({ item });
        expect(wrapper.vm.makeHouseholdEditedBody()).toEqual('household.history.action.contact_information_changed');

        item = {
          ...mockCaseFileActivities(CaseFileActivityType.HouseholdEdited)[0],
          details: { householdActivityType: HouseholdCaseFileActivityType.TempAddressEdited },
        };
        await wrapper.setProps({ item });
        expect(wrapper.vm.makeHouseholdEditedBody()).toEqual('household.history.action.temporary_address_changed');

        item = {
          ...mockCaseFileActivities(CaseFileActivityType.HouseholdEdited)[0],
          details: { householdActivityType: HouseholdCaseFileActivityType.HomeAddressEdited },
        };
        await wrapper.setProps({ item });
        expect(wrapper.vm.makeHouseholdEditedBody()).toEqual('household.history.action.address_information_changed');

        item = {
          ...mockCaseFileActivities(CaseFileActivityType.HouseholdEdited)[0],
          details: { householdActivityType: HouseholdCaseFileActivityType.MemberAdded, member: { id: '1', name: 'Jane Doe' } },
        };
        await wrapper.setProps({ item });
        expect(wrapper.vm.makeHouseholdEditedBody()).toEqual('household.history.action.household_member_added: Jane Doe');

        item = {
          ...mockCaseFileActivities(CaseFileActivityType.HouseholdEdited)[0],
          details: { householdActivityType: HouseholdCaseFileActivityType.MemberRemoved, member: { id: '1', name: 'Jane Doe' } },
        };
        await wrapper.setProps({ item });
        expect(wrapper.vm.makeHouseholdEditedBody()).toEqual('household.history.action.household_member_removed: Jane Doe');

        item = {
          ...mockCaseFileActivities(CaseFileActivityType.HouseholdEdited)[0],
          details: { householdActivityType: HouseholdCaseFileActivityType.PrimaryAssigned, member: { id: '1', name: 'Jane Doe' } },
        };
        await wrapper.setProps({ item });
        expect(wrapper.vm.makeHouseholdEditedBody()).toEqual('household.history.action.household_member_assign_primary: Jane Doe');
      });
    });
  });
});
