import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './MainLayout.vue';

describe('SecondaryLeftMenu.vue', () => {
  let wrapper;
  const localVue = createLocalVue();

  beforeEach(async () => {
    jest.clearAllMocks();
    // eslint-disable-next-line no-unused-vars
    wrapper = shallowMount(Component, {
      localVue,
    });
  });

  test('Sanity', () => {
    expect(true).toBeTruthy();
  });
});
