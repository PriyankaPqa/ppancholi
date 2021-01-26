import { createLocalVue, mount } from '@/test/testSetup';
import helpers from '@/ui/helpers';
import Component from '../PageContent.vue';

describe('PageContent.vue', () => {
  let wrapper;
  const localVue = createLocalVue();
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = mount(Component, {
      localVue,
      propsData: {
        helpLink: 'help link',
        title: 'title',
        showHelp: true,
      },
    });
  });

  test('openHelp method is triggered when clicking the help link button', async () => {
    wrapper.vm.openHelp = jest.fn();

    const helpLinkBtn = wrapper.find('[data-test="pageContent__opeHelp"]');
    await helpLinkBtn.trigger('click');

    expect(wrapper.vm.openHelp).toBeCalledTimes(1);
  });

  test('openHelp method opens windows with correct url ', async () => {
    helpers.openWindowRightSide = jest.fn();
    await wrapper.vm.openHelp();

    expect(helpers.openWindowRightSide).toHaveBeenCalledWith('help link', 300);
  });
});
