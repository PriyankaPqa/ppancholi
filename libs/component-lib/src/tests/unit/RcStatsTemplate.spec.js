import { createLocalVue, mount } from '@libs/component-lib/tests/testSetup';
import Component from '../../components/molecule/RcStatsTemplate.vue';

describe('RcStatsTemplate.vue', () => {
  let localVue;
  let wrapper;

  beforeEach(() => {
    localVue = createLocalVue();
    wrapper = mount(Component, {
      localVue,
      propsData: {
        title: 'title',
        dataTestPrefix: 'prefix',
      },
      slots: {
        tip: 'slot_tip',
        top: 'slot_top',
        stats: 'slot_stats',
      },
    });
  });

  describe('Methods', () => {
    describe('next', () => {
      it('returns to first tab when we reach the end', async () => {
        await wrapper.setProps({
          numberOfTabs: 3,
          currentTab: 2,
        });
        await wrapper.vm.$nextTick();
        wrapper.vm.next();
        expect(wrapper.emitted('update:current-tab')[0]).toEqual([0]);
      });

      it('goes to the next tab ', async () => {
        await wrapper.setProps({
          numberOfTabs: 3,
          currentTab: 0,
        });
        await wrapper.vm.$nextTick();
        wrapper.vm.next();
        expect(wrapper.emitted('update:current-tab')[0]).toEqual([1]);
      });
    });

    describe('back', () => {
      it('returns to last tab when we reach the beginning', async () => {
        await wrapper.setProps({
          numberOfTabs: 3,
          currentTab: 0,
        });
        await wrapper.vm.$nextTick();
        wrapper.vm.back();
        expect(wrapper.emitted('update:current-tab')[0]).toEqual([2]);
      });

      it('goes to the previous tab ', async () => {
        await wrapper.setProps({
          numberOfTabs: 3,
          currentTab: 2,
        });
        await wrapper.vm.$nextTick();
        wrapper.vm.back();
        expect(wrapper.emitted('update:current-tab')[0]).toEqual([1]);
      });
    });
  });

  describe('Template', () => {
    test('Title is displayed', () => {
      const el = wrapper.findDataTest('prefix__stats__title');
      expect(el.text()).toBe('title');
    });

    test('Slot tip is here', () => {
      const el = wrapper.findDataTest('prefix__stats__tip');
      expect(el.text()).toBe('slot_tip');
    });

    test('Loader is displayed when loading', async () => {
      await wrapper.setProps({
        loading: true,
      });
      const el = wrapper.findDataTest('prefix__stats__loading');
      expect(el.exists()).toBeTruthy();
    });

    test('Slot top is here', () => {
      const el = wrapper.findDataTest('prefix__stats__slot__top');
      expect(el.text()).toBe('slot_top');
    });

    test('Slot stats is here', () => {
      const el = wrapper.findDataTest('prefix__stats__slot__stats');
      expect(el.text()).toBe('slot_stats');
    });

    test('Click left chevron triggers back', async () => {
      jest.spyOn(wrapper.vm, 'back');
      await wrapper.setProps({
        showPagination: true,
      });
      const el = wrapper.findDataTest('prefix__stats__back');
      el.trigger('click');
      expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
    });

    test('Click right chevron triggers back', async () => {
      jest.spyOn(wrapper.vm, 'next');
      await wrapper.setProps({
        showPagination: true,
      });
      const el = wrapper.findDataTest('prefix__stats__next');
      el.trigger('click');
      expect(wrapper.vm.next).toHaveBeenCalledTimes(1);
    });
  });
});
