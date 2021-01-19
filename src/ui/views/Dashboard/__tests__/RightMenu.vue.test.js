import { createLocalVue, mount } from '@/test/testSetup';
import { mockUsersData } from '@/entities/user';
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
            state: mockUsersData()[0],
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

  test('the logout button dispatches the logout action and redirects to the sign in page', async () => {
    const button = wrapper.find('[data-test="sign-out"]');

    await button.trigger('click');

    expect(actions.signOut).toHaveBeenCalledTimes(1);
  });

  test('the avatar is displayed correctly', async () => {
    const avatar = wrapper.find('[data-test="rightMenu__avatar"]');

    expect(avatar.text()).toBe('JW');
  });

  test('the user name is displayed correctly', async () => {
    const avatar = wrapper.find('[data-test="rightMenu__userName"]');

    expect(avatar.text()).toBe('John White');
  });

  test('the email is displayed correctly', async () => {
    const avatar = wrapper.find('[data-test="rightMenu__email"]');

    expect(avatar.text()).toBe('test@test.ca');
  });
});
