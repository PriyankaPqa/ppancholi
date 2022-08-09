import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockCombinedUserAccounts } from '@libs/entities-lib/user-account';
import { mockCombinedTeams } from '@libs/entities-lib/team';
import { mockStorage } from '@/storage';

import Component from '../case-file-activity/components/ViewAssignedOld.vue';

const localVue = createLocalVue();
const storage = mockStorage();

const mockTeam = () => mockCombinedTeams()[0];

describe('ViewAssignedOld.vue', () => {
  let wrapper;
  storage.userAccount.actions.search = jest.fn(() => ({ ids: [mockCombinedUserAccounts()[0].entity.id] }));
  storage.userAccount.getters.getByIds = jest.fn(() => ([mockCombinedUserAccounts()[0]]));

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          caseFileId: 'mock-id',
          show: true,
          assignedTeams: [mockTeam()],
          assignedIndividualIds: [mockCombinedUserAccounts()[0].id],
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('dialog', () => {
      it('displays the view assigned dialog', () => {
        const element = wrapper.findDataTest('view-assigned-dialog');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Life Cycle', () => {
    describe('created', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFileId: 'mock-id',
            show: true,
            assignedTeams: [mockTeam()],
            assignedIndividualIds: [mockCombinedUserAccounts()[0].id],
          },
          mocks: {
            $storage: storage,
          },
        });
      });

      it('calls setAssignedIndividuals', async () => {
        jest.spyOn(wrapper.vm, 'setAssignedIndividuals').mockImplementation(() => {});
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.setAssignedIndividuals).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          caseFileId: 'mock-case-file-id',
          show: true,
          assignedTeams: [mockTeam()],
          assignedIndividualIds: ['mock-individual-id-1', 'mock-individual-id-2'],
        },
        mocks: {
          $storage: storage,
        },
      });
    });
    describe('close', () => {
      it('emits update:show false', async () => {
        await wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('setAssignedIndividuals', () => {
      it('calls storage action search with the right filter', async () => {
        await wrapper.vm.setAssignedIndividuals();

        expect(wrapper.vm.$storage.userAccount.actions.search)
          .toHaveBeenCalledWith({ filter: "search.in(Entity/Id, 'mock-individual-id-1|mock-individual-id-2', '|')" });
      });

      it('calls storage getter getByIds with the right data', async () => {
        await wrapper.vm.setAssignedIndividuals();

        expect(wrapper.vm.$storage.userAccount.getters.getByIds)
          .toHaveBeenCalledWith([mockCombinedUserAccounts()[0].entity.id]);
      });

      it('returns the right values', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            caseFileId: 'mock-case-file-id',
            show: true,
            assignedTeams: [mockTeam()],
            assignedIndividualIds: ['mock-individual-id-1', 'mock-individual-id-2'],
          },
          mocks: {
            $storage: storage,
          },
        });

        await wrapper.vm.setAssignedIndividuals();
        const expectedAllIndividuals = [
          {
            ...mockCombinedUserAccounts()[0],
            isPrimaryContact: false,
          },
        ];
        expect(wrapper.vm.assignedIndividuals).toEqual(expectedAllIndividuals);
      });
    });
  });
});
