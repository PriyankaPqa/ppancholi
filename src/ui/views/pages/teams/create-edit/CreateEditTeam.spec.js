import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { MAX_LENGTH_MD } from '@/constants/validations';
import {
  EEventStatus,
} from '@/entities/event';
import routes from '@/constants/routes';
import { mockAppUsers, mockUserStateLevel } from '@/test/helpers';
import {
  ETeamStatus, ETeamType, mockTeamMembersData, Team, mockTeamSearchDataAggregate, mockTeam, mockTeamTwo, getOriginalData, mockTeamEvents,
} from '@/entities/team';
import { mockStorage } from '@/store/storage';

import { mockCombinedUserAccount, mockCombinedUserAccounts } from '@/entities/user-account';
import Component from './CreateEditTeam.vue';

jest.mock('@/store/modules/team/teamUtils');

const localVue = createLocalVue();
const storage = mockStorage();

describe('CreateEditTeam.vue', () => {
  let wrapper;

  const teamEventsMock = mockTeamEvents();
  storage.event.getters.eventsByStatus = jest.fn(() => teamEventsMock);
  storage.event.actions.search = jest.fn(() => teamEventsMock);
  storage.team.actions.getTeam = jest.fn(() => mockTeam());
  storage.team.actions.createTeam = jest.fn(() => mockTeam());
  storage.team.getters.team = jest.fn(() => mockTeam());
  storage.userAccount.getters.getByCriteria = jest.fn(() => [mockCombinedUserAccount()]);
  storage.userAccount.actions.fetchAll = jest.fn(() => mockCombinedUserAccounts());

  describe('Template', () => {
    beforeEach(async () => {
      wrapper = mount(Component, {
        store: {
          ...mockUserStateLevel(5),
        },
        localVue,
        propsData: {
          teamType: 'standard',
        },
        mocks: {
          $storage: {
            event: {
              getters: {
                eventsByStatus: jest.fn(() => teamEventsMock),
              },
              actions: {
                search: jest.fn(() => teamEventsMock),
              },
            },
            team: {
              actions: { getTeam: jest.fn(() => new Team(mockTeamSearchDataAggregate()[0])) },
              getters: { team: jest.fn(() => mockTeam()) },
            },
            userAccount: {
              getters: { getByCriteria: jest.fn(() => [mockCombinedUserAccount()]) },
              actions: { fetchAll: jest.fn(() => mockCombinedUserAccounts()) },
            },
          },
        },
      });
      await wrapper.setData({
        team: mockTeam(),
        isLoading: false,
      });
    });

    describe('Rendered elements', () => {
      describe('back button', () => {
        let element;
        beforeEach(() => {
          element = wrapper.findDataTest('pageContent_backButton');
        });
        it('renders', () => {
          expect(element.exists()).toBeTruthy();
        });
        it('calls onCancel when it is clicked', () => {
          jest.spyOn(wrapper.vm, 'onCancel').mockImplementation(() => {});
          element.vm.$emit('click');
          expect(wrapper.vm.onCancel).toHaveBeenCalledTimes(1);
        });
      });

      describe('Status', () => {
        it('should render', () => {
          const element = wrapper.find('[data-test="team-status"]');
          expect(element.exists()).toBeTruthy();
        });

        it('should be disabled in create mode', async () => {
          wrapper = mount(Component, {
            localVue,
            propsData: {
              teamType: 'standard',
            },
            computed: {
              isEditMode() {
                return false;
              },
            },
            mocks: {
              $storage: storage,
            },
          });
          await wrapper.setData({
            team: mockTeam(),
            isLoading: false,
          });

          const element = wrapper.find('[data-test="team-status"]');
          expect(element.props('disabled')).toBeTruthy();
        });
      });

      describe('Name field', () => {
        let element;
        beforeEach(() => {
          element = wrapper.find('[data-test="team-name"]');
        });

        it('should render', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('should display the correct label', () => {
          const label = element.find('label');
          expect(label.text()).toEqual('teams.form.team_name*');
        });

        it('is linked to the right rule attribute', () => {
          expect(element.props('rules')).toEqual(wrapper.vm.rules.name);
        });

        it('should update the right property when it is modified', async () => {
          const input = element.find('input');
          await input.setValue('foo');
          expect(wrapper.vm.team.name).toBe('foo');
        });

        it('calls resetAsUnique on input', () => {
          jest.spyOn(wrapper.vm, 'resetAsUnique').mockImplementation(() => {});
          element.vm.$emit('input', 'foo');
          expect(wrapper.vm.resetAsUnique).toHaveBeenCalledTimes(1);
        });
      });

      describe('Primary contact field', () => {
        let element;
        beforeEach(() => {
          element = wrapper.find('[data-test="team-contact"]');
        });

        it('should render', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('should display the right label', () => {
          const label = element.find('label');
          expect(label.text()).toEqual('teams.form.primary_contact*');
        });

        it('is linked to the right rule attribute', () => {
          expect(element.props('rules')).toEqual(wrapper.vm.rules.primaryContact);
        });

        it('should call the right method when it is updated', async () => {
          jest.spyOn(wrapper.vm, 'setPrimaryContact').mockImplementation(() => {});
          element.vm.$emit('change', 'bar');
          expect(wrapper.vm.setPrimaryContact).toHaveBeenCalledWith('bar');
        });

        it('should call resetPrimaryContact on keydown.delete', async () => {
          jest.spyOn(wrapper.vm, 'resetPrimaryContact').mockImplementation(() => {});
          element.vm.$emit('keydown', new KeyboardEvent('keydown', {
            keyCode: 8, // delete key
          }));
          expect(wrapper.vm.resetPrimaryContact).toHaveBeenCalledTimes(1);
        });
      });

      describe('Events field', () => {
        let element;
        beforeEach(() => {
          element = wrapper.find('[data-test="events"]');
        });

        it('should render', () => {
          expect(element.exists()).toBeTruthy();
        });

        it('should display the correct label if team type is standard', async () => {
          wrapper.setProps({ teamType: 'standard' });
          await wrapper.vm.$nextTick();
          const label = element.find('label');
          expect(label.text()).toEqual('teams.form.event');
        });

        it('should display the correct label if team type is adhoc', async () => {
          wrapper.setProps({ teamType: 'adhoc' });
          await wrapper.vm.$nextTick();
          const label = element.find('label');
          expect(label.text()).toEqual('teams.form.event*');
        });

        it('is linked to the right rule attribute', () => {
          expect(element.props('rules')).toEqual(wrapper.vm.rules.event);
        });

        it('calls setEvents when it is changed', () => {
          jest.spyOn(wrapper.vm, 'setEvents').mockImplementation(() => {});
          element.vm.$emit('change', 'foo');
          expect(wrapper.vm.setEvents).toHaveBeenCalledTimes(1);
        });

        it('calls handleRemoveEvent when an element is deleted', () => {
          jest.spyOn(wrapper.vm, 'handleRemoveEvent').mockImplementation(() => {});
          element.vm.$emit('delete');
          expect(wrapper.vm.handleRemoveEvent).toHaveBeenCalledTimes(1);
        });
      });

      describe('cancel Confirmation Dialog', () => {
        let element;
        beforeEach(async () => {
          wrapper.vm.showCancelConfirmationDialog = true;
          await wrapper.vm.$nextTick();
          element = wrapper.find('[data-test="createEditTeam__confirmCancelDialog"]');
        });

        it('displays the cancel confirmation dialog when showCancelConfirmationDialog is true', async () => {
          expect(element.exists()).toBeTruthy();
        });

        it('calls goBack when submit is called', () => {
          jest.spyOn(wrapper.vm, 'goBack').mockImplementation(() => {});
          element.vm.$emit('submit');
          expect(wrapper.vm.goBack).toHaveBeenCalledTimes(1);
        });

        it('sets showCancelConfirmationDialog to false when cancel is called', () => {
          element.vm.$emit('cancel');
          expect(wrapper.vm.showCancelConfirmationDialog).toBeFalsy();
        });

        it('sets showCancelConfirmationDialog to false when close  is called', () => {
          element.vm.$emit('close');
          expect(wrapper.vm.showCancelConfirmationDialog).toBeFalsy();
        });
      });

      describe('Remove Event Confirmation Dialog', () => {
        let element;
        beforeEach(async () => {
          wrapper.vm.showEventDeleteConfirmationDialog = true;
          await wrapper.vm.$nextTick();
          element = wrapper.find('[data-test="createEditTeam__confirmEventDeleteDialog"]');
        });

        it('displays the cancel confirmation dialog when showEventDeleteConfirmationDialog is true', async () => {
          expect(element.exists()).toBeTruthy();
        });

        it('calls handleRemoveEventConfirmation with true when submit is called', () => {
          jest.spyOn(wrapper.vm, 'handleRemoveEventConfirmation').mockImplementation(() => {});
          element.vm.$emit('submit');
          expect(wrapper.vm.handleRemoveEventConfirmation).toHaveBeenCalledWith(true);
        });

        it('calls handleRemoveEventConfirmation with false when cancel is called', () => {
          jest.spyOn(wrapper.vm, 'handleRemoveEventConfirmation').mockImplementation(() => {});
          element.vm.$emit('cancel');
          expect(wrapper.vm.handleRemoveEventConfirmation).toHaveBeenCalledWith(false);
        });

        it('calls handleRemoveEventConfirmation with false when close is called', () => {
          jest.spyOn(wrapper.vm, 'handleRemoveEventConfirmation').mockImplementation(() => {});
          element.vm.$emit('close');
          expect(wrapper.vm.handleRemoveEventConfirmation).toHaveBeenCalledWith(false);
        });
      });

      describe('Action buttons', () => {
        describe('submit button', () => {
          let element;
          beforeEach(async () => {
            wrapper = shallowMount(Component, {
              localVue,
              propsData: {
                teamType: 'standard',
              },
              computed: {
                submitLabel() {
                  return 'mockSubmitLabel';
                },
              },
              mocks: {
                $storage: storage,
              },
            });
            await wrapper.setData({
              team: mockTeam(),
              isLoading: false,
            });

            element = wrapper.findDataTest('createEditTeam__submit');
          });

          it('is rendered', () => {
            expect(element.exists()).toBeTruthy();
          });

          it('has the correct label', () => {
            expect(element.text()).toEqual('mockSubmitLabel');
          });

          it('calls submit when it is clicked', () => {
            jest.spyOn(wrapper.vm, 'submit').mockImplementation(() => {});
            element.vm.$emit('click');
            expect(wrapper.vm.submit).toHaveBeenCalledTimes(1);
          });

          describe('test disabled state', () => {
            let mockFn;
            beforeEach(() => {
              wrapper = shallowMount(Component, {
                localVue,
                propsData: {
                  teamType: 'standard',
                },
                mocks: {
                  $storage: storage,
                },
              });
              wrapper.setData({
                team: mockTeam(),
                isLoading: false,
              });
              mockFn = jest.spyOn(wrapper.vm, 'isSubmitDisabled');
              mockFn.mockImplementation(() => true);
            });

            it('is disabled when isSubmitDisabled is true', () => {
              element = wrapper.findDataTest('createEditTeam__submit');
              expect(element.attributes('disabled')).toBeTruthy();
            });
          });
          describe('test disabled state on data manipulation', () => {
            beforeEach(async () => {
              wrapper = shallowMount(Component, {
                localVue,
                propsData: {
                  teamType: 'standard',
                },
                mocks: {
                  $storage: storage,
                },
                computed: {
                  isEditMode() {
                    return true;
                  },
                },
              });
              const team = mockTeam();
              await wrapper.setData({
                team,
                isLoading: false,
              });
              wrapper.vm.setOriginalData();
              jest.spyOn(wrapper.vm, 'isSubmitDisabled').mockImplementation((isFailed, isChanged) => !isChanged);
            });
            it('is enabled when data is changed', async () => {
              await wrapper.setData({ team: mockTeamTwo() });
              element = wrapper.findDataTest('createEditTeam__submit');
              expect(element.attributes('disabled')).toBe(undefined);
            });

            it('is disabled when data is changed to original', async () => {
              await wrapper.setData({ team: mockTeamTwo() });
              element = wrapper.findDataTest('createEditTeam__submit');
              const isEnabledAfterChanged = element.attributes('disabled') === undefined;
              await wrapper.setData({ team: mockTeam() });
              element = wrapper.findDataTest('createEditTeam__submit');
              expect(element.attributes('disabled') && isEnabledAfterChanged).toBeTruthy();
            });
          });
        });

        describe('cancel button', () => {
          let element;
          beforeEach(async () => {
            wrapper = shallowMount(Component, {
              localVue,
              propsData: {
                teamType: 'standard',
              },
              mocks: {
                $storage: storage,
              },
              computed: {
                submitLabel() {
                  return 'mockSubmitLabel';
                },
              },
            });

            await wrapper.setData({
              team: mockTeam(),
              isLoading: false,
            });

            element = wrapper.findDataTest('createEditTeam__cancel');
          });

          it('is rendered', () => {
            expect(element.exists()).toBeTruthy();
          });

          it('has the correct label', () => {
            expect(element.text()).toEqual('common.buttons.cancel');
          });

          it('calls onCancel when it is clicked', () => {
            jest.spyOn(wrapper.vm, 'onCancel').mockImplementation(() => {});
            element.vm.$emit('click');
            expect(wrapper.vm.onCancel).toHaveBeenCalledTimes(1);
          });
        });
      });
    });

    describe('Authorization', () => {
      beforeEach(async () => {
        wrapper = mount(Component, {
          store: {
            ...mockUserStateLevel(4),
          },
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
        });
        await wrapper.setData({
          team: mockTeam(),
          isLoading: false,
        });
        wrapper.vm.$route.name = routes.teams.edit.name;
      });

      test('Status selection is disabled for L4 or less', () => {
        const element = wrapper.findDataTest('team-status');
        expect(element.props('disabled')).toBeTruthy();
      });

      test('Team name input is disabled for L4 or less', () => {
        const element = wrapper.findSelectWithValidation('team-name');
        expect(element.props('disabled')).toBeTruthy();
      });

      test('Primary contact input is disabled for L4 or less', () => {
        const element = wrapper.findSelectWithValidation('team-contact');
        expect(element.props('disabled')).toBeTruthy();
      });

      test('Event selection is disabled for L4 or less', () => {
        const element = wrapper.findSelectWithValidation('events');
        expect(element.props('disabled')).toBeTruthy();
      });

      test('Cancel button is disabled for L4 or less', () => {
        const element = wrapper.findDataTest('createEditTeam__cancel');
        expect(element.props('disabled')).toBeTruthy();
      });
    });
  });

  describe('beforeRouteEnter', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'standard',
        },
        mocks: {
          $storage: storage,
        },
        data() {
          return {
            team: mockTeam(),
          };
        },
      });
    });
    test('If "standard" is in the route params we go to next', async () => {
      const mockParam = { params: 'standard' };
      const next = jest.fn(() => {});
      wrapper.vm.$options.beforeRouteEnter(mockParam, {}, next);
      expect(next).toBeCalled();
    });

    test('If "adhoc" is in the route params we go to next', async () => {
      const mockTo = { params: 'adhoc' };
      const next = jest.fn(() => {});
      wrapper.vm.$options.beforeRouteEnter(mockTo, {}, next);
      expect(next).toBeCalled();
    });

    test('If a valid team type is not in the route params, we are redirected to the page where we came from', async () => {
      const mockTo = { params: 'foo' };
      const mockFrom = { name: 'bar' };
      const next = jest.fn(() => {});
      wrapper.vm.$options.beforeRouteEnter(mockTo, mockFrom, next);
      expect(next).toHaveBeenCalledWith(mockFrom);
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'standard',
        },
        mocks: {
          $storage: storage,
        },
        data() {
          return {
            team: mockTeam(),
          };
        },
      });
    });

    describe('deleteEventConfirmationMessage', () => {
      it('displays the correct message ', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            submitLabel() {
              return 'mockSubmitLabel';
            },
          },
        });
        await wrapper.setData({
          team: mockTeam(),
          isLoading: false,
        });
        // eslint-disable-next-line prefer-destructuring
        wrapper.vm.eventsAfterRemoval = teamEventsMock;
        expect(wrapper.vm.deleteEventConfirmationMessage).toEqual('team.event.confirmDeleteDialog.message');
      });
    });

    describe('isEditMode', () => {
      it('should return true when we are on the edit page', () => {
        wrapper.vm.$route.name = routes.teams.edit.name;
        expect(wrapper.vm.isEditMode).toBeTruthy();
      });
      it('should return false when we are on the create page', () => {
        wrapper.vm.$route.name = routes.teams.create.name;
        expect(wrapper.vm.isEditMode).toBeFalsy();
      });
    });

    describe('headerTitle', () => {
      it('should render the correct title if we are in edit mode', () => {
        wrapper.vm.$route.name = routes.teams.edit.name;
        expect(wrapper.vm.headerTitle).toBe('teams.edit_team');
      });
      it('should render the correct title if we are in create mode', () => {
        wrapper.vm.$route.name = routes.teams.create.name;
        expect(wrapper.vm.headerTitle).toBe('teams.create_new_team');
      });
    });

    describe('rules', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
        });
      });
      it('should have the correct name rule', () => {
        wrapper.vm.isNameUnique = true;
        expect(wrapper.vm.rules.name).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: wrapper.vm.isNameUnique, messageKey: 'validations.alreadyExists' },
        });
      });

      it('should have the correct primaryContact rule', () => {
        expect(wrapper.vm.rules.primaryContact).toEqual({
          required: true,
        });
      });

      it('should have the required true event rule if team type is adhoc', async () => {
        wrapper.setProps({ teamType: 'adhoc' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rules.event).toEqual({
          required: true,
        });
      });

      it('should have the required false event rule if team type is standard', async () => {
        wrapper.setProps({ teamType: 'standard' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rules.event).toEqual({
          required: false,
        });
      });
    });

    describe('teamTitle', () => {
      it('should display the right title if team type is standard', () => {
        wrapper.setProps({ teamType: 'standard' });
        expect(wrapper.vm.teamTitle).toBe('teams.types.standard');
      });

      it('should display the right title if team type is adhoc', async () => {
        wrapper.setProps({ teamType: 'adhoc' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.teamTitle).toBe('teams.types.adhoc');
      });
    });

    describe('changed', () => {
      beforeEach(async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        await wrapper.setData({
          team: mockTeam(),
          isLoading: false,
        });
        wrapper.vm.setOriginalData();
      });
      it('check if changed value changes on changing team values', async () => {
        await wrapper.setData({ team: mockTeamTwo() });
        const isEnabledAfterChanged = wrapper.vm.changed;
        await wrapper.setData({ team: mockTeam() });
        expect(!wrapper.vm.changed && isEnabledAfterChanged).toBeTruthy();
      });

      it('check if the value is unchanged', () => {
        expect(wrapper.vm.changed).toBeFalsy();
      });
    });

    describe('submitLabel', () => {
      it('should return the right label when we are in create mode', () => {
        wrapper.vm.$route.name = routes.teams.create.name;
        expect(wrapper.vm.submitLabel).toBe('common.buttons.create');
      });
      it('should return the right label when we are in edit mode', () => {
        wrapper.vm.$route.name = routes.teams.edit.name;
        expect(wrapper.vm.submitLabel).toBe('common.save');
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'standard',
        },
        mocks: {
          $storage: storage,
        },
        data() {
          return {
            team: mockTeam(),
          };
        },
      });
      wrapper.vm.fetchEvents = jest.fn();
      wrapper.vm.getAvailableEvents = jest.fn();
      wrapper.vm.fetchUserAccounts = jest.fn();
    });

    it('calls fetchEvents', async () => {
      await wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.fetchEvents).toHaveBeenCalledTimes(1);
    });

    it('calls getAvailableEvents', async () => {
      await wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.getAvailableEvents).toHaveBeenCalledTimes(1);
    });

    it('should calls fetchUserAccounts', async () => {
      jest.clearAllMocks();
      await wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.fetchUserAccounts).toHaveBeenCalledTimes(1);
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'standard',
          id: '123',
        },
        mocks: {
          $storage: storage,
        },
      });
      await wrapper.setData({
        team: mockTeam(),
        isLoading: false,
      });
    });

    describe('fetchEvents', () => {
      test('Events should be fetched', () => {
        jest.clearAllMocks();
        wrapper.vm.fetchEvents();
        expect(wrapper.vm.$storage.event.actions.search).toHaveBeenCalledTimes(1);
      });
    });

    describe('getAvailableEvents', () => {
      const options = {
        localVue,
        propsData: {
          teamType: 'standard',
          id: '123',
        },
        data() {
          return {
            team: mockTeam(),
            isLoading: false,
          };
        },
        mocks: {
          $storage: storage,
        },
      };

      beforeEach(async () => {
        wrapper = shallowMount(Component, options);
        await wrapper.vm.getAvailableEvents();
      });

      it('calls the storage getter to get the events with on hold and active status', async () => {
        expect(wrapper.vm.$storage.event.getters.eventsByStatus).toHaveBeenCalledWith([EEventStatus.Open, EEventStatus.OnHold]);
      });

      it('sets into availableEvents the events returned by the storage in the right form', async () => {
        expect(wrapper.vm.availableEvents).toEqual(teamEventsMock);
      });

      it('adds into availableEvents the events that are existing in the team but are not currently active/on hold, only for edit mode', async () => {
        const myTeam = mockTeam();
        const inactiveEvent = { id: 'foo', name: { translation: { en: 'mock-name' } } };
        myTeam.events = [inactiveEvent];
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: storage,
          },
          data() {
            return {
              currentPrimaryContact: {
                id: 'id',
              },
              team: myTeam,
            };
          },
        });

        await wrapper.vm.getAvailableEvents();

        expect(wrapper.vm.availableEvents).toEqual([
          inactiveEvent,
          ...teamEventsMock,
        ]);
      });
    });

    describe('setOriginalData', () => {
      let team;
      beforeEach(async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
        });
      });
      it('is disabled when data is changed to original', async () => {
        team = mockTeam();
        await wrapper.setData({
          team,
          isLoading: false,
        });
        await wrapper.vm.setOriginalData();
        expect(wrapper.vm.$data.original).toEqual(getOriginalData(team, wrapper));
      });
    });

    describe('handleRemoveEvent', () => {
      it('sets the eventsIdsAfterRemoval to its argument', () => {
        wrapper.vm.handleRemoveEvent(teamEventsMock[0]);
        expect(wrapper.vm.eventsAfterRemoval).toEqual(teamEventsMock[0]);
      });
      it('sets showEventDeleteConfirmationDialog  to true', () => {
        wrapper.vm.handleRemoveEvent(teamEventsMock[0]);
        expect(wrapper.vm.showEventDeleteConfirmationDialog).toBeTruthy();
      });
    });

    describe('handleRemoveEventConfirmation', () => {
      it('sets team events with the eventsAfterRemoval if argument is true', async () => {
        wrapper.vm.eventsAfterRemoval = teamEventsMock;
        wrapper.vm.handleRemoveEventConfirmation(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.team.events).toEqual(teamEventsMock);
      });

      it('set team events with a clone of team.events if argument is false', async () => {
        wrapper.vm.team.events = teamEventsMock;
        wrapper.vm.handleRemoveEventConfirmation(false);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.team.events).toEqual(teamEventsMock);
      });

      it('sets showEventDeleteConfirmationDialog to false', () => {
        wrapper.vm.handleRemoveEventConfirmation(false);
        expect(wrapper.vm.showEventDeleteConfirmationDialog).toBeFalsy();
      });
    });

    describe('isSubmitDisabled', () => {
      it('returns true when isFailed is true', () => {
        expect(wrapper.vm.isSubmitDisabled(true, true)).toBeTruthy();
        expect(wrapper.vm.isSubmitDisabled(true, false)).toBeTruthy();
      });

      it('returns true when in edit mode and isDirty is false', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: storage,
          },
          data() {
            return {
              team: new Team(mockTeamSearchDataAggregate()[0]),
              isLoading: false,
            };
          },
        });
        expect(wrapper.vm.isSubmitDisabled(false, false)).toBeTruthy();
        expect(wrapper.vm.isSubmitDisabled(true, false)).toBeTruthy();
      });

      it('return false when isFailed is false in create mode', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            isEditMode() {
              return false;
            },

          },
          data() {
            return {
              team: mockTeam(),
              isLoading: false,
            };
          },
        });

        expect(wrapper.vm.isSubmitDisabled(false, false)).toBeFalsy();
        expect(wrapper.vm.isSubmitDisabled(false, true)).toBeFalsy();
      });

      it('return false when in edit mode isFailed is false and isDirty is true', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: storage,
          },
          data() {
            return {
              team: new Team(mockTeamSearchDataAggregate()[0]),
              isLoading: false,
            };
          },
        });

        expect(wrapper.vm.isSubmitDisabled(false, true)).toBeFalsy();
      });
    });

    describe('loadTeam', (() => {
      beforeEach(async () => {
        wrapper.vm.$store.commit('team/resetTeam');
        wrapper.vm.$route.params = { id: 'foo' };
        jest.spyOn(wrapper.vm.$storage.team.actions, 'getTeam').mockImplementation(() => new Team(mockTeamSearchDataAggregate()[0]));
        jest.spyOn(wrapper.vm.$storage.team.getters, 'team').mockImplementation(() => new Team(mockTeamSearchDataAggregate()[0]));
      });

      it('sets the right primary contact user', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.currentPrimaryContact).toEqual(mockTeamMembersData()[0]);
      });

      it('calls the action getTeam', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.$storage.team.actions.getTeam).toHaveBeenCalledWith('123');
      });

      it('sets the right primaryContactQuery', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.primaryContactQuery).toEqual(mockTeamMembersData()[0].displayName);
      });

      it('should set the team with a cloneDeep of team from storage', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.team).toEqual(new Team(mockTeamSearchDataAggregate()[0]));
      });

      it('should call loadTeamFromState', async () => {
        jest.spyOn(wrapper.vm, 'loadTeamFromState');
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.loadTeamFromState).toBeCalled();
      });
    }));

    describe('loadTeamFromState', (() => {
      beforeEach(async () => {
        wrapper.vm.$store.commit('team/resetTeam');
        wrapper.vm.$route.params = { id: 'foo' };
        jest.spyOn(wrapper.vm.$storage.team.actions, 'getTeam').mockImplementation(() => new Team(mockTeamSearchDataAggregate()[0]));
        jest.spyOn(wrapper.vm.$storage.team.getters, 'team').mockImplementation(() => new Team(mockTeamSearchDataAggregate()[0]));
      });

      it('sets the right primaryContactQuery', async () => {
          await wrapper.vm.loadTeam();
          expect(wrapper.vm.primaryContactQuery).toEqual(mockTeamMembersData()[0].displayName);
      });

      it('should set the team with a cloneDeep of team from storage', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.team).toEqual(new Team(mockTeamSearchDataAggregate()[0]));
      });
    }));

    describe('goBack', () => {
      it('redirects to home if from param is not there', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
          data() {
            return {
              team: mockTeam(),
              isLoading: false,
            };
          },
        });
        jest.spyOn(wrapper.vm.$router, 'push');
        wrapper.vm.goBack();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.teams.home.name });
      });

      it('redirects to from if from param is there', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
          data() {
            return {
              team: mockTeam(),
              isLoading: false,
            };
          },
        });
        wrapper.vm.$route.params.from = 'from';
        jest.spyOn(wrapper.vm.$router, 'push');
        wrapper.vm.goBack();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'from' });
      });
    });

    describe('onCancel', () => {
      it('sets showCancelConfirmationDialog to true if the passed argument is true', () => {
        wrapper.vm.showCancelConfirmationDialog = false;
        wrapper.vm.onCancel(true);
        expect(wrapper.vm.showCancelConfirmationDialog).toBeTruthy();
      });

      it('calls g if the passed argument is false', () => {
        jest.spyOn(wrapper.vm, 'goBack').mockImplementation(() => {});
        wrapper.vm.onCancel(false);
        expect(wrapper.vm.goBack).toHaveBeenCalledTimes(1);
      });
    });

    describe('onStatusChange', () => {
      it('sets the team status to the received argument', async () => {
        await wrapper.vm.onStatusChange(ETeamStatus.Inactive);
        expect(wrapper.vm.team.status).toEqual(ETeamStatus.Inactive);
      });
    });

    describe('searchPrimaryContacts', () => {
      it('calls the searchAppUsers action when the query is long enough and assigns the result to primaryContactUsers', async () => {
        jest.spyOn(wrapper.vm.$storage.userAccount.getters, 'getByCriteria').mockImplementation(() => [mockCombinedUserAccount()]);
        wrapper.vm.primaryContactQuery = 'ab';
        wrapper.vm.minimumContactQueryLength = 2;
        await wrapper.vm.searchPrimaryContacts();
        expect(wrapper.vm.$storage.userAccount.getters.getByCriteria)
          .toHaveBeenCalledWith(wrapper.vm.primaryContactQuery, false, ['displayName']);
        const flattenedCombinedUserAccount = {
          ...mockCombinedUserAccount().entity,
          ...mockCombinedUserAccount().metadata,
          isPrimaryContact: false,
        };
        expect(wrapper.vm.primaryContactUsers).toEqual([flattenedCombinedUserAccount]);
      });

      it('does not call the searchAppUsers action when the query is not long enough long enough and empties the list of users', async () => {
        jest.clearAllMocks();
        jest.spyOn(wrapper.vm.$storage.userAccount.getters, 'getByCriteria').mockImplementation(() => []);
        wrapper.vm.primaryContactQuery = 'a';
        wrapper.vm.minimumContactQueryLength = 2;
        await wrapper.vm.searchPrimaryContacts();

        expect(wrapper.vm.$storage.userAccount.getters.getByCriteria).not.toHaveBeenCalled();
        expect(wrapper.vm.primaryContactUsers.length).toEqual(0);
      });
    });

    describe('setEvents', () => {
      it('should set the team events to the argument passed to the method, if the argument is an array', async () => {
        await wrapper.vm.setEvents([{ id: 'foo' }, { id: 'bar' }]);
        expect(wrapper.vm.team.events).toEqual([{ id: 'foo' }, { id: 'bar' }]);
      });

      it('should set the team events to an array containing the argument passed to the method, otherwise', async () => {
        await wrapper.vm.setEvents({ id: 'foo' });
        expect(wrapper.vm.team.events).toEqual([{ id: 'foo' }]);
      });
    });

    describe('setPrimaryContact', () => {
      it('assigns the primary user to currentPrimaryContact ', async () => {
        await wrapper.vm.setPrimaryContact(mockAppUsers[0]);
        expect(wrapper.vm.currentPrimaryContact).toEqual(mockAppUsers[0]);
      });
    });

    describe('submit', () => {
      beforeEach(() => {
        jest.clearAllMocks();

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          data() {
            return {
              team: mockTeam(),
              isLoading: false,
            };
          },
          mocks: {
            $storage: storage,
          },
        });
      });

      it('calls the validation method', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          data() {
            return {
              team: mockTeam(),
              isLoading: false,
              currentPrimaryContact: { id: 'id' },
            };
          },

        });

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$refs.form.reset = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$refs.form.validate).toHaveBeenCalledTimes(1);
      });

      it('calls the method setPrimaryContact of team with currentPrimaryContact', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.submitCreateTeam = jest.fn();
        wrapper.vm.setPrimaryContactTeam = jest.fn();
        await wrapper.vm.submit();
        expect(wrapper.vm.setPrimaryContactTeam).toHaveBeenCalledTimes(1);
      });

      describe('in create mode', () => {
        jest.clearAllMocks();

        beforeEach(async () => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              teamType: 'standard',
            },
            computed: {
              isEditMode() {
                return false;
              },
            },
            mocks: {
              $storage: storage,
            },
            data() {
              return {
                currentPrimaryContact: {
                  id: 'id',
                },
                // team: mockTeam(),
              };
            },
          });

          await wrapper.setData({
            team: mockTeam(),
            isLoading: false,
          });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.$refs.form.reset = jest.fn(() => true);
        });

        it('does not call submitCreateTeam unless form validation succeeds', async () => {
          jest.spyOn(wrapper.vm, 'submitCreateTeam');
          wrapper.vm.$refs.form.validate = jest.fn(() => false);
          expect(wrapper.vm.submitCreateTeam).toHaveBeenCalledTimes(0);

          wrapper.vm.$refs.form.validate = jest.fn(() => true);

          await wrapper.vm.submit();
          expect(wrapper.vm.submitCreateTeam).toHaveBeenCalledTimes(1);
        });
      });

      describe('edit mode', () => {
        jest.clearAllMocks();

        beforeEach(() => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              teamType: 'standard',
            },
            computed: {
              isEditMode() {
                return true;
              },
            },
            mocks: {
              $storage: storage,
            },
            data() {
              return {
                currentPrimaryContact: {
                  id: 'id',
                },
                team: mockTeam(),
              };
            },
          });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.$refs.form.reset = jest.fn(() => true);
        });

        it('does not call submitEditTeam unless form validation succeeds', async () => {
          jest.spyOn(wrapper.vm, 'submitEditTeam');
          wrapper.vm.$refs.form.validate = jest.fn(() => false);

          await wrapper.vm.submit();
          expect(wrapper.vm.submitEditTeam).toHaveBeenCalledTimes(0);

          wrapper.vm.$refs.form.validate = jest.fn(() => true);

          await wrapper.vm.submit();
          expect(wrapper.vm.submitEditTeam).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('submitCreateTeam', () => {
      beforeEach(async () => {
        jest.clearAllMocks();

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          computed: {
            isEditMode() {
              return false;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        await wrapper.setData({
          team: mockTeam(),
          isLoading: false,
        });

        jest.spyOn(wrapper.vm, 'resetFormValidation').mockImplementation(() => {});
      });

      it('calls createTeam action', async () => {
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.$storage.team.actions.createTeam).toHaveBeenCalledTimes(1);
      });

      it('calls setOriginalData action', async () => {
        jest.spyOn(wrapper.vm, 'setOriginalData');
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.setOriginalData).toHaveBeenCalledTimes(1);
      });

      it('opens a toast with a success message for standard team', async () => {
        await wrapper.vm.submitCreateTeam();

        expect(wrapper.vm.$toasted.global.success).toHaveBeenLastCalledWith('teams.standard_team_created');
      });

      it('sets the value of the team in data', async () => {
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.team).toEqual(mockTeam());
      });

      it('opens a toast with a success message for adhoc team', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'adhoc',
            id: '123',
          },
          computed: {
            isEditMode() {
              return false;
            },
          },
          mocks: {
            $storage: storage,
          },

        });

        await wrapper.setData({
          team: mockTeam(),
          isLoading: false,
        });

        jest.spyOn(wrapper.vm, 'resetFormValidation').mockImplementation(() => {});

        wrapper.vm.team.teamType = ETeamType.AdHoc;
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submitCreateTeam();

        expect(wrapper.vm.$toasted.global.success).toHaveBeenLastCalledWith('teams.standard_team_created');
      });

      it('redirects to the edit page with the id of the newly created team', async () => {
        wrapper.vm.team.id = 'guid-team-1';
        await wrapper.vm.submitCreateTeam();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith(
          { name: routes.teams.edit.name, params: { id: mockTeamSearchDataAggregate()[0].teamId, teamType: 'standard' } },
        );
      });

      it('resets the form validation', async () => {
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.resetFormValidation).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitEditTeam', () => {
      beforeEach(async () => {
        jest.clearAllMocks();

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          computed: {
            isEditMode() {
              return true;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        await wrapper.setData({
          team: mockTeam(),
          isLoading: false,
        });

        jest.spyOn(wrapper.vm, 'resetFormValidation').mockImplementation(() => {});
      });

      it('calls editTeam action', async () => {
        await wrapper.vm.submitEditTeam();
        expect(wrapper.vm.$storage.team.actions.editTeam).toHaveBeenCalledTimes(1);
      });

      it('calls setOriginalData action', async () => {
        jest.spyOn(wrapper.vm, 'setOriginalData');
        await wrapper.vm.submitEditTeam();
        expect(wrapper.vm.setOriginalData).toHaveBeenCalledTimes(1);
      });

      it('opens a toast with a success message', async () => {
        await wrapper.vm.submitEditTeam();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenLastCalledWith('teams.team_updated');
      });

      it('resets the form validation', async () => {
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.resetFormValidation).toHaveBeenCalledTimes(1);
      });

      it('calls loadTeamFromState on error', async () => {
        jest.spyOn(wrapper.vm, 'loadTeamFromState');
        jest.spyOn(wrapper.vm.$storage.team.actions, 'editTeam').mockImplementation(() => {
          throw new Error([]);
        });
        await wrapper.vm.submitEditTeam();
        expect(wrapper.vm.loadTeamFromState).toBeCalled();
      });
    });

    describe('Error Dialog', () => {
      let element;
      beforeEach(async () => {
        wrapper.vm.showErrorDialog = true;
        await wrapper.vm.$nextTick();
        element = wrapper.find('[data-test="createEditTeam__ErrorDialog"]');
      });

      it('displays the dialog when showErrorDialog is true', async () => {
        expect(element.exists()).toBeTruthy();
      });

      it('should not display the dialog when showErrorDialog is false', async () => {
        wrapper.vm.showErrorDialog = false;
        await wrapper.vm.$nextTick();
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('prepareCreateTeam', () => {
      it('should set the team correctly', async () => {
        const team = new Team();
        team.teamType = ETeamType.Standard;
        await wrapper.vm.prepareCreateTeam();
        expect(wrapper.vm.team).toEqual(team);
      });

      it('sets the right team type for standard team type in create mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            isEditMode() { return false; },
          },
        });
        await wrapper.vm.prepareCreateTeam();
        expect(wrapper.vm.team.teamType).toEqual(ETeamType.Standard);
      });

      it('sets the right team type for adhoc team type in create mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'adhoc',
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            isEditMode() { return false; },
          },
        });
        await wrapper.vm.prepareCreateTeam();
        expect(wrapper.vm.team.teamType).toEqual(ETeamType.AdHoc);
      });
    });

    describe('fetchUserAccounts', () => {
      it('should call fetchAll actions', async () => {
        await wrapper.vm.fetchUserAccounts();
        expect(wrapper.vm.$storage.userAccount.actions.fetchAll).toBeCalled();
      });
    });

    describe('setPrimaryContactTeam', () => {
      it('should set the primary contact of the team', () => {
        wrapper.vm.team.setPrimaryContact = jest.fn();
        wrapper.vm.setPrimaryContactTeam();
        expect(wrapper.vm.team.setPrimaryContact).toHaveBeenCalledWith({
          ...wrapper.vm.currentPrimaryContact,
          isPrimaryContact: true,
        });
      });
    });
  });
});
