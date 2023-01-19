import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/storage';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { useMockAssessmentTemplateStore } from '@/pinia/assessment-template/assessment-template.mock';
import { createTestingPinia } from '@pinia/testing';
import Component from './CreateEditAssessmentTemplate.vue';

const localVue = createLocalVue();
let storage = mockStorage();
let pinia = createTestingPinia({ stubActions: false });
let assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
let assessmentTemplateStore = useMockAssessmentTemplateStore(pinia).assessmentTemplateStore;

describe('CreateEditAssessmentTemplate.vue', () => {
  let wrapper;

  // eslint-disable-next-line max-params
  const mountWrapper = async (assessmentTemplateId = null, eventId = 'EVENTID', fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        id: eventId,
      },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
        $route: {
          params: {
            assessmentTemplateId,
          },
        },
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    storage = mockStorage();
    pinia = createTestingPinia({ stubActions: false });
    assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
    assessmentTemplateStore = useMockAssessmentTemplateStore(pinia).assessmentTemplateStore;
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
        expect(assessmentFormStore.create).toHaveBeenCalledTimes(0);
      });

      it('shows prompt message if showEligibilityCriteriaWarning is true', async () => {
        await mountWrapper();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.showEligibilityCriteriaWarning = true;

        await wrapper.vm.submit();
        expect(wrapper.vm.$confirm).toHaveBeenCalled();
      });

      it('calls assessmentForm.create if isEditMode is false with event', async () => {
        await mountWrapper();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(assessmentFormStore.create).toHaveBeenCalledTimes(1);
      });

      it('calls assessmentForm.update if isEditMode is true with event', async () => {
        await mountWrapper('id');

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(assessmentFormStore.update).toHaveBeenCalledTimes(1);
        expect(assessmentFormStore.updateAssessmentStructure).not.toHaveBeenCalled();
      });

      it('calls assessmentTemplate.create if isEditMode is false without event', async () => {
        await mountWrapper(null, null);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(assessmentTemplateStore.create).toHaveBeenCalledTimes(1);
      });

      it('calls assessmentTemplate.update if isEditMode is true without event', async () => {
        await mountWrapper('id', null);

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(assessmentTemplateStore.update).toHaveBeenCalledTimes(1);
        expect(assessmentTemplateStore.updateAssessmentStructure).not.toHaveBeenCalled();
      });

      it('calls assessmentForm.updateAssessmentStructure if cloning with event', async () => {
        await mountWrapper('id');
        await wrapper.setProps({ cloneId: 'clonedId' });

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(assessmentFormStore.updateAssessmentStructure).toHaveBeenCalledTimes(1);
      });

      it('calls assessmentTemplate.updateAssessmentStructure if cloning without event', async () => {
        await mountWrapper(null, null);
        await wrapper.setProps({ cloneId: 'clonedId' });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(assessmentTemplateStore.updateAssessmentStructure).toHaveBeenCalledTimes(1);
      });

      test('submit calls the fillEmptyMultilingualAttributes method', async () => {
        await mountWrapper();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.assessmentForm.fillEmptyMultilingualAttributes = jest.fn();
        await wrapper.vm.submit();
        expect(wrapper.vm.assessmentForm.fillEmptyMultilingualAttributes).toHaveBeenCalled();
      });

      test('after submitting, the user is redirected to the detail page', async () => {
        await mountWrapper();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        assessmentFormStore.create = jest.fn(() => ({ id: 'abc' }));
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

      it('returns false if cloneId', async () => {
        await mountWrapper('id');
        await wrapper.setProps({ cloneId: 'clonedId' });

        expect(wrapper.vm.isEditMode).toBe(false);
      });
    });

    describe('title', () => {
      it('returns for create', async () => {
        await mountWrapper(null, 'id');

        expect(wrapper.vm.title).toBe('assessmentTemplate.add.title');
      });

      it('returns for edit', async () => {
        await mountWrapper('assessmentId', null);

        expect(wrapper.vm.title).toBe('assessmentTemplate.edit.title');
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
          pinia,
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
