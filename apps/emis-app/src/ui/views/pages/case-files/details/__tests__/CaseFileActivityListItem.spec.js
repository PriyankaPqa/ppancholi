import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFileActivityType, mockCaseFileActivities, HouseholdCaseFileActivityType } from '@libs/entities-lib/case-file';
import { ERegistrationMethod } from '@libs/shared-lib/src/types/enums/ERegistrationMethod';
import { ApprovalAction } from '@libs/entities-lib/financial-assistance-payment';
import { HouseholdStatus } from '@libs/entities-lib/household';

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

      it(
        'returns the correct data when activity type is TempAddressUpdated or ImpactedIndividualReceivingAssistance or ImpactedIndividualNoLongerReceivingAssistance',
        async () => {
          const mockContent = { title: 'mock-title', body: 'mock-body' };
          jest.spyOn(wrapper.vm, 'makeContentForImpactedIndividualsEdited').mockImplementation(() => (mockContent));
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.TempAddressUpdated)[0],
          });
          expect(wrapper.vm.makeContentForImpactedIndividualsEdited).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.content).toEqual(mockContent);

          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.ImpactedIndividualReceivingAssistance)[0],
          });
          expect(wrapper.vm.makeContentForImpactedIndividualsEdited).toHaveBeenCalledTimes(2);
          expect(wrapper.vm.content).toEqual(mockContent);

          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.ImpactedIndividualNoLongerReceivingAssistance)[0],
          });
          expect(wrapper.vm.makeContentForImpactedIndividualsEdited).toHaveBeenCalledTimes(3);
          expect(wrapper.vm.content).toEqual(mockContent);
        },
      );
    });

    // eslint-disable-next-line max-statements
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

      it('returns the correct icon when action type is AssessmentAdded', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.AssessmentAdded)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-message-text');
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

      it('returns the correct icon when activity type is CaseFileLabelsUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.CaseFileLabelsUpdated)[0],
        });
        expect(wrapper.vm.icon).toEqual('mdi-message-text');
      });

      it('returns the correct icon when activity type is TempAddressUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.TempAddressUpdated)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when activity type is ImpactedIndividualReceivingAssistance', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.ImpactedIndividualReceivingAssistance)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when activity type is ImpactedIndividualNoLongerReceivingAssistance', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.ImpactedIndividualNoLongerReceivingAssistance)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when activity type is TaskManagementTaskCreated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.TaskManagementTaskCreated)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when activity type is TaskManagementTaskCompleted', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.TaskManagementTaskCompleted)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
      });

      it('returns the correct icon when activity type is RecoveryPlanUpdate', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.RecoveryPlanUpdate)[0],
        });
        expect(wrapper.vm.icon).toEqual('$rctech-actions');
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
        it('returns the correct data when action type is CaseFileStatusArchived and there is no rationale', async () => {
          await wrapper.setProps({
            item: { ...mockCaseFileActivities(CaseFileActivityType.CaseFileStatusArchived)[0], details: { rationale: null } },
          });

          expect(wrapper.vm.makeContentForCaseFileStatusArchived()).toEqual({
            title: 'caseFileActivity.activityList.title.CaseFileStatusArchived',
            body: '',
          });
        });

        it('returns the correct data when action type is CaseFileStatusArchived and there is a rationale', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.CaseFileStatusArchived)[0],
          });

          expect(wrapper.vm.makeContentForCaseFileStatusArchived()).toEqual({
            title: 'caseFileActivity.activityList.title.CaseFileStatusArchived',
            body: `caseFileActivity.activityList.status.rationale: ${wrapper.vm.item.details.rationale}`,
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
        describe('New format', () => {
          it('returns the correct data when action type is makeContentForAssignedToCaseFile and there is only one name to display', async () => {
            const activity = {
              ...mockCaseFileActivities(CaseFileActivityType.AssignedToCaseFile)[0],
              details: {
                teams: [],
                teamMembers: [
                  {
                    team: { id: '0', name: 'test-team' },
                    teamMembers: [{ id: '1', name: 'Jack White' }],
                  },
                ],
              },

            };
            await wrapper.setProps({
              item: activity,
            });

            expect(wrapper.vm.makeContentForAssignedToCaseFile()).toEqual({
              title: { key: 'caseFileActivity.activityList.title.AssignedToCaseFile', params: [{ x: 'Jack White, test-team' }] },
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
                  teamMembers: [
                    {
                      team: { id: '0', name: 'test-team' },
                      teamMembers: [{ id: '1', name: 'Jack White' }, { id: '2', name: 'Joe Black' }],
                    },
                  ],
                },

              };
              await wrapper.setProps({
                item: activity,
              });

              expect(wrapper.vm.makeContentForAssignedToCaseFile()).toEqual({
                title: 'caseFileActivity.activityList.title.assigned_new_users_teams',
                body: 'caseFileActivity.activityList.assign.new_user: Jack White, test-team; Joe Black, test-team\ncaseFileActivity.activityList.assign.new_team: -',
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
                  teamMembers: [],
                },

              };
              await wrapper.setProps({
                item: activity,
              });

              expect(wrapper.vm.makeContentForAssignedToCaseFile()).toEqual({
                title: 'caseFileActivity.activityList.title.assigned_new_users_teams',
                body: 'caseFileActivity.activityList.assign.new_user: -\ncaseFileActivity.activityList.assign.new_team: Team 1; Team 2',
              });
            },
          );
        });
        describe('Old format', () => {
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
              title: { key: 'caseFileActivity.activityList.title.AssignedToCaseFile', params: [{ x: 'Jack White' }] },
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
      });

      describe('makeContentForUnassignedFromCaseFile', () => {
        describe('New format', () => {
          it('returns the correct data when action type is UnassignedFromCaseFile', async () => {
            const activity = {
              ...mockCaseFileActivities(CaseFileActivityType.UnassignedFromCaseFile)[0],
              details: {
                teams: [],
                teamMembers: [
                  {
                    team: { id: '0', name: 'test-team' },
                    teamMembers: [{ id: '1', name: 'Jack White' }],
                  },
                ],
              },

            };
            await wrapper.setProps({
              item: activity,
            });

            expect(wrapper.vm.makeContentForUnassignedFromCaseFile()).toEqual({
              title: { key: 'caseFileActivity.activityList.title.UnassignedFromCaseFile', params: [{ x: 'Jack White, test-team' }] },
              body: null,
            });
          });
        });

        describe('Old format', () => {
          it('returns the correct data when action type is CaseFileStatusReopened', async () => {
            await wrapper.setProps({
              item: mockCaseFileActivities(CaseFileActivityType.UnassignedFromCaseFile)[0],
            });

            expect(wrapper.vm.makeContentForUnassignedFromCaseFile())
              .toEqual({
                title: {
                  key: 'caseFileActivity.activityList.title.UnassignedFromCaseFile',
                  params: [{ x: 'John Stevenson, Steven Johnson, Team 1, Team 2' }],
                },
                body: null,
              });
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
            body: 'caseFileActivity.activityList.identity_authentication_updated: caseFile.beneficiaryIdentityVerificationStatus.NotVerified',
          });
        });

        it('returns the correct data when this is a tier 2', async () => {
          const activity = mockCaseFileActivities(CaseFileActivityType.IdentityAuthenticationUpdatedId)[0];
          activity.details.isTier2 = true;
          activity.details.manualVerification = true;
          await wrapper.setProps({
            item: activity,
          });

          expect(wrapper.vm.makeContentForIdentityAuthenticationUpdatedId()).toEqual({
            title: 'caseFileActivity.activityList.title.IdentityAuthenticationUpdatedId',
            // eslint-disable-next-line vue/max-len
            body: 'caseFileActivity.authentication.tier2\ncaseFileActivity.authentication.manualVerification\ncaseFileActivity.activityList.identity_authentication_updated: caseFile.beneficiaryIdentityVerificationStatus.NotVerified',
          });
        });

        it('returns the correct data when action type is IdentityAuthenticationUpdatedId and status same', async () => {
          const activity = {
            ...mockCaseFileActivities(CaseFileActivityType.IdentityAuthenticationUpdatedId)[0],
            details: {
              status: 1,
              previousStatus: 1,
            },

          };
          await wrapper.setProps({
            item: activity,
          });

          expect(wrapper.vm.makeContentForIdentityAuthenticationUpdatedId()).toEqual({
            title: 'caseFileActivity.activityList.title.IdentityAuthenticationUpdatedId',
            body: 'caseFileActivity.activityList.identity_authentication_status: caseFile.beneficiaryIdentityVerificationStatus.Passed',
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
          wrapper.vm.$t = jest.fn((k) => k);
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
          wrapper.vm.$t = jest.fn((k) => k);
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
          const body = 'caseFileActivity.activityList.body.PublicRegistration.individual';

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

      describe('makeContentForAssessmentAdded', () => {
        it('returns the correct data when activity type is AssessmentAdded', async () => {
          await wrapper.setProps({
            item: mockCaseFileActivities(CaseFileActivityType.AssessmentAdded)[0],
          });

          const body = wrapper.vm.$t('caseFileActivity.activityList.body.assessmentAdded.name', { x: 'mock assessment' });

          expect(wrapper.vm.makeContentForAssessmentAdded()).toEqual({
            title: 'caseFileActivity.activityList.title.AssessmentAdded',
            body,
          });
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
          title: { key: 'caseFileActivity.activityList.title.HouseholdSplitTo', params: [{ x: 'registrationNumber' }] },
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
          title: { key: 'caseFileActivity.activityList.title.HouseholdSplitFrom', params: [{ x: 'registrationNumber' }] },
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
          title: { key: 'caseFileActivity.activityList.title.HouseholdMovedMembersOut', params: [{ x: 'registrationNumber' }] },
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
          title: { key: 'caseFileActivity.activityList.title.HouseholdMovedMembersIn', params: [{ x: 'registrationNumber' }] },
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

    describe('makeContentForFinancialAssistancePaymentCorrected', () => {
      it('returns the correct data when action type is PaymentCorrected', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.PaymentCorrected)[0],
        });
        const title = 'caseFileActivity.activityList.title.FinancialAssistancePaymentUpdated';
        const body = wrapper.vm.$t('caseFileActivity.activityList.body.paymentDataCorrected', { x: 'mock payment' });

        expect(wrapper.vm.makeContentForFinancialAssistancePaymentCorrected()).toEqual({
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
        wrapper.vm.makeHouseholdRegistrationDetailsBody = jest.fn(() => ' mock-registration-details-body');
        await wrapper.setProps({ item });
        expect(wrapper.vm.makeHouseholdEditedBody()).toEqual('household.history.action.household_member_assign_primary: Jane Doe mock-registration-details-body');
      });
    });

    describe('makeHouseholdRegistrationDetailsBody', () => {
      it('returns the correct data when there is a registration method', async () => {
        const item = {
          ...mockCaseFileActivities(CaseFileActivityType.Registration)[0],
          details: {
            ...mockCaseFileActivities(CaseFileActivityType.Registration)[0].details,
            registrationMethod: ERegistrationMethod.Phone,
          },
        };
        wrapper.vm.$t = jest.fn((k) => k);
        await wrapper.setProps({
          item,
        });
        const body = '\ncaseFileActivity.activityList.body.registrationMethod: enums.RegistrationMethod.Phone';

        expect(wrapper.vm.makeHouseholdRegistrationDetailsBody(wrapper.vm.item.details)).toEqual(body);
      });

      it('returns the correct data when registration method is in person and has location', async () => {
        const item = {
          ...mockCaseFileActivities(CaseFileActivityType.Registration)[0],
          details: {
            ...mockCaseFileActivities(CaseFileActivityType.Registration)[0].details,
            registrationMethod: ERegistrationMethod.InPerson,
            registrationLocation: { translation: { en: 'Town Hall', fr: '' } },
          },
        };
        wrapper.vm.$t = jest.fn((k) => k);
        await wrapper.setProps({
          item,
        });
        let body = '\ncaseFileActivity.activityList.body.registrationMethod: enums.RegistrationMethod.InPerson';
        body += '\ncaseFileActivity.activityList.body.registrationLocation: Town Hall';

        expect(wrapper.vm.makeHouseholdRegistrationDetailsBody(wrapper.vm.item.details)).toEqual(body);
      });

      it('returns the correct data when registration method is in person and has location and event name', async () => {
        const item = {
          ...mockCaseFileActivities(CaseFileActivityType.Registration)[0],
          details: {
            ...mockCaseFileActivities(CaseFileActivityType.Registration)[0].details,
            registrationMethod: ERegistrationMethod.InPerson,
            registrationLocation: { translation: { en: 'Town Hall', fr: '' } },
            eventName: { translation: { en: 'Quebec Earthquake', fr: '' } },
          },
        };
        wrapper.vm.$t = jest.fn((k) => k);
        await wrapper.setProps({
          item,
        });
        let body = '\ncaseFileActivity.activityList.body.registrationMethod: enums.RegistrationMethod.InPerson';
        body += '\ncaseFileActivity.activityList.body.registrationLocation: Town Hall - Quebec Earthquake';

        expect(wrapper.vm.makeHouseholdRegistrationDetailsBody(wrapper.vm.item.details)).toEqual(body);
      });
    });

    describe('makeContentForCaseFileLabelsUpdated', () => {
      it('returns the correct data when action type is CaseFileLabelsUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.CaseFileLabelsUpdated)[0],
        });

        const title = wrapper.vm.$t('caseFileActivity.activityList.title.CaseFileLabelsUpdated');
        let body = `${wrapper.vm.$t('caseFileActivity.activityList.body.PreviousLabels')}: `;
        body += wrapper.vm.item.details.previousLabels.filter((label) => label.name.trim().length > 0).map((label) => label.name).join(' | ');

        body += `\n${wrapper.vm.$t('caseFileActivity.activityList.body.NewLabels')}: `;
        body += wrapper.vm.item.details.newLabels.filter((label) => label.name.trim().length > 0).map((label) => label.name).join(' | ');

        expect(wrapper.vm.makeContentForCaseFileLabelsUpdated()).toEqual({
          title,
          body,
        });
      });
    });

    describe('makeContentForHouseholdStatusChanged', () => {
      it('returns the correct data when action type is CaseFileLabelsUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.HouseholdStatusChanged)[0],
        });

        const title = wrapper.vm.$t('caseFileActivity.activityList.title.HouseholdEdited');
        let body = `${wrapper.vm.$t('caseFileActivity.activityList.body.HouseholdStatusChanged')}`;
        body += `\n${wrapper.vm.$t(`household.profile.householdStatus.${HouseholdStatus[wrapper.vm.item.details.oldHouseholdStatus]}`)}`;
        body += ` ${wrapper.vm.$t('caseFileActivity.activityList.body.HouseholdStatusChanged.to')} `;
        body += `${wrapper.vm.$t(`household.profile.householdStatus.${HouseholdStatus[wrapper.vm.item.details.newHouseholdStatus]}`)}`;
        body += '\nrationale in EN';

        expect(wrapper.vm.makeContentForHouseholdStatusChanged()).toEqual({
          title,
          body,
        });
      });
    });

    describe('makeContentForImpactedIndividualsEdited', () => {
      it('should return proper data when action type is TempAddressUpdated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.TempAddressUpdated)[0],
        });
        const title = wrapper.vm.$t('caseFileActivity.activityList.title.ImpactedIndividualsEdited');
        let body = `${wrapper.vm.item.details.member.name} - `;
        body += wrapper.vm.$t('caseFileActivity.activityList.body.temporaryAddressUpdated');

        expect(wrapper.vm.makeContentForImpactedIndividualsEdited()).toEqual({
          title,
          body,
        });
      });

      it('should return proper data when action type is ImpactedIndividualReceivingAssistance', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.ImpactedIndividualReceivingAssistance)[0],
        });
        const title = wrapper.vm.$t('caseFileActivity.activityList.title.ImpactedIndividualsEdited');
        let body = `${wrapper.vm.item.details.member.name} - `;
        body += `${wrapper.vm.$t('caseFileActivity.activityList.body.receivingAssistance')} \n${wrapper.vm.item.details.rationale}`;

        expect(wrapper.vm.makeContentForImpactedIndividualsEdited()).toEqual({
          title,
          body,
        });
      });

      it('should return proper data when action type is ImpactedIndividualNoLongerReceivingAssistance', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.ImpactedIndividualNoLongerReceivingAssistance)[0],
        });
        const title = wrapper.vm.$t('caseFileActivity.activityList.title.ImpactedIndividualsEdited');
        let body = `${wrapper.vm.item.details.member.name} - `;
        body += `${wrapper.vm.$t('caseFileActivity.activityList.body.noLongerReceivingAssistance')} \n${wrapper.vm.item.details.rationale}`;

        expect(wrapper.vm.makeContentForImpactedIndividualsEdited()).toEqual({
          title,
          body,
        });
      });
    });

    describe('makeContentForTaskManagementAction', () => {
      it('should return proper data when action type is TaskManagementTaskCreated', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.TaskManagementTaskCreated)[0],
        });
        const title = wrapper.vm.$t('caseFileActivity.activityList.title.TaskManagement.Created');
        const body = wrapper.vm.$t('caseFileActivity.activityList.body.TaskManagement.Created', { x: wrapper.vm.$m(wrapper.vm.item.details.name.name) });
        expect(wrapper.vm.makeContentForTaskManagementAction()).toEqual({
          title,
          body,
        });
      });

      it('should return proper data when action type is TaskManagementTaskCompleted', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.TaskManagementTaskCompleted)[0],
        });
        const title = wrapper.vm.$t('caseFileActivity.activityList.title.TaskManagement.Completed');
        const body = wrapper.vm.$t('caseFileActivity.activityList.body.TaskManagement.Completed', { x: wrapper.vm.$m(wrapper.vm.item.details.name.name) });
        expect(wrapper.vm.makeContentForTaskManagementAction()).toEqual({
          title,
          body,
        });
      });
    });

    describe('makeContentForRecoveryPlanUpdate', () => {
      it('should return proper data when action type is RecoveryPlanUpdate, hasRecoveryPlan is false', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.RecoveryPlanUpdate)[0],
        });
        const title = wrapper.vm.$t('caseFileActivity.activityList.title.recoveryPlanUpdate');
        const body = `${wrapper.vm.$t('caseFileActivity.activityList.body.hasRecoveryPlan')} ${wrapper.vm.$t('common.no')}`;
        expect(wrapper.vm.makeContentForRecoveryPlanUpdate()).toEqual({
          title,
          body,
        });
      });

      it('should return proper data when action type is RecoveryPlanUpdate, hasRecoveryPlan is true, crcProvided is false', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.RecoveryPlanUpdate)[1],
        });
        const title = wrapper.vm.$t('caseFileActivity.activityList.title.recoveryPlanUpdate');
        let body = `${wrapper.vm.$t('caseFileActivity.activityList.body.hasRecoveryPlan')} ${wrapper.vm.$t('common.yes')}`;
        body += `\n${wrapper.vm.$t('caseFileActivity.activityList.body.crcProvided')} `;
        body += wrapper.vm.$t('common.no');

        expect(wrapper.vm.makeContentForRecoveryPlanUpdate()).toEqual({
          title,
          body,
        });
      });

      it('should return proper data when action type is RecoveryPlanUpdate, hasRecoveryPlan is false', async () => {
        await wrapper.setProps({
          item: mockCaseFileActivities(CaseFileActivityType.RecoveryPlanUpdate)[2],
        });
        const title = wrapper.vm.$t('caseFileActivity.activityList.title.recoveryPlanUpdate');
        let body = `${wrapper.vm.$t('caseFileActivity.activityList.body.hasRecoveryPlan')} ${wrapper.vm.$t('common.yes')}`;
        body += `\n${wrapper.vm.$t('caseFileActivity.activityList.body.crcProvided')} `;
        body += wrapper.vm.$t('common.yes');
        body += `\n${wrapper.vm.$t('caseFileActivity.activityList.body.startDate')} `;
        body += 'Nov 26, 2023';
        expect(wrapper.vm.makeContentForRecoveryPlanUpdate()).toEqual({
          title,
          body,
        });
      });
    });
  });
});
