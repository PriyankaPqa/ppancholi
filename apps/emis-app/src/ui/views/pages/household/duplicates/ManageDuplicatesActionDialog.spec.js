import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockHouseholdDuplicate, DuplicateStatus } from '@libs/entities-lib/household';
import Component from './ManageDuplicatesActionDialog.vue';

const localVue = createLocalVue();

describe('ManageDuplicatesActionDialog.vue', () => {
  let wrapper;

  const doMount = async (customOptions = null) => {
    const options = {
      localVue,
      propsData: {
        initialStatus: DuplicateStatus.Potential,
        show: true,
      },
      ...customOptions,
    };

    wrapper = shallowMount(Component, options);
    wrapper.vm.fetchDuplicates = jest.fn(() => [mockHouseholdDuplicate()]);
  };

  describe('Computed', () => {
    describe('newStatus', () => {
      it('returns the right value when initial status is potential', () => {
        doMount();
        expect(wrapper.vm.newStatus).toEqual(DuplicateStatus.Resolved);
      });

      it('returns the right value when initial status is resolved', () => {
        doMount({ propsData: {
          initialStatus: DuplicateStatus.Resolved,
          show: true,
        } });
        expect(wrapper.vm.newStatus).toEqual(DuplicateStatus.Potential);
      });
    });

    describe('title', () => {
      it('returns the right value when new status is potential', () => {
        doMount({
          computed: { newStatus() {
            return DuplicateStatus.Potential;
          } },
        });

        expect(wrapper.vm.title).toEqual('householdDetails.manageDuplicates.title.flagHouseholdPotential');
      });

      it('returns the right value when new status is resolved', () => {
        doMount({
          computed: { newStatus() {
            return DuplicateStatus.Resolved;
          } },
        });

        expect(wrapper.vm.title).toEqual('householdDetails.manageDuplicates.title.flagHouseholdResolved');
      });
    });
  });

  describe('Methods', () => {
    describe('onSubmit', () => {
      it('validates the form and emits submitAction', async () => {
        doMount({ computed: { newStatus() {
          return DuplicateStatus.Resolved;
        } } });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.setData({ rationale: 'rationale' });
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('submitAction')[0][0]).toEqual({ rationale: 'rationale', status: DuplicateStatus.Resolved,
        });
      });

      it('does not emit action when form is not valid', async () => {
        doMount();
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        wrapper.vm.$emit = jest.fn();
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$emit).not.toHaveBeenCalled();
      });
    });
  });
});
