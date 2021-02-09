import { createLocalVue, mount } from '@/test/testSetup';
import Component from './PageNotFound.vue';

const localVue = createLocalVue();

describe('PageNotFound.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,

    });
  });

  describe('Template', () => {
    describe('Elements on page', () => {
      test('The page displays the title', () => {
        const element = wrapper.find('[data-test="pageNotFound__title"]');
        expect(element.text()).toBe('pageNotFound.title');
      });

      test('The page displays the text', () => {
        const element = wrapper.find('[data-test="pageNotFound__message"]');
        expect(element.text()).toBe('pageNotFound.message');
      });
    });
  });
});
