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
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';

import { mockProvider } from '@/services/provider';
import { mockMember } from '@libs/entities-lib/household-create';
import Component from '../CaseFileSummary.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia, userAccountMetadataStore } = useMockUserAccountStore();
const { caseFileReferralStore } = useMockCaseFileReferralStore(pinia);
const { teamStore } = useMockTeamStore(pinia);
const { caseFileStore } = useMockCaseFileStore(pinia);
const { personStore } = useMockPersonStore(pinia);
const { householdStore } = useMockHouseholdStore(pinia);

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
        expect(teamStore.getTeamsAssigned).toHaveBeenCalledWith('abcd');
        expect(wrapper.vm.combinedUserAccountStore.search).toHaveBeenCalledWith({
          filter: {
            Entity: {
              Id: { in: [
                'mock-assigned-individual-id-1',
                'mock-assigned-individual-id-2',
                'mock-assigned-individual-id-3',
              ] },
            },
          },
          queryType: 'full',
          searchMode: 'all',
        }, null, false, true);
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
      it('gets the old members if the case file has been closed', async () => {
        await mountWrapper();
        jest.clearAllMocks();
        wrapper.vm.closeActivity.created = '2020-02-01T00:05:00Z';

        const household = { ...householdStore.getById(),
          primaryBeneficiariesHistory: [
            { memberId: '01', from: '2020-01-01T00:00:00Z', to: '2020-01-10T00:00:00Z' },
            { memberId: '02', from: '2020-01-11T00:00:00Z', to: '2020-02-01T00:00:00Z' },
            { memberId: '01', from: '2020-02-02T00:00:00Z', to: '2020-02-28T00:00:00Z' },
            { memberId: '03', from: '2020-03-01T00:00:00Z', to: null },
          ] };

        householdStore.getById = jest.fn(() => household);

        // mock-member-id-1 is impacted in the case file, so it will fetch him and 02 as primary from history

        personStore.fetchByIds = jest.fn(() => [mockMember({ id: 'mock-member-id-1', identitySet: { firstName: '01 name' } }),
          mockMember({ id: '02', identitySet: { firstName: '02 name' } })]);

        await wrapper.vm.getHouseholdMembers();

        expect(personStore.fetchByIds).toHaveBeenCalledWith(['mock-member-id-1', '02'], true);

        expect(wrapper.vm.householdMembers).toEqual([
          { birthDate: helpers.getLocalStringDate('1999-02-12T00:00:00Z', 'HouseholdMemberMetadata.dateOfBirth', 'PP'), name: '01 name Smith' },
        ]);
        expect(wrapper.vm.primary).toEqual(
          { birthDate: helpers.getLocalStringDate('1999-02-12T00:00:00Z', 'HouseholdMemberMetadata.dateOfBirth', 'PP'), name: '02 name Smith' },
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
          searchInFilter: { Entity: { Id: { in: '{ids}' } } },
          otherOptions: {
            queryType: 'full',
            searchMode: 'all',
          },
          otherApiParameters: [null, false, true],
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
          triage: 'enums.Triage.Tier1',
          caseFileNumber: '000000111-000001',
          validationOfImpact: 'enums.ValidationOfImpactStatus.Impacted',
          tags: [{
            id: 'mock-tag-restrict-financial-id-1',
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
          triage: 'enums.Triage.Tier1',
          caseFileNumber: '000000111-000001',
          validationOfImpact: 'enums.ValidationOfImpactStatus.Impacted',
          tags: [{
            id: 'mock-tag-restrict-financial-id-1',
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
