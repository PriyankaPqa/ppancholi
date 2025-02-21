import Vuetify from 'vuetify';
import { createLocalVue, mount } from '@/test/testSetup';
import { useMockDashboardStore } from '@/pinia/dashboard/dashboard.mock';
import Component from '../GeneralHelpMenu.vue';

const localVue = createLocalVue();
const vuetify = new Vuetify();
const { pinia, dashboardStore } = useMockDashboardStore();
describe('GeneralHelpMenu.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(Component, {
      localVue,
      pinia,
      vuetify,
      propsData: {
        menuLinks: [],
      },
    });
  });

  test('Click close-button will trigger updateShow', async () => {
    jest.spyOn(wrapper.vm, 'updateShow');
    const button = wrapper.find('[data-test="close-button"]');
    await button.trigger('click');
    expect(wrapper.vm.updateShow).toHaveBeenCalledWith(false);
  });

  test('Help Center button has a link to the Zendesk Help Center page', async () => {
    const helpCenterButton = wrapper.find('[data-test="help-center-button"]');
    expect(helpCenterButton.exists()).toBe(true);
    expect(helpCenterButton.element.disabled).toBe(undefined);

    expect(helpCenterButton.attributes('href')).toBe('zendesk.help_centre');
  });

  describe('Tests related to the menu for General Help', () => {
    beforeEach(async () => {
      wrapper.setProps({
        menuLinks: [{
          to: wrapper.vm.$i18n.t('zendesk.help_link.forgot_password').toString(),
          text: wrapper.vm.$i18n.t('zendesk.question.forgot_password'),
          test: 'zendesk-forgot-password',
        },
        {
          to: wrapper.vm.$i18n.t('zendesk.help_link.select_language_preferences').toString(),
          text: wrapper.vm.$i18n.t('zendesk.question.select_language_preferences'),
          test: 'zendesk-select-language-preferences',
        },
        {
          to: wrapper.vm.$i18n.t('zendesk.help_link.register_a_beneficiary').toString(),
          text: wrapper.vm.$i18n.t('zendesk.question.register_a_beneficiary'),
          test: 'zendesk-register-a-beneficiary',
        },
        {
          to: wrapper.vm.$i18n.t('zendesk.help_link.create_case_note').toString(),
          text: wrapper.vm.$i18n.t('zendesk.question.create_case_note'),
          test: 'zendesk-create-case-note',
        }],
      });
    });

    test('Test that the list items for the General Help Menu (dashboard) show the correct links', async () => {
      const generalHelpItem = '[data-test="general-help-item-zendesk';

      const forgotPasswordLink = wrapper.find(`${generalHelpItem}-forgot-password"]`);
      expect(forgotPasswordLink.attributes('href')).toBe(wrapper.vm.$i18n.t('zendesk.help_link.forgot_password'));

      const selectLanguagePreferencesLink = wrapper.find(`${generalHelpItem}-select-language-preferences"]`);
      expect(selectLanguagePreferencesLink.attributes('href')).toBe(wrapper.vm.$i18n.t('zendesk.help_link.select_language_preferences'));

      const registerBeneficiaryLink = wrapper.find(`${generalHelpItem}-register-a-beneficiary"]`);
      expect(registerBeneficiaryLink.attributes('href')).toBe(wrapper.vm.$i18n.t('zendesk.help_link.register_a_beneficiary'));

      const createCaseNoteLink = wrapper.find(`${generalHelpItem}-create-case-note"]`);
      expect(createCaseNoteLink.attributes('href')).toBe(wrapper.vm.$i18n.t('zendesk.help_link.create_case_note'));
    });
  });

  test('updateShow will trigger set the value for generalHelpMenuVisible', async () => {
    wrapper.vm.updateShow(true);
    await wrapper.vm.$nextTick();
    expect(dashboardStore.generalHelpMenuVisible).toBe(true);
  });
});
