import _sortBy from 'lodash/sortBy';
import routes from '@/constants/routes';
import { mockItems, mockFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { useMockProgramStore } from '@/pinia/program/program.mock';
import { mockProgramEntity, mockProgramEntities } from '@libs/entities-lib/program';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';

import { Status } from '@libs/shared-lib/types';
import Component from '../CreateEditFinancialAssistance.vue';

const localVue = createLocalVue();
const { pinia } = useMockProgramStore();
const { financialAssistancePaymentStore } = useMockFinancialAssistancePaymentStore(pinia);
const { financialAssistanceStore } = useMockFinancialAssistanceStore(pinia);
const { programStore } = useMockProgramStore(pinia);

financialAssistanceStore.program = mockProgramEntity();
financialAssistanceStore.status = Status.Inactive;
financialAssistanceStore.name = { translation: { en: 'en name' } };
financialAssistanceStore.$reset = jest.fn();

describe('CreateEditFinancialAssistanceCaseFile.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      pinia,
      stubs: {
        FinancialAssistanceItems: true,
      },

    });
  });

  describe('Template', () => {
    test('the page title is correct', async () => {
      expect(wrapper.vm.title).toBe('financial.create_table');
    });

    test('the template select is not visible if the route is the create page', async () => {
      expect(wrapper.find('[data-test="financialCreate__copySelect"]').exists()).toBe(false);
    });

    test('the status toggle changes the status', async () => {
      jest.clearAllMocks();
      wrapper = mount(Component, {
        localVue,
        pinia,
        computed: {
          isEdit() {
            return true;
          },
          isTableMode() {
            return true;
          },
          isCopy() {
            return false;
          },
        },
        data() {
          return {
            loading: false,
            error: false,
          };
        },
        stubs: ['financial-assistance-items'],
      });

      const statusSwitch = wrapper.find('[data-test="financial-assistance-table-status-toggle"]');
      await statusSwitch.trigger('click');
      expect(financialAssistanceStore.status).toBe(Status.Active);
    });

    test('the status box has the correct css classes depending on status', async () => {
      jest.clearAllMocks();
      financialAssistanceStore.status = Status.Active;
      wrapper = mount(Component, {
        localVue,
        pinia,
        computed: {
          isEdit() {
            return true;
          },
          isTableMode() {
            return true;
          },
          isCopy() {
            return false;
          },
        },
        data() {
          return {
            loading: false,
            error: false,
          };
        },
        stubs: ['financial-assistance-items'],
      });

      const statusContainer = wrapper.find('.financial-status');
      expect(statusContainer.classes('grey')).toBe(false);
      expect(statusContainer.classes('lighten-3')).toBe(false);
    });

    test('the cancel button redirects to the view list of templates page', async () => {
      const cancelButton = wrapper.find('[data-test="financial-assistance-cancelBtn"]');

      await cancelButton.trigger('click');

      expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.events.financialAssistance.home.name });
    });

    describe('the cancel edit button and save edit button only visible in edit mode', () => {
      it('is not visible if is not edit', () => {
        expect(wrapper.findDataTest('financial-assistance-cancel-edit-btn').exists()).toBe(false);
        expect(wrapper.findDataTest('financial-assistance-save-edit-btn').exists()).toBe(false);
      });

      it('is visible if is edit', async () => {
        jest.clearAllMocks();

        wrapper = mount(Component, {
          localVue,
          pinia,
          computed: {
            isEdit() {
              return true;
            },
            isTableMode() {
              return true;
            },
            isCopy() {
              return false;
            },
          },
          data() {
            return {
              loading: false,
              error: false,
            };
          },
          stubs: ['financial-assistance-items'],
        });

        expect(wrapper.findDataTest('financial-assistance-cancel-edit-btn').exists()).toBe(true);
        expect(wrapper.findDataTest('financial-assistance-save-edit-btn').exists()).toBe(true);
      });
    });
  });

  describe('Computed', () => {
    describe('rules', () => {
      it('returns the right object', () => {
        expect(wrapper.vm.rules).toEqual({
          name: {
            required: true,
            max: MAX_LENGTH_MD,
          },
          required: {
            required: true,
          },
        });
      });
    });

    describe('title', () => {
      it('returns the right value', async () => {
        await wrapper.setProps({ isTableMode: true });
        await wrapper.setProps({ isEdit: false });
        await wrapper.setProps({ isCopy: false });

        expect(wrapper.vm.title).toEqual('financial.create_table');
      });
    });

    describe('supportedLanguages', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.supportedLanguages).toEqual(SUPPORTED_LANGUAGES_INFO);
      });
    });

    describe('programsSorted', () => {
      it('returns the right value', async () => {
        const programs = mockProgramEntities();
        await wrapper.setData({ programs });

        expect(wrapper.vm.programsSorted).toEqual(_sortBy(programs, (program) => program.name.translation.en));
      });
    });

    describe('isEdit', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.isEdit).toEqual(false);

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          mocks: {
            $route: {
              name: routes.events.financialAssistance.edit.name,
            },
          },
          stubs: ['financial-assistance-items'],
        });

        expect(wrapper.vm.isEdit).toEqual(true);
      });
    });

    describe('name', () => {
      it('returns the right value', async () => {
        const programName = mockProgramEntity().name.translation.en;

        financialAssistanceStore.getName = jest.fn(() => programName);

        expect(wrapper.vm.name).toEqual(programName);
      });
    });

    describe('status', () => {
      it('returns the right value', async () => {
        financialAssistanceStore.status = Status.Active;
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          stubs: ['financial-assistance-items'],
        });
        expect(wrapper.vm.status).toEqual(true);
      });
    });

    describe('program', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.program).toEqual(mockProgramEntity());
      });
    });

    describe('itemsDirty', () => {
      it('returns the right value', async () => {
        financialAssistanceStore.dirty = true;

        expect(wrapper.vm.itemsDirty).toEqual(true);
      });
    });

    describe('programInactive', () => {
      it('returns the right value', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            program() {
              return {
                status: Status.Active,
              };
            },
          },
          stubs: ['financial-assistance-items'],
        });

        expect(wrapper.vm.programInactive).toEqual(false);

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          computed: {
            program() {
              return {
                status: Status.Inactive,
              };
            },
          },
          stubs: ['financial-assistance-items'],
        });

        expect(wrapper.vm.programInactive).toEqual(true);
      });
    });

    describe('isValidItemsSubItems', () => {
      it('returns the right value', async () => {
        wrapper.vm.attemptedSave = false;

        expect(wrapper.vm.isValidItemsSubItems).toEqual(true);
      });
    });

    describe('isOperating', () => {
      it('returns the right value', async () => {
        financialAssistanceStore.isOperating = jest.fn(() => true);

        expect(wrapper.vm.isOperating).toEqual(true);
      });
    });
  });

  describe('Life cycle', () => {
    it('calls loadActivePrograms in create mode', async () => {
      wrapper.vm.loadActivePrograms = jest.fn();

      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      expect(wrapper.vm.loadActivePrograms).toHaveBeenCalled();
    });

    it('calls fetchAllIncludingInactive in create mode', async () => {
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      expect(financialAssistancePaymentStore.fetchFinancialAssistanceCategories).toHaveBeenCalled();
    });

    it('calls fetchAllIncludingInactive in edit mode', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        computed: {
          isEdit() {
            return true;
          },
        },
        stubs: ['financial-assistance-items'],
      });

      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      expect(financialAssistancePaymentStore.fetchFinancialAssistanceCategories).toHaveBeenCalled();
    });

    it('fetches financial assistance in edit mode', async () => {
      wrapper = shallowMount(Component, {
        pinia,
        localVue,
        computed: {
          isEdit() {
            return true;
          },
        },
        mocks: {
          $route: {
            params: {
              faId: 'faId',
            },
          },
        },
      });

      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      await wrapper.vm.$nextTick();
      expect(financialAssistancePaymentStore.fetchFinancialAssistanceCategories).toHaveBeenCalled();
      expect(programStore.fetch).toHaveBeenCalled();
      expect(financialAssistanceStore.fetch).toHaveBeenCalledWith('faId');
      expect(financialAssistanceStore.setFinancialAssistance).toHaveBeenCalledWith({
        fa: mockFinancialAssistanceTableEntity(), categories: mockOptionItemData(), newProgram: mockProgramEntity({ id: '1' }), removeInactiveItems: true,
      });

      expect(financialAssistanceStore.fetch).toHaveBeenCalled();
    });
  });

  describe('Methods', () => {
    describe('save', () => {
      it('show error message if validate items and subitems fails', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.validateItemsAndSubItems = jest.fn(() => false);

        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});

        await wrapper.vm.save();
        const element = wrapper.findDataTest('financialAssistance-error-requiredItem');
        expect(element.exists()).toBe(true);
      });
    });

    describe('saveEdit', () => {
      beforeEach(() => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        wrapper.vm.$route = {
          params: {
            id: 'event id',
          },
        };
      });

      it('calls editFinancialAssistance', async () => {
        await wrapper.vm.saveEdit();

        expect(financialAssistanceStore.editFinancialAssistance).toHaveBeenCalledTimes(1);
      });

      it('toasts success if validate table succeeds', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});

        await wrapper.vm.saveEdit();

        expect(wrapper.vm.$toasted.global.success).toHaveBeenLastCalledWith('financialAssistance.toast.table.editTable');
      });
    });

    describe('submit', () => {
      it('calls createFinancialAssistance', async () => {
        wrapper.vm.createFinancialAssistance = jest.fn(() => true);

        expect(wrapper.vm.createFinancialAssistance).toHaveBeenCalledTimes(0);

        await wrapper.vm.createFinancialAssistance();

        expect(wrapper.vm.createFinancialAssistance).toHaveBeenCalledTimes(1);
      });

      it('toasts success message', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});
        wrapper.vm.createFinancialAssistance = jest.fn(() => true);

        await wrapper.vm.createFinancialAssistance();

        expect(wrapper.vm.createFinancialAssistance).toHaveBeenCalledTimes(1);
      });
    });

    describe('validateItemsAndSubItems', () => {
      it('return false if no items', async () => {
        financialAssistanceStore.mainItems = [];

        expect(wrapper.vm.validateItemsAndSubItems()).toBe(false);
      });

      it('return false if item has no subItems', async () => {
        const items = mockItems();
        financialAssistanceStore.mainItems = items;

        expect(wrapper.vm.validateItemsAndSubItems()).toBe(true);

        items[0].subItems = [];

        expect(wrapper.vm.validateItemsAndSubItems()).toBe(false);
      });
    });

    describe('setLanguageMode', () => {
      it('sets name for other language', async () => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          stubs: ['financial-assistance-items'],
        });

        financialAssistanceStore.getName = jest.fn((language) => (language === 'fr' ? null : 'name en'));

        wrapper.vm.setLanguageMode('fr');

        expect(financialAssistanceStore.setName).toHaveBeenLastCalledWith({ newName: 'name en', language: 'fr' });
      });
    });
  });
});
