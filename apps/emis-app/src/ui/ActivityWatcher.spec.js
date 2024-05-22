import { createLocalVue, shallowMount } from '@/test/testSetup';
import { useMockUserStore } from '@/pinia/user/user.mock';
import Component from './ActivityWatcher.vue';

const localVue = createLocalVue();

let wrapper;
const { pinia, userStore } = useMockUserStore();

const doMount = (maxInactivity = 1, forceOptions = {}) => {
  const options = {
    propsData: {
      maxInactivity,
    },
    localVue,
    pinia,
    ...forceOptions,
  };

  wrapper = shallowMount(Component, options);
};

describe('ActivityWatcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    doMount();
    wrapper.vm.$refs.continueConfirm.open = jest.fn();
  });

  describe('Methods', () => {
    describe('activityWatcher', () => {
      it('should call signOut if inactivity is beyond limit plus countdown to logout', () => {
        jest.useFakeTimers();
        wrapper.vm.signOut = jest.fn();
        wrapper.vm.activityWatcher();
        jest.advanceTimersByTime((wrapper.vm.timeBeforeLogOut + wrapper.vm.maxInactivity) * 1000 + 1000);
        expect(wrapper.vm.signOut).toBeCalled();
      });

      it('should call onInactivity if inactivity is beyond limit', () => {
        jest.useFakeTimers();
        wrapper.vm.onInactivity = jest.fn();
        wrapper.vm.activityWatcher();
        jest.advanceTimersByTime((wrapper.vm.maxInactivity) * 1000 + 1000);
        expect(wrapper.vm.onInactivity).toBeCalled();
      });

      it('should not call anything if is not beyond limit', () => {
        jest.useFakeTimers();
        wrapper.vm.onInactivity = jest.fn();
        wrapper.vm.signOut = jest.fn();
        wrapper.vm.activityWatcher();
        jest.advanceTimersByTime(1000);
        expect(wrapper.vm.onInactivity).not.toBeCalled();
        expect(wrapper.vm.signOut).not.toBeCalled();
      });
    });

    describe('resetCounter', () => {
      it('should reset timestamp of last activity', async () => {
        await wrapper.setData({ lastActivityTimeStamp: new Date(2024, 2, 1) });
        wrapper.vm.resetCounter();
        expect(wrapper.vm.lastActivityTimeStamp.setSeconds(0, 0)).toBe((new Date()).setSeconds(0, 0));
      });
    });

    describe('onInactivity', () => {
      it('should call startCountdown', async () => {
        wrapper.vm.startCountdown = jest.fn();
        await wrapper.vm.onInactivity();
        expect(wrapper.vm.startCountdown).toBeCalled();
      });

      it('should open the countdown popup ', async () => {
        await wrapper.vm.onInactivity();
        expect(wrapper.vm.showLogOutPopup).toBe(true);
      });

      it('should sign out if not confirmation from user after X seconds', () => {
        wrapper.vm.signOut = jest.fn();
        jest.useFakeTimers();
        wrapper.vm.onInactivity();
        jest.advanceTimersByTime(wrapper.vm.timeBeforeLogOut * 1000); // 60sec
        expect(wrapper.vm.signOut).toHaveBeenCalledTimes(1);
      });

      it('should call activity watcher if user wants to continue session', async () => {
        wrapper.vm.activityWatcher = jest.fn();
        wrapper.vm.$refs.continueConfirm.open = jest.fn(() => true);
        await wrapper.vm.onInactivity();
        expect(wrapper.vm.activityWatcher).toHaveBeenCalledTimes(1);
      });
    });

    describe('signOut', () => {
      it('should call signOut', () => {
        wrapper.vm.signOut();
        expect(userStore.signOut).toHaveBeenCalledTimes(1);
      });

      it('should call unsubscribeAll from signalR', () => {
        wrapper.vm.signOut();
        expect(wrapper.vm.$signalR.unsubscribeAll).toHaveBeenCalledTimes(1);
      });
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

    it('should call activityWatcher if stopOnInactivity is true', async () => {
      expect(wrapper.vm.activityWatcher).toHaveBeenCalledTimes(1);
    });

    it('should not call activityWatcher if stopOnInactivity is false', async () => {
      doMount(1, { propsData: {
        stopOnInactivity: false,
        maxInactivity: 1,
      } });
      jest.spyOn(wrapper.vm, 'activityWatcher');
      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.activityWatcher).not.toHaveBeenCalled();
    });

    it('should add event listener for all activity events if stopOnInactivity is true', () => {
      expect(document.addEventListener).toHaveBeenCalledWith('mousedown', wrapper.vm.resetCounter, true);
      expect(document.addEventListener).toHaveBeenCalledWith('mousemove', wrapper.vm.resetCounter, true);
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', wrapper.vm.resetCounter, true);
      expect(document.addEventListener).toHaveBeenCalledWith('scroll', wrapper.vm.resetCounter, true);
      expect(document.addEventListener).toHaveBeenCalledWith('touchstart', wrapper.vm.resetCounter, true);
    });
  });
});
