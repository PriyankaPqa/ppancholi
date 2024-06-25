import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table';
import { mockRoles } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/shared-lib/types';
import approvalRoles from './approvalRoles';

const approvalTable = mockApprovalTableEntity();
approvalTable.groups[0].setRoles(['85315955-e20e-40bd-a672-f60b2871a0ab', 'a6ffce22-8396-43c9-bdc3-6532925af251']);
approvalTable.groups[1].setRoles(['85315955-e20e-40bd-a672-f60b2871a0ab', 'a6ffce22-8396-43c9-bdc3-6532925af251']);

const roles = mockRoles();
roles[0].subitems[0].status = Status.Inactive; // Disabled Operations Manager roles

let wrapper;
const localVue = createLocalVue();
const Component = {
  render() {},
  mixins: [approvalRoles],
};

const doMount = () => {
  const options = {
    localVue,
    data: () => ({
      localApproval: approvalTable,
      roles,
    }),
  };
  wrapper = shallowMount(Component, options);
};

describe('approvalRoles', () => {
  describe('Computed', () => {
    describe('usedRolesIds', () => {
      it('should return a unique list of roles ids being used in the approval', () => {
        doMount();
        const expected = new Set(['a6ffce22-8396-43c9-bdc3-6532925af251', '85315955-e20e-40bd-a672-f60b2871a0ab']);
        expect(wrapper.vm.usedRolesIds).toMatchObject(expected);
      });
    });

    describe('availableRoles', () => {
      it('should return a list of active L3 and L4 roles or the ones used in the approval', () => {
        doMount();
        const expected = [
          {
            name: { translation: { en: 'Operations Manager', fr: 'Gestionnaire des opérations' } },
            id: 'a6ffce22-8396-43c9-bdc3-6532925af251',
          },
          {
            name: {
              translation: {
                en: 'Rapid Deployment Case Management Team Member',
                fr: 'Conseiller(ère) en gestion de cas – Équipe de déploiement rapide',
              },
            },
            id: '85315955-e20e-40bd-a672-f60b2871a0ab',
          },
          {
            name: { translation: { en: 'Recovery Manager', fr: 'Gestionnaire, Rétablissement  ' } },
            id: '1bdf0ed1-284d-47e3-9366-a515d6af910d',
          },
        ];
        expect(wrapper.vm.availableRoles).toEqual(expected);
      });
    });
  });
  describe('Methods', () => {
    describe('buildRoleString', () => {
      it('should create a string of selected roles', () => {
        doMount();
        const expected = wrapper.vm.buildRoleString(wrapper.vm.localApproval.groups[0]);
        expect(expected).toEqual('Rapid Deployment Case Management Team Member, Operations Manager');
      });
    });
  });
});
