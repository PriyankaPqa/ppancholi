/**
 * @group ui/components/layout
 */

import { createLocalVue, mount } from '@/test/testSetup';
import Component from '../SecondaryLeftMenu.vue';

describe('SecondaryLeftMenu.vue', () => {
  let wrapper;
  const localVue = createLocalVue();
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = mount(Component, {
      localVue,
      mocks: {
        $t: () => 'test',
      },
      propsData: {
        title: 'title',
        tabs: [
          {
            text: 'menu1',
            test: 'test1',
            icon: '',
            disabled: false,
            to: 'route1',
          },
          {
            text: 'menu2',
            test: 'test2',
            icon: 'mdi-calendar',
            disabled: true,
            to: 'route2',
          },
        ],
        validationTabs: false,
        isFormMounted: false,
      },
    });
  });

  describe('General', () => {
    test('title is correctly displayed', () => {
      const title = wrapper.find('[data-test="title-left-menu"]');
      expect(title.text()).toBe('title');
    });
    test('back button is shown depending on props', async () => {
      const backButton = wrapper.find('[data-test="back-button"]');
      expect(backButton.exists()).toBe(true);
      await wrapper.setProps({
        hideBackButton: true,
      });
      expect(backButton.exists()).toBe(false);
    });
    test('tabs are displayed if not empty', async () => {
      let navigationWithoutValidation = wrapper.find('[data-test="navigationWithoutValidation"]');
      expect(navigationWithoutValidation.exists()).toBe(true);
      wrapper.setProps({
        tabs: [],
      });
      await wrapper.vm.$nextTick();
      navigationWithoutValidation = wrapper.find('[data-test="navigationWithoutValidation"]');
      expect(navigationWithoutValidation.exists()).toBe(false);
    });

    test('backButtonClicked is emitted on clicking on back', async () => {
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $t: () => 'test',
        },
        propsData: {
          title: 'title',
          tabs: [
            {
              text: 'menu1',
              test: 'test1',
              icon: '',
              disabled: false,
              to: 'route1',
            },
            {
              text: 'menu2',
              test: 'test2',
              icon: 'mdi-calendar',
              disabled: true,
              to: 'route2',
            },
          ],
          validationTabs: false,
          isFormMounted: false,
        },
      });
      const backButton = wrapper.find('[data-test="back-button"]');
      await backButton.trigger('click');
      expect(wrapper.emitted('backButtonClicked').length).toBe(1);
    });
    test('click:tab is emitted on clicking on tab', () => {
      wrapper = mount(Component, {
        localVue,
        mocks: {
          $t: () => 'test',
        },
        propsData: {
          title: 'title',
          tabs: [
            {
              text: 'menu1',
              test: 'test1',
              icon: '',
              disabled: false,
              to: 'route1',
            },
            {
              text: 'menu2',
              test: 'test2',
              icon: 'mdi-calendar',
              disabled: true,
              to: 'route2',
            },
          ],
          validationTabs: false,
          isFormMounted: false,
        },
      });
      const tab = wrapper.find('[data-test="test1"]');
      tab.trigger('click');
      expect(wrapper.emitted('click:tab')).toBeTruthy();
    });
  });
});
