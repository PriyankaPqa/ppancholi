import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import Component from './ActivityWatcher.vue';

const localVue = createLocalVue();
const storage = mockStorage();

let wrapper;

const doMount = (maxInactivity = 1) => {
  const options = {
    propsData: {
      maxInactivity,
    },
    localVue,
    mocks: {
      $storage: storage,
    },
  };

  wrapper = shallowMount(Component, options);
};

describe('ActivityWatcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    doMount();
  });

  describe('Methods', () => {
    describe('activityWatcher', () => {
      it('should set userInactive to false if activity detected before the limit', () => {
        wrapper.vm.activityWatcher();
        expect(wrapper.vm.userInactive).toBe(false);
      });

      it('should set userInactive to true if not activity detected after the limit', () => {
        jest.useFakeTimers();
        wrapper.vm.activityWatcher();
        jest.advanceTimersByTime(2000);
        expect(wrapper.vm.userInactive).toBe(true);
      });
    });

    describe('resetCounter', () => {
      it('should reset counter of last activity', async () => {
        await wrapper.setData({ secondsSinceLastActivity: 10 });
        wrapper.vm.resetCounter();
        expect(wrapper.vm.secondsSinceLastActivity).toBe(0);
      });
    });

    describe('onInactivity', () => {
      it('should display confirmation dialog', async () => {
        await wrapper.vm.onInactivity();

        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          htmlContent: '',
          messages: 'session_will_expire.message',
          showCancelButton: false,
          submitActionLabel: 'session_will_expire.submit.label',
          title: 'session_will_expire.title',
        });
      });

      it('should sign out if not confirmation from user after X seconds', () => {
        wrapper.vm.signOut = jest.fn();
        jest.useFakeTimers();
        wrapper.vm.onInactivity();
        jest.advanceTimersByTime(60000); // 60sec
        expect(wrapper.vm.signOut).toHaveBeenCalledTimes(1);
      });

      it('should call activity watcher if user wants to continue session', async () => {
        wrapper.vm.activityWatcher = jest.fn();
        await wrapper.vm.onInactivity();
        expect(wrapper.vm.activityWatcher).toHaveBeenCalledTimes(1);
      });
    });

    describe('signOut', () => {
      it('should call signOut from storage', () => {
        wrapper.vm.signOut();
        expect(wrapper.vm.$storage.user.actions.signOut).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Watch', () => {
    it('should call onInactivity if inactivity detected', async () => {
      wrapper.vm.onInactivity = jest.fn();
      await wrapper.setData({ userInactive: true });
      expect(wrapper.vm.onInactivity).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mounted', () => {
    beforeEach(() => {
      jest.spyOn(wrapper.vm, 'activityWatcher');
      jest.spyOn(document, 'addEventListener');
      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
    });

    it('should call activityWatcher', () => {
      expect(wrapper.vm.activityWatcher).toHaveBeenCalledTimes(1);
    });

    it('should add event listener for all activity events', () => {
      expect(document.addEventListener).toHaveBeenCalledWith('mousedown', wrapper.vm.resetCounter, true);
      expect(document.addEventListener).toHaveBeenCalledWith('mousemove', wrapper.vm.resetCounter, true);
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', wrapper.vm.resetCounter, true);
      expect(document.addEventListener).toHaveBeenCalledWith('scroll', wrapper.vm.resetCounter, true);
      expect(document.addEventListener).toHaveBeenCalledWith('touchstart', wrapper.vm.resetCounter, true);
    });
  });
});
