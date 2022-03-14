import flushPromises from 'flush-promises';
import Component from '../../components/atoms/RcPhone/RcPhone.vue';
import CountryListItem from '../../components/atoms/RcPhone/components/CountryListItem.vue';
import { createLocalVue, mount } from '../testSetup';

describe('RcPhone.vue', () => {
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();
  });

  test('it selects the correct country when provided with an international number', () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        value: {
          number: '+34612345678',
          countryCode: '',
        },
      },
    });

    const flagIcon = wrapper.find('.vti__flag');

    expect(flagIcon.element.classList.contains('es')).toBe(true);
  });

  test('it selects the correct country when provided with an iso2 code', () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        value: {
          number: '',
          countryCode: 'ES',
        },
        defaultCountry: 'FR',
      },
    });

    const flagIcon = wrapper.find('.vti__flag');

    expect(flagIcon.element.classList.contains('es')).toBe(true);
  });

  test('it selects the canadian flag when provided with a north american toll-free number', () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        value: {
          number: '+18005555555',
          countryCode: '',
        },
      },
    });

    const flagIcon = wrapper.find('.vti__flag');

    expect(flagIcon.element.classList.contains('ca')).toBe(true);
  });

  test('it selects the default country when no number or iso2 code is provided', () => {
    const wrapper = mount(Component, {
      localVue,
      propsData: {
        value: {
          number: '',
          countryCode: '',
        },
        defaultCountry: 'ru',
      },
    });

    const flagIcon = wrapper.find('.vti__flag');

    expect(flagIcon.element.classList.contains('ru')).toBe(true);
  });

  test('it opens the country menu and changes the country when an item is clicked', async () => {
    const wrapper = mount(Component, {
      localVue,
    });

    const countryButton = wrapper.find('.countryButton');

    countryButton.trigger('click');

    await flushPromises();

    const countryList = wrapper.find('.countryList');

    expect(countryList).toBeTruthy();

    const countryListItems = wrapper.findAllComponents(CountryListItem);

    expect(countryListItems.length > 0).toBe(true);

    countryListItems.at(9).trigger('click');

    await flushPromises();

    const flagIcon = wrapper.find('.vti__flag');

    expect(flagIcon.element.classList.contains('ar')).toBe(true);
  });

  describe('Phone number', () => {
    it('shows phone number correctly', async () => {
      const wrapper = mount(Component, {
        localVue,
        attrs: {
          'data-test': 'phone-number',
        },
      });

      const element = wrapper.find('input[data-test="phone-number"]');
      element.setValue('5147004555');
      await flushPromises();
      expect(wrapper.vm.innerValue).toBe('(514) 700-4555');
    });
    test('When inputting a number, the event preventDefault is not triggered', async () => {
      const mockEvent = { preventDefault: jest.fn(), key: '1' };
      const wrapper = mount(Component, {
        localVue,
        attrs: {
          'data-test': 'phone-number',
        },
      });
      const element = wrapper.find('input[data-test="phone-number"]');
      element.trigger('keypress', mockEvent);
      expect(mockEvent.preventDefault).not.toBeCalled();
    });
    test('When inputting a letter, the event preventDefault is triggered', async () => {
      const mockEvent = { preventDefault: jest.fn(), key: 'a' };
      const wrapper = mount(Component, {
        localVue,
        attrs: {
          'data-test': 'phone-number',
        },
      });
      const element = wrapper.find('input[data-test="phone-number"]');
      element.trigger('keypress', mockEvent);
      expect(mockEvent.preventDefault).toBeCalled();
    });
    test('Button is disabled if the property disabled is true', async () => {
      const wrapper = mount(Component, {
        localVue,
      });
      expect(wrapper.find('.countryButton').attributes('disabled')).toBe(undefined);

      await wrapper.setProps({
        disabled: true,
      });
      expect(wrapper.find('.countryButton').attributes('disabled')).toBe('disabled');
    });
  });
});
