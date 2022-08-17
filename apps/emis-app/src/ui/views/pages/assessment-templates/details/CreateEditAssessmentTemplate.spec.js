import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/storage';
import Component from './CreateEditAssessmentTemplate.vue';

const localVue = createLocalVue();
let storage = mockStorage();

describe('CreateEditAssessmentTemplate', () => {
  let wrapper;

  // eslint-disable-next-line max-params
  const mountWrapper = async (assessmentTemplateId = null, eventId = 'EVENTID', fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        id: eventId,
        assessmentTemplateId,
      },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    storage = mockStorage();
    jest.clearAllMocks();
  });

  describe('Methods', () => {
    describe('back', () => {
      it('returns to the assessment home page when no event id', async () => {
        await mountWrapper(null, null);
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.assessmentTemplates.home.name,
        });
      });

      it('returns to the event assessment home page when event id', async () => {
        await mountWrapper();
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.events.assessments.home.name,
        });
      });
    });

    describe('submit', () => {
      it('does not call create unless form validation succeeds', async () => {
        await mountWrapper();
        wrapper.vm.$refs.form.validate = jest.fn(() => false);

        await wrapper.vm.submit();
        expect(storage.assessmentForm.actions.create).toHaveBeenCalledTimes(0);
      });

      it('calls assessmentForm.create if isEditMode is false with event', async () => {
        await mountWrapper();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(storage.assessmentForm.actions.create).toHaveBeenCalledTimes(1);
      });

      it('calls assessmentForm.update if isEditMode is true with event', async () => {
        await mountWrapper('id');

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(storage.assessmentForm.actions.update).toHaveBeenCalledTimes(1);
      });

      it('calls assessmentTemplate.create if isEditMode is false without event', async () => {
        await mountWrapper(null, null);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(storage.assessmentTemplate.actions.create).toHaveBeenCalledTimes(1);
      });

      it('calls assessmentTemplate.update if isEditMode is true without event', async () => {
        await mountWrapper('id', null);

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(storage.assessmentTemplate.actions.update).toHaveBeenCalledTimes(1);
      });

      test('after submitting, the user is redirected to the detail page', async () => {
        await mountWrapper();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$storage.assessmentForm.actions.create = jest.fn(() => ({ id: 'abc' }));
        await wrapper.vm.submit();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.events.assessments.details.name,
          params: { assessmentTemplateId: 'abc' },
        });
      });

      test('after creating a toast notification is shown', async () => {
        await mountWrapper();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('assessmentTemplate.create.success');
      });

      test('after updating a toast notification is shown', async () => {
        await mountWrapper('id');

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('assessmentTemplate.edit.success');
      });
    });
  });

  describe('Computed', () => {
    describe('isEditMode', () => {
      it('returns true if has assessmentTemplateId', async () => {
        await mountWrapper('id');

        expect(wrapper.vm.isEditMode).toBe(true);
      });

      it('returns false if no assessmentTemplateId', async () => {
        await mountWrapper(null);

        expect(wrapper.vm.isEditMode).toBe(false);
      });
    });

    describe('isFormMode', () => {
      it('returns true if has eventid', async () => {
        await mountWrapper(null, 'id');

        expect(wrapper.vm.isFormMode).toBe(true);
      });

      it('returns false if no eventid', async () => {
        await mountWrapper(null, null);

        expect(wrapper.vm.isFormMode).toBe(false);
      });
    });

    describe('submitLabel', () => {
      it('returns common.save if in edit mode', async () => {
        await mountWrapper('id');

        expect(wrapper.vm.submitLabel).toBe('common.save');
      });

      it('returns common.buttons.create if not in edit mode', async () => {
        await mountWrapper(null);

        expect(wrapper.vm.submitLabel).toBe('common.buttons.create');
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            id: 'EVENTID',
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

  describe('beforeRouteLeave', () => {
    let next;
    beforeEach(async () => {
      await mountWrapper();
      next = jest.fn(() => {});
    });

    it('calls next if the confirmation dialog returns true', async () => {
      wrapper.vm.$refs.form.flags = { dirty: true };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });

    it('does not call next if the confirmation dialog returns false', async () => {
      wrapper.vm.$refs.form.flags = { dirty: true };
      wrapper.vm.$confirm = jest.fn(() => false);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).not.toBeCalled();
    });

    it('calls next if dirty is false', async () => {
      wrapper.vm.$refs.form.flags = { dirty: false };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });
  });
});
