import { createLocalVue, mount } from '@/test/testSetup';
import Component from '../Layout/RightMenu.vue';

const localVue = createLocalVue();

describe('RightMenu.vue', () => {
  let wrapper;
  let actions;

  beforeEach(() => {
    actions = {
      signOut: jest.fn(() => true),
    };

    wrapper = mount(Component, {
      localVue,
      store: {
        modules: {
          user: {
            actions,
            state: {
              given_name: 'Testy',
              family_name: 'McTesterson',
              email: 'testy.mctesterson@redcross.ca',
            },
          },
          dashboard: {
            state: {
              rightMenuVisible: true,
            },
          },
        },
      },
    });
  });

  test('close button closes the sidebar', async () => {
    expect(wrapper.vm.$store.state.dashboard.rightMenuVisible).toBe(true);

    const button = wrapper.find('[data-test="closeButton"]');

    await button.trigger('click');

    expect(wrapper.vm.$store.state.dashboard.rightMenuVisible).toBe(false);
  });

  // test('account settings button redirects to the account settings page', async () => {
  //   const button = wrapper.find('[data-test="account-settings"]');

  //   await button.trigger('click');

  //   expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.accountSettings.name });
  // });

  test('the logout button dispatches the logout action and redirects to the sign in page', async () => {
    const button = wrapper.find('[data-test="sign-out"]');

    await button.trigger('click');

    expect(actions.signOut).toHaveBeenCalledTimes(1);
  });

  test('the avatar is displayed correctly', async () => {
    const avatar = wrapper.find('[data-test="rightMenu__avatar"]');

    expect(avatar.text()).toBe('TM');
  });

  test('the user name is displayed correctly', async () => {
    const avatar = wrapper.find('[data-test="rightMenu__userName"]');

    expect(avatar.text()).toBe('Testy McTesterson');
  });

  test('the email is displayed correctly', async () => {
    const avatar = wrapper.find('[data-test="rightMenu__email"]');

    expect(avatar.text()).toBe('testy.mctesterson@redcross.ca');
  });
});
