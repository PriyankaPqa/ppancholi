import _cloneDeep from 'lodash/cloneDeep';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockCombinedEvent } from '@/entities/event';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import { mockOptionItemData } from '@/entities/optionItem';
import { mockStorage } from '@/store/storage';
import { ECanadaProvinces } from '@/types';
import Component from '../EventDetails.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockEvent = mockCombinedEvent();

describe('EventDetails.vue', () => {
  let wrapper;
  describe('Template', () => {
    beforeEach(async () => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
        },
        computed: {
          event() {
            return mockEvent;
          },
          eventId() {
            return '000001';
          },
          provinceName() {
            return 'Alberta';
          },
          eventTypeName() {
            return { translation: { en: 'Flood' } };
          },
          showRightMenu() {
            return true;
          },
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
            },
          },
          $storage: storage,
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
          expect(element.text()).toEqual(wrapper.vm.eventTypeName.translation.en);
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
          expect(element.text()).toEqual(wrapper.vm.provinceName);
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
            wrapper = mount(Component, {
              localVue,
              propsData: {
                id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
              },
              computed: {
                event() {
                  const event = _cloneDeep(mockEvent);
                  event.entity.location.region = { translation: { en: 'mock region' } };
                  return event;
                },
                eventId() {
                  return '000001';
                },
                provinceName() {
                  return 'Alberta';
                },
                eventTypeName() {
                  return { translation: { en: 'Flood' } };
                },
              },
              mocks: {
                $route: {
                  name: routes.events.edit.name,
                  params: {
                    id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
                  },
                },
                $storage: storage,
              },
            });
          });

          it('is rendered', async () => {
            element = wrapper.findDataTest('event-location-region');
            expect(element.exists()).toBeTruthy();
          });

          it('displays the correct data when the event has a region', async () => {
            element = wrapper.findDataTest('event-location-region');
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
          expect(element.props().value).toEqual(mockEvent.entity.responseDetails.assistanceNumber);
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
          const relatedEvent = wrapper.vm.event.metadata.relatedEventsInfos[0];
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
          expect(element.text()).toEqual('2021-04-06');
        });
      });

      describe('date reported', () => {
        it('renders', () => {
          const element = wrapper.findDataTest('event-reported-date');
          expect(element.exists()).toBeTruthy();
        });
        it('contains the correct date', () => {
          const element = wrapper.findDataTest('event-reported-date');
          expect(element.text()).toEqual(helpers.getLocalStringDate('2021-01-01T00:00:00Z'));
        });
      });

      // TO add open, close and reopen dates tests when the business rules and dates history are done
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      storage.event.getters.get = jest.fn(() => mockEvent);
      storage.event.getters.eventTypes = jest.fn(() => mockOptionItemData());

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
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
        expect(wrapper.vm.eventId).toEqual(`000${wrapper.vm.event.entity.number}`);
      });
    });

    describe('eventTypeName', () => {
      it('returns the right event type name', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
          },
          computed: {
            event() {
              return { ...mockEvent, entity: { ...mockEvent.entity, responseDetails: { eventType: { optionItemId: mockOptionItemData()[0].id } } } };
            },
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
            $storage: storage,
          },
        });

        expect(wrapper.vm.eventTypeName).toEqual(mockOptionItemData()[0].name);
      });
    });

    describe('provinceName', () => {
      it('returns the right province name when province is not other', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
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
          computed: {
            event() {
              return { ...mockEvent, entity: { ...mockEvent.entity, location: { province: ECanadaProvinces.QC } } };
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.provinceName).toEqual('common.provinces.QC');
      });

      it('returns the right province name when province is not other', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
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
          computed: {
            event() {
              return {
                ...mockEvent,
                entity: {
                  ...mockEvent.entity,
                  location: {
                    province: ECanadaProvinces.OT,
                    provinceOther: {
                      translation: { en: 'other-province' },
                    },
                  },
                },
              };
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.provinceName).toEqual('other-province');
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
            to: routes.events.summary.name,
            level: 'level4',
          }, {
            text: 'eventDetail.menu_programs',
            test: 'event-programs',
            icon: '',
            disabled: false,
            to: routes.programs.home.name,
            level: 'level6',
            exact: false,
          }, {
            text: 'eventDetail.menu_financial',
            test: 'event-financial-assitance',
            icon: '',
            disabled: false,
            to: routes.events.financialAssistance.home.name,
            level: 'level6',
            exact: false,
          }],
        );
      });
    });

    describe('statusHistory', () => {
      it('returns an array of objects representing status change history', () => {
        expect(wrapper.vm.statusHistory).toEqual([{
          title: 'eventDetail.open',
          date: '2021-03-31T15:23:00.755Z',
          reason: null,
        }, {
          title: 'eventDetail.closed',
          date: '2021-03-31T15:23:09.367Z',
          reason: 'Close Reason',
        }, {
          title: 'eventDetail.archived',
          date: '2021-03-31T15:23:13.508Z',
          reason: null,
        }, {
          title: 'event.status.onHold',
          date: '2021-03-31T15:23:16.069Z',
          reason: null,
        }]);
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      storage.event.actions.fetchAll = jest.fn(() => {});
      storage.event.actions.fetchEventTypes = jest.fn(() => {});
      storage.event.actions.fetchFullResponse = jest.fn(() => ({
        entity: { status: 403 },
      }));

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
            },
          },
          $storage: storage,
        },
      });
    });

    it('should call fetchEvent', () => {
      expect(wrapper.vm.$storage.event.actions.fetch)
        .toHaveBeenCalledWith(wrapper.vm.id, { useEntityGlobalHandler: true, useMetadataGlobalHandler: false });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      storage.event.actions.fetchEventTypes = jest.fn(() => {});
      storage.event.actions.fetchAll = jest.fn(() => {});
      storage.event.actions.fetch = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
        },
        mocks: {
          $route: {
            name: routes.events.edit.name,
            params: {
              id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f0',
            },
          },
          $storage: storage,
        },
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
