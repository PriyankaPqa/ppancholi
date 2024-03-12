import flushPromises from 'flush-promises';
import _orderBy from 'lodash/orderBy';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { useMockCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral.mock';
import { CaseFileActivityType, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';

import { mockProvider } from '@/services/provider';
import Component from '../CaseFileSummary.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia, userAccountMetadataStore } = useMockUserAccountStore();
const { caseFileReferralStore } = useMockCaseFileReferralStore(pinia);
const { teamStore } = useMockTeamStore(pinia);
const { caseFileStore } = useMockCaseFileStore(pinia);

describe('CaseFileSummary.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        caseFileId: 'abcd',
      },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $services: services,
      },
      ...additionalOverwrites,
    });

    await flushPromises();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    caseFileReferralStore.getByCaseFile = jest.fn(() => [{ entity: {} }]);
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls all the required fetch from services', async () => {
        await mountWrapper(true, 6, 'role');
        await wrapper.setData({
          combinedUserAccountStore: { search: jest.fn() },
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();

        const services = wrapper.vm.$services;
        expect(services.caseFiles.getSummary).toHaveBeenCalledWith('abcd');
        expect(services.caseFilesMetadata.getSummary).toHaveBeenCalledWith('abcd');
        expect(teamStore.getTeamsAssigned).toHaveBeenCalledWith('abcd');
        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledWith({
          filter: {
            Entity: {
              Id: {
                searchIn_az: [
                  'mock-assigned-individual-id-1',
                  'mock-assigned-individual-id-2',
                  'mock-assigned-individual-id-3',
                ],
              },
            },
          },
          queryType: 'full',
          searchMode: 'all',
        });
        expect(caseFileReferralStore.fetchAll).toHaveBeenCalledWith({ caseFileId: 'abcd' });
        expect(caseFileReferralStore.getByCaseFile).toHaveBeenCalledWith('abcd');
        expect(wrapper.vm.hasReferrals).toEqual(true);
        expect(caseFileStore.fetchCaseFileActivities).toHaveBeenCalledWith('abcd');
        expect(wrapper.vm.activities).toEqual(_orderBy(caseFileStore.fetchCaseFileActivities('abcd'), 'created', 'desc'));
      });
    });
  });

  describe('Methods', () => {
    describe('getHouseholdMembers', () => {
      it('calls the household history to get the members at the time of closing - 1 minute', async () => {
        await mountWrapper();
        jest.clearAllMocks();
        wrapper.vm.closeActivity.created = '2020-02-01T00:05:00Z';

        // 02 will be ignored as the change >  wrapper.vm.closeActivity.created - 1 minute
        wrapper.vm.$services.households.getHouseholdHistory = jest.fn(() => [
          {
            timestamp: '2020-02-01T00:03:10Z',
            entity: {
              primaryBeneficiary: '01',
            },
          },
          {
            timestamp: '2020-02-01T00:04:55Z',
            entity: {
              primaryBeneficiary: '02',
            },
          },
        ]);

        wrapper.vm.$services.households.getHouseholdMetadataHistory = jest.fn(() => [
          {
            timestamp: '2020-01-01T00:00:00Z',
            entity: {
              memberMetadata: [
                {
                  id: '02', firstName: 'firstName2', lastName: 'lName2', dateOfBirth: '1991-01-01T00:00:00Z',
                },
                {
                  id: '01', firstName: 'firstName', lastName: 'lastName', dateOfBirth: '1990-01-01T00:00:00Z',
                },
              ],
            },
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            entity: {
              memberMetadata: [
                {
                  id: '01', firstName: 'firstName', lastName: 'lastName', dateOfBirth: '1990-01-01T00:00:00Z',
                },
              ],
            },
          },
        ]);
        await wrapper.vm.getHouseholdMembers();
        expect(wrapper.vm.$services.households.getHouseholdMetadataHistory).toHaveBeenCalledWith(caseFileStore.fetch().householdId);
        expect(wrapper.vm.householdMembers).toEqual([
          { birthDate: helpers.getLocalStringDate('1991-01-01T00:00:00Z', 'HouseholdMemberMetadata.dateOfBirth', 'PP'), name: 'firstName2 lName2' },
        ]);
        expect(wrapper.vm.primary).toEqual(
          { birthDate: helpers.getLocalStringDate('1990-01-01T00:00:00Z', 'HouseholdMemberMetadata.dateOfBirth', 'PP'), name: 'firstName lastName' },
        );
      });
    });

    describe('getAssignedIndividualsInfo', () => {
      it('calls sharedHelpers callSearchInInBatches with the right payload', async () => {
        await mountWrapper();
        await wrapper.setData({ caseFile: { ...mockCaseFileEntity(), assignedTeamMembers: [{ teamMembersIds: ['id-1'] }] } });
        sharedHelpers.callSearchInInBatches = jest.fn();
        await wrapper.vm.getAssignedIndividualsInfo();
        expect(sharedHelpers.callSearchInInBatches).toHaveBeenCalledWith({
          ids: ['id-1'],
          service: wrapper.vm.combinedUserAccountStore,
          searchInFilter: { Entity: { Id: { searchIn_az: '{ids}' } } },
          otherOptions: {
            queryType: 'full',
            searchMode: 'all',
          },
        });
      });
    });
  });

  describe('Computed', () => {
    describe('assignedIndividualIds', () => {
      it('should return the right value', async () => {
        await mountWrapper();
        await wrapper.setData({ caseFile: { ...mockCaseFileEntity(), assignedTeamMembers: [{ teamMembersIds: ['id-01', 'id-02'] }, { teamMembersIds: ['id-11', 'id-12'] }] } });
        expect(wrapper.vm.assignedIndividualIds).toEqual(['id-01', 'id-02', 'id-11', 'id-12']);
      });
    });

    describe('assignedUserAccounts', () => {
      it('returns the right value', async () => {
        await mountWrapper();
        userAccountMetadataStore.getByIds = jest.fn(() => [mockUserAccountMetadata({ displayName: 'John Smith' }), mockUserAccountMetadata({ displayName: 'Jane Doe' })]);
        expect(wrapper.vm.assignedUserAccounts).toEqual(['John Smith', 'Jane Doe']);
      });
    });

    describe('summary', () => {
      it('returns a complete object from storage - closed activity', async () => {
        await mountWrapper();
        const expected = {
          caseFileStatus: 2,
          closedArchivedActivity: {
            date: 'May 4, 2021',
            isClosed: true,
            name: 'Jane Doe',
            reason: 'End of CRC support',
          },
          triage: 'Level 1',
          caseFileNumber: '000000111-000001',
          validationOfImpact: 'Impacted',
          tags: [{
            id: 'mock-tag-id-1',
            name: {
              translation: {
                en: 'Do not communicate',
                fr: 'Ne pas contacter',
              },
            },
          }],
          assignedToUsersAndTeams: 'Standard Active Team 1, AdHoc Inactive Team 1, John Smith, Jane Doe',
          financialTotal: 876.43,
          hasReferrals: true,
        };
        expect(wrapper.vm.summary).toEqual(expected);
      });

      it('returns a complete object from storage - archived activity', async () => {
        await mountWrapper();
        await wrapper.setData({
          closeActivity: wrapper.vm.activities.filter((a) => a.activityType !== CaseFileActivityType.CaseFileStatusClosed)[0],
        });
        const expected = {
          caseFileStatus: 2,
          closedArchivedActivity: {
            date: 'May 4, 2021',
            isClosed: false,
            name: 'Jane Doe',
            reason: null,
          },
          triage: 'Level 1',
          caseFileNumber: '000000111-000001',
          validationOfImpact: 'Impacted',
          tags: [{
            id: 'mock-tag-id-1',
            name: {
              translation: {
                en: 'Do not communicate',
                fr: 'Ne pas contacter',
              },
            },
          }],
          assignedToUsersAndTeams: 'Standard Active Team 1, AdHoc Inactive Team 1, John Smith, Jane Doe',
          financialTotal: 876.43,
          hasReferrals: true,
        };
        expect(wrapper.vm.summary).toEqual(expected);
      });
    });
  });
});
