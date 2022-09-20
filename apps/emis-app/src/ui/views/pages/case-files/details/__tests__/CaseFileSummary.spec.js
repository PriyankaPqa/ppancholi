import flushPromises from 'flush-promises';
import _orderBy from 'lodash/orderBy';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { CaseFileActivityType } from '@libs/entities-lib/case-file';
import helpers from '@/ui/helpers/helpers';
import Component from '../CaseFileSummary.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('CaseFileSummary.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        caseFileId: 'abcd',
      },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });

    await flushPromises();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    storage.caseFileReferral.getters.getByCaseFile = jest.fn(() => [{ entity: {} }]);
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls all the required fetch from services', async () => {
        await mountWrapper();
        const services = wrapper.vm.$services;
        expect(services.caseFiles.getSummary).toHaveBeenCalledWith('abcd');
        expect(services.caseFilesMetadata.getSummary).toHaveBeenCalledWith('abcd');
        expect(storage.team.actions.getTeamsAssigned).toHaveBeenCalledWith('abcd');
        expect(storage.userAccount.actions.search).toHaveBeenCalledWith({
          filter: "search.in(Entity/Id, 'mock-assigned-individual-id-1|mock-assigned-individual-id-2', '|')",
        });
        expect(storage.caseFileReferral.actions.fetchAll).toHaveBeenCalledWith({ caseFileId: 'abcd' });
        expect(storage.caseFileReferral.getters.getByCaseFile).toHaveBeenCalledWith('abcd');
        expect(wrapper.vm.hasReferrals).toEqual(true);
        expect(storage.caseFile.actions.fetchCaseFileActivities).toHaveBeenCalledWith('abcd');
        expect(wrapper.vm.activities).toEqual(_orderBy(storage.caseFile.actions.fetchCaseFileActivities('abcd'), 'created', 'desc'));
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
        expect(wrapper.vm.$services.households.getHouseholdMetadataHistory).toHaveBeenCalledWith(storage.caseFile.actions.fetch().entity.householdId);
        expect(wrapper.vm.householdMembers).toEqual([
          { birthDate: helpers.getLocalStringDate('1991-01-01T00:00:00Z', 'HouseholdMemberMetadata.dateOfBirth', 'll'), name: 'firstName2 lName2' },
        ]);
        expect(wrapper.vm.primary).toEqual(
          { birthDate: helpers.getLocalStringDate('1990-01-01T00:00:00Z', 'HouseholdMemberMetadata.dateOfBirth', 'll'), name: 'firstName lastName' },
        );
      });
    });
  });

  describe('Computed', () => {
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
          assignedToUsersAndTeams: 'Standard Active Team 1, AdHoc Inactive Team 1, Jane Smith, Jane Smith',
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
          assignedToUsersAndTeams: 'Standard Active Team 1, AdHoc Inactive Team 1, Jane Smith, Jane Smith',
          financialTotal: 876.43,
          hasReferrals: true,
        };
        expect(wrapper.vm.summary).toEqual(expected);
      });
    });
  });
});
