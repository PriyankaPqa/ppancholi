import { createLocalVue, mount } from '@/test/testSetup';
import { RcRouterViewTransition } from '@crctech/component-library';
import Component from '../MainLayout.vue';
import AppHeader from '../AppHeader.vue';
import LeftMenu from '../LeftMenu.vue';
import GeneralHelpMenu from '../GeneralHelpMenu.vue';

describe('MainLayout.vue', () => {
  let wrapper;
  const localVue = createLocalVue();
  beforeEach(async () => {
    wrapper = mount(Component, {
      localVue,
    });
  });

  it('should consist of AppHeader component', async () => {
    expect(wrapper.findComponent(AppHeader)).toBeTruthy();
  });

  it('should consist of LeftMenu component', async () => {
    expect(wrapper.findComponent(LeftMenu)).toBeTruthy();
  });

  it('should consist of GeneralHelpMenu component', async () => {
    expect(wrapper.findComponent(GeneralHelpMenu)).toBeTruthy();
  });

  it('should consist of RcRouterViewTransition component', async () => {
    expect(wrapper.findComponent(RcRouterViewTransition)).toBeTruthy();
  });

  test('helpMenuLinks are correct', async () => {
    const helpLinks = [{
      to: 'zendesk.help_link.forgot_password',
      text: 'zendesk.question.forgot_password',
      test: 'zendesk-forgot-password',
    },
    {
      to: 'zendesk.help_link.select_language_preferences',
      text: 'zendesk.question.select_language_preferences',
      test: 'zendesk-select-language-preferences',
    },
    {
      to: 'zendesk.help_link.register_a_beneficiary',
      text: 'zendesk.question.register_a_beneficiary',
      test: 'zendesk-register-a-beneficiary',
    },
    {
      to: 'zendesk.help_link.create_case_note',
      text: 'zendesk.question.create_case_note',
      test: 'zendesk-create-case-note',
    }];
    expect(wrapper.vm.helpMenuLinks).toEqual(helpLinks);
  });

  test('updateMini set paddingLeft val', async () => {
    expect(wrapper.vm.paddingLeft).toBe(false);
    wrapper.vm.updateMini(true);
    expect(wrapper.vm.paddingLeft).toBe(true);
  });
});
