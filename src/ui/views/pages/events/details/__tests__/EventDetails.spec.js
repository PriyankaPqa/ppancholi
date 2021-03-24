import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { Event, mockEventsSearchData } from '@/entities/event';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';

import Component from '../EventDetails.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockEvent = new Event(mockEventsSearchData()[0]);

describe('EventDetails.vue', () => {
  let wrapper;
  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: '7c076603-580a-4400-bef2-5ddececb0931',
        },
        computed: {
          event() {
            return mockEvent;
          },
          eventId() {
            return '000001';
          },
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '7c076603-580a-4400-bef2-5ddececb0931',
            },
          },

        },
      });
    });

    describe('Rendered elements', () => {
      describe('event typename', () => {
        let element;
        beforeEach(() => {
          element = wrapper.findDataTest('event-typeName');
        });
        it('is rendered', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('displays the correct data', () => {
          expect(element.text()).toEqual(mockEvent.eventTypeName.translation.en);
        });
      });

      describe('evenId', () => {
        let element;
        beforeEach(() => {
          element = wrapper.findDataTest('event-id');
        });
        it('is rendered', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('displays the correct data', () => {
          expect(element.text()).toEqual('000001');
        });
      });

      describe('event location province', () => {
        let element;
        beforeEach(() => {
          element = wrapper.findDataTest('event-location-province');
        });
        it('is rendered', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('displays the correct data', () => {
          expect(element.text()).toEqual(mockEvent.provinceName.translation.en);
        });
      });

      describe('event location region', () => {
        let element;
        describe('if the event has no region', () => {
          it('does not render', () => {
            element = wrapper.findDataTest('event-location-region');

            expect(element.exists()).toBeFalsy();
          });
        });

        describe('if the event has a region', () => {
          beforeEach(() => {
            wrapper = shallowMount(Component, {
              localVue,
              propsData: {
                id: '7c076603-580a-4400-bef2-5ddececb0931',
              },
              computed: {
                event() {
                  const event = _cloneDeep(mockEvent);
                  event.location.region = { translation: { en: 'mock region' } };
                  return event;
                },
              },
              mocks: {
                $route: {
                  name: routes.events.edit.name,
                  params: {
                    id: '7c076603-580a-4400-bef2-5ddececb0931',
                  },
                },
              },
            });
            element = wrapper.findDataTest('event-location-region');
          });

          it('is rendered', async () => {
            expect(element.exists()).toBeTruthy();
          });

          it('displays the correct data when the event has a region', async () => {
            expect(element.text()).toEqual('mock region');
          });
        });
      });

      describe('expanded left menu', () => {
        it('is displayed if showExpandedLeftMenu is true', async () => {
          wrapper.vm.showExpandedLeftMenu = true;
          await wrapper.vm.$nextTick();
          const element = wrapper.findDataTest('expanded-left-menu');
          expect(element.exists()).toBeTruthy();
        });

        it('is not displayed if showExpandedLeftMenu is false', async () => {
          wrapper.vm.showExpandedLeftMenu = false;
          await wrapper.vm.$nextTick();
          const element = wrapper.findDataTest('expanded-left-menu');
          expect(element.exists()).toBeFalsy();
        });
      });

      describe('event-phone', () => {
        let element;
        beforeEach(async () => {
          wrapper.vm.showExpandedLeftMenu = true;
          await wrapper.vm.$nextTick();
          element = wrapper.findDataTest('event-phone');
        });
        it('renders', () => {
          expect(element.exists()).toBeTruthy();
        });
        it('displays the right number', () => {
          expect(element.props().value).toEqual(mockEvent.responseDetails.assistanceNumber);
        });
      });

      describe('related events', () => {
        beforeEach(async () => {
          wrapper.vm.showExpandedLeftMenu = true;
          await wrapper.vm.$nextTick();
        });

        it('renders', () => {
          const element = wrapper.findDataTest('related-event');
          expect(element.exists()).toBeTruthy();
        });
        it('displays the related event name', () => {
          const relatedEvent = wrapper.vm.event.relatedEventsInfos[0];
          const element = wrapper.findDataTest('related-event');
          expect(element.text()).toEqual(relatedEvent.eventName.translation.en);
        });
      });

      describe('date created', () => {
        it('renders', () => {
          const element = wrapper.findDataTest('event-created-date');
          expect(element.exists()).toBeTruthy();
        });
        it('contains the correct date', () => {
          const element = wrapper.findDataTest('event-created-date');
          expect(element.text()).toEqual('2021-01-20');
        });
      });

      describe('date reported', () => {
        it('renders', () => {
          const element = wrapper.findDataTest('event-reported-date');
          expect(element.exists()).toBeTruthy();
        });
        it('contains the correct date', () => {
          const element = wrapper.findDataTest('event-reported-date');
          expect(element.text()).toEqual('2021-01-01');
        });
      });

      // TO add open, close and reopen dates tests when the business rules and dates history are done
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      storage.event.getters.eventById.mockReturnValueOnce(mockEvent);

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: '7c076603-580a-4400-bef2-5ddececb0931',
        },
        store: {
          modules: {
            event: {
              state: {
                getLoading: true,
              },
            },
          },
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '7c076603-580a-4400-bef2-5ddececb0931',
            },
          },
          $storage: storage,
        },
      });
    });
    describe('event', () => {
      it('return the event by id from the storage', () => {
        expect(wrapper.vm.event).toEqual(mockEvent);
      });
    });

    describe('eventId', () => {
      it('return the right format for eventID', () => {
        expect(wrapper.vm.eventId).toEqual(`00000${wrapper.vm.event.number}`);
      });
    });

    describe('tabs', () => {
      it('returns the right array', () => {
        expect(wrapper.vm.tabs).toEqual(
          [{
            text: 'eventDetail.menu_summary',
            test: 'event-summary',
            icon: '',
            disabled: false,
            to: routes.events.details.name,
          }],
        );
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      storage.event.actions.fetchEvents = jest.fn(() => {});
      storage.event.actions.fetchEvent = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: '7c076603-580a-4400-bef2-5ddececb0931',
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '7c076603-580a-4400-bef2-5ddececb0931',
            },
          },
          $storage: storage,
        },
      });
    });

    it('should call fetchEvent', () => {
      expect(wrapper.vm.$storage.event.actions.fetchEvent).toHaveBeenCalledWith(wrapper.vm.id);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      storage.event.actions.fetchEventTypes = jest.fn(() => {});
      storage.event.actions.fetchEvents = jest.fn(() => {});
      storage.event.actions.fetchEvent = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: '7c076603-580a-4400-bef2-5ddececb0931',
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '7c076603-580a-4400-bef2-5ddececb0931',
            },
          },
          $storage: storage,
        },
      });
    });
    describe('getStringDate', () => {
      it('returns the right date format when no format is given', () => {
        expect(wrapper.vm.getStringDate(new Date(2020, 0, 1))).toEqual('2020-01-01');
      });
      it('returns the right date format when a format is given', () => {
        expect(wrapper.vm.getStringDate(new Date(2020, 0, 1), 'll')).toEqual('Jan 1, 2020');
      });
    });

    describe('toggleExpandLeftMenu', () => {
      it('changes the state of showExpandedLeftMenu', async () => {
        wrapper.vm.showExpandedLeftMenu = true;
        await wrapper.vm.toggleExpandLeftMenu();
        expect(wrapper.vm.showExpandedLeftMenu).toBeFalsy();
      });
    });
  });
});
