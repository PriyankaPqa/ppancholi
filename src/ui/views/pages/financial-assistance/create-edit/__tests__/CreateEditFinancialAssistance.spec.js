import routes from '@/constants/routes';
import { createLocalVue, mount } from '@/test/testSetup';
import { MAX_LENGTH_SM } from '@/constants/validations';
import { SUPPORTED_LANGUAGES_INFO } from '@/constants/trans';
import { EFinancialAssistanceStatus, mockItems } from '@/entities/financial-assistance';
import { EProgramStatus, mockProgramsSearchData, Program } from '@/entities/program';
import _sortBy from 'lodash/sortBy';

import Component from '../CreateEditFinancialAssistance.vue';

const localVue = createLocalVue();

describe('CreateEditFinancialAssistance.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      stubs: ['financial-assistance-items'],
    });
  });

  describe('Template', () => {
    test('the page title is correct', async () => {
      expect(wrapper.vm.title).toBe('financial.create_table');
    });

    test('the template select is not visible if the route is the create page', async () => {
      expect(wrapper.find('[data-test="financialCreate__copySelect"]').exists()).toBe(false);
    });

    test('clicking the language tab changes the language and copies the name to the fr field', async () => {
      const name = wrapper.find('[data-test="financial-assistance-name"]').find('input');
      const enTab = wrapper.find('[data-test="financialCreate__lang--en"]');
      const frTab = wrapper.find('[data-test="financialCreate__lang--fr"]');

      expect(wrapper.vm.languageMode).toBe('en');

      expect(wrapper.vm.name).toBe('');

      await frTab.trigger('click');

      expect(wrapper.vm.name).toBe('');

      await name.setValue('TEST');

      expect(wrapper.vm.name).toBe('TEST');

      await enTab.trigger('click');

      expect(wrapper.vm.name).toBe('TEST');

      expect(wrapper.vm.$store.state.financialAssistance.name).toEqual({ translation: { en: 'TEST', fr: 'TEST' } });
    });

    test('the status box has the correct css classes depending on status', async () => {
      const statusSwitch = wrapper.find('[data-test="financial-assistance-status"]');
      const statusContainer = wrapper.find('.financial-status');

      expect(wrapper.vm.status).toBe(false);
      expect(statusContainer.classes('status_success')).toBe(false);

      await statusSwitch.trigger('click');

      expect(wrapper.vm.status).toBe(true);
      expect(statusContainer.classes('grey')).toBe(false);
      expect(statusContainer.classes('lighten-3')).toBe(false);
    });

    test('the cancel button redirects to the view list of templates page', async () => {
      const cancelButton = wrapper.find('[data-test="financial-assistance-cancelBtn"]');

      await cancelButton.trigger('click');

      expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.events.financialAssistance.home.name });
    });
  });

  describe('Computed', () => {
    describe('rules', () => {
      it('returns the right object', () => {
        expect(wrapper.vm.rules).toEqual({
          name: {
            required: true,
            max: MAX_LENGTH_SM,
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
        const programs = mockProgramsSearchData().map((p) => new Program(p));
        await wrapper.setProps({ programs });

        expect(wrapper.vm.programsSorted).toEqual(_sortBy(programs, (program) => program.name.translation.en));
      });
    });

    describe('name', () => {
      it('returns the right value', async () => {
        const { programName } = mockProgramsSearchData()[0];
        wrapper.vm.$store.state.financialAssistance.name = programName;

        expect(wrapper.vm.name).toEqual(programName.translation.en);
      });
    });

    describe('status', () => {
      it('returns the right value', async () => {
        wrapper.vm.$store.state.financialAssistance.status = EFinancialAssistanceStatus.Active;

        expect(wrapper.vm.status).toEqual(true);
      });
    });

    describe('program', () => {
      it('returns the right value', async () => {
        const program = new Program(mockProgramsSearchData()[0]);
        wrapper.vm.$store.state.financialAssistance.program = program;

        expect(wrapper.vm.program).toEqual(program);
      });
    });

    describe('dirty', () => {
      it('returns the right value', async () => {
        wrapper.vm.$store.state.financialAssistance.dirty = true;

        expect(wrapper.vm.dirty).toEqual(true);
      });
    });

    describe('formDirty', () => {
      it('returns the right value', async () => {
        wrapper.vm.$store.state.financialAssistance.formDirty = true;

        expect(wrapper.vm.formDirty).toEqual(true);
      });
    });

    describe('programInactive', () => {
      it('returns the right value', async () => {
        wrapper.vm.program = {
          programStatus: EProgramStatus.Inactive,
        };

        expect(wrapper.vm.formDirty).toEqual(true);
      });
    });

    describe('isValidItemsSubItems', () => {
      it('returns the right value', async () => {
        wrapper.vm.attemptedSave = false;

        expect(wrapper.vm.isValidItemsSubItems).toEqual(true);
      });
    });
  });

  describe('Life cycle', () => {
    it('fetches programs list', async () => {
      wrapper.vm.$storage.program.actions.searchPrograms = jest.fn(() => ({ value: [] }));

      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });

      expect(wrapper.vm.$storage.program.actions.searchPrograms).toHaveBeenCalled();
    });
  });

  describe('Methods', () => {
    describe('save', () => {
      it('toasts error if validate items and subitems fails', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.validateItemsAndSubItems = jest.fn(() => false);

        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});

        await wrapper.vm.save();

        expect(wrapper.vm.$toasted.global.error).toHaveBeenLastCalledWith('financialAssistance.errors.needItemSubItem');
      });
    });

    describe('dispatchSaveAction', () => {
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
        wrapper.vm.$storage.financialAssistance.getters.items = jest.fn(() => []);

        expect(wrapper.vm.validateItemsAndSubItems()).toBe(false);
      });

      it('return false if item has no subItems', async () => {
        const items = mockItems();
        wrapper.vm.$storage.financialAssistance.getters.items = jest.fn(() => items);

        expect(wrapper.vm.validateItemsAndSubItems()).toBe(true);

        items[0].subRows = [];

        expect(wrapper.vm.validateItemsAndSubItems()).toBe(false);
      });
    });

    describe('setLanguageMode', () => {
      it('sets name for other language', async () => {
        wrapper.vm.$store.state.financialAssistance.name = {
          translation: {
            en: 'name',
            fr: null,
          },
        };

        wrapper.vm.setLanguageMode('fr');

        expect(wrapper.vm.$store.state.financialAssistance.name.translation.fr).toBe('name');
      });
    });
  });
});
