import {
  createLocalVue,
  mount,
} from '@/test/testSetup';
import authenticationProvider from '@/auth/AuthenticationProvider';
import Component from '../LoginError.vue';

const localVue = createLocalVue();

describe('AppHeader.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
    });
  });

  test('the login button calls the authentication provider login function', async () => {
    const button = wrapper.findDataTest('loginError__signInButton');

    await button.trigger('click');

    expect(authenticationProvider.signIn).toHaveBeenCalledTimes(1);
  });
});
