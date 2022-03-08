import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import Component from './CreateEditReferral.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('CreateEditReferral', () => {
  let wrapper;
  let actions;

  const doMount = (isEditMode) => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        id: 'CASEFILE_ID',
      },
      computed: {
        isEditMode() {
          return isEditMode;
        },
      },
      mocks: {
        $route: {
          name: routes.caseFile.referrals.add.name,
          params: {
            id: 'CASEFILE_ID',
          },
        },
        $storage: storage,
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    actions = storage.caseFileReferral.actions;
    doMount(false);
  });

  describe('Methods', () => {
    describe('back', () => {
      it('returns to the referrals home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.caseFile.referrals.home.name,
        });
      });
    });

    describe('submit', () => {
      it('does not call createReferral unless form validation succeeds', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.submit();
        expect(actions.createReferral).toHaveBeenCalledTimes(0);
      });

      it('calls createReferral if isEditMode is false', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(actions.createReferral).toHaveBeenCalledTimes(1);
      });

      it('calls updateReferral if isEditMode is true', async () => {
        doMount(true);

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(actions.updateReferral).toHaveBeenCalledTimes(1);
      });

      test('after submitting, the user is redirected to the referral detail page', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$storage.caseFileReferral.actions.createReferral = jest.fn(() => ({ id: 'abc' }));
        await wrapper.vm.submit();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.caseFile.referrals.details.name,
          params: { referralId: 'abc' },
        });
      });

      test('after creating an event a toast notification is shown', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('referral.create.success');
      });

      test('after updating an event a toast notification is shown', async () => {
        doMount(true);

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('referral.edit.success');
      });
    });
  });

  describe('Computed', () => {
    describe('isEditMode', () => {
      it('returns true if the route is edit', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'CASEFILE_ID',
            referralId: 'REF_ID',
          },
          mocks: {
            $route: {
              name: routes.caseFile.referrals.edit.name,
              params: {
                id: 'CASEFILE_ID',
                referralId: 'REF_ID',
              },
            },
            $storage: storage,
          },
        });

        expect(wrapper.vm.isEditMode).toBe(true);
      });

      it('returns false if the route is create', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'CASEFILE_ID',
            referralId: 'REF_ID',
          },
          mocks: {
            $route: {
              name: routes.caseFile.referrals.add.name,
              params: {
                id: 'CASEFILE_ID',
                referralId: 'REF_ID',
              },
            },
            $storage: storage,
          },
        });

        expect(wrapper.vm.isEditMode).toBe(false);
      });
    });

    describe('submitLabel', () => {
      it('returns common.save if in edit mode', () => {
        doMount(true);

        expect(wrapper.vm.submitLabel).toBe('common.save');
      });

      it('returns common.buttons.add if not in edit mode', () => {
        doMount(false);

        expect(wrapper.vm.submitLabel).toBe('common.buttons.add');
      });
    });

    describe('helpLink', () => {
      it('returns the correct url in edit mode', () => {
        doMount(true);

        expect(wrapper.vm.helpLink).toBe('zendesk.help_link.edit_referral');
      });

      it('returns the correct url in create mode', () => {
        doMount(false);

        expect(wrapper.vm.helpLink).toBe('zendesk.help_link.create_referral');
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            id: 'CASEFILE_ID',
          },
          mocks: {
            $storage: storage,
          },
        });
      });

      test('the save button calls the submit method', async () => {
        // eslint-disable-next-line no-underscore-dangle
        wrapper.vm.$refs.form._data.flags.dirty = true;
        await wrapper.vm.$nextTick();

        const spy = jest.spyOn(wrapper.vm, 'submit').mockImplementation(() => { });
        const button = wrapper.findDataTest('save');
        await button.trigger('click');
        expect(wrapper.vm.submit).toHaveBeenCalledTimes(1);
        spy.mockRestore();
      });

      test('the cancel button calls the back method', async () => {
        const spy = jest.spyOn(wrapper.vm, 'back').mockImplementation(() => { });
        const button = wrapper.findDataTest('cancel');
        await button.trigger('click');
        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
        spy.mockRestore();
      });
    });
  });
});
