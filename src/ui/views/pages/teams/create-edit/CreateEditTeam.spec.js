import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { MAX_LENGTH_MD } from '@/constants/validations';
import { mockEventsSearchData, mockEventsData } from '@/entities/event';
import routes from '@/constants/routes';
import { mockAppUsers, mockUserStateLevel } from '@/test/helpers';
import {
  mockTeamsData, ETeamStatus, ETeamType, mockTeamMembers, Team,
} from '@/entities/team';

import { mockAppUserAzureData } from '@/entities/app-user';

import Component from './CreateEditTeam.vue';

const localVue = createLocalVue();

describe('CreateEditTeam.vue', () => {
  let wrapper;

  const actions = {
    fetchEvents: jest.fn(),
    editTeam: jest.fn(() => mockTeamsData()[0]),
  };

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        store: {
          ...mockUserStateLevel(5),
        },
        localVue,
        propsData: {
          teamType: 'standard',
        },
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

        it('should be disabled in create mode', () => {
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

        it('calls navigateToHome when submit is called', () => {
          jest.spyOn(wrapper.vm, 'navigateToHome').mockImplementation(() => {});
          element.vm.$emit('submit');
          expect(wrapper.vm.navigateToHome).toHaveBeenCalledTimes(1);
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
          beforeEach(() => {
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
            beforeEach(() => {
              wrapper = shallowMount(Component, {
                localVue,
                propsData: {
                  teamType: 'standard',
                },
              });
              jest.spyOn(wrapper.vm, 'isSubmitDisabled').mockImplementation(() => true);
            });

            it('is disabled when isSubmitDisabled is true', () => {
              element = wrapper.findDataTest('createEditTeam__submit');
              expect(element.attributes('disabled')).toBeTruthy();
            });
          });
        });

        describe('cancel button', () => {
          let element;
          beforeEach(() => {
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
      beforeEach(() => {
        wrapper = mount(Component, {
          store: {
            ...mockUserStateLevel(4),
          },
          localVue,
          propsData: {
            teamType: 'standard',
          },
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
      });
    });

    describe('deleteEventConfirmationMessage', () => {
      it('displays the correct message ', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          computed: {
            submitLabel() {
              return 'mockSubmitLabel';
            },
            teamEventsIds() {
              return mockEventsData();
            },
          },
        });
        // eslint-disable-next-line prefer-destructuring
        wrapper.vm.eventsAfterRemoval = mockEventsData()[1];
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

    describe('resetAsUnique', () => {
      it('sets isNameUnique to true if it is false', async () => {
        wrapper.vm.isNameUnique = false;
        await wrapper.vm.resetAsUnique();
        expect(wrapper.vm.isNameUnique).toBeTruthy();
      });
    });

    describe('availableEvents', () => {
      it('returns openEvents getter', async () => {
        const activeEvent = [mockEventsSearchData()[1]];
        jest.spyOn(wrapper.vm.$storage.event.getters, 'openEvents').mockImplementation(() => activeEvent);
        const expected = activeEvent.map((e) => ({
          id: e.id,
          name: e.name,
        }));
        expect(wrapper.vm.availableEvents).toEqual(expected);
      });
    });
  });

  describe('Lifecycle', () => {
    test('fetchEvents action is called', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'standard',
        },
        store: {
          modules: {
            event: {
              actions,
            },
          },
        },
      });

      expect(actions.fetchEvents).toHaveBeenCalledTimes(1);
    });

    it('sets the right team type for adhoc team type in create mode', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'standard',
        },
        computed: {
          isEditMode() { return false; },
        },
      });
      await wrapper.vm.fetchEvents();
      expect(wrapper.vm.team.teamType).toEqual(ETeamType.Standard);
    });

    it('sets the right team type for standard team type in create mode', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'adhoc',
        },
        computed: {
          isEditMode() { return false; },
        },
      });
      await wrapper.vm.fetchEvents();
      expect(wrapper.vm.team.teamType).toEqual(ETeamType.AdHoc);
    });

    it('calls loadTeam in edit mode', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'adhoc',
        },
        computed: {
          isEditMode() { return true; },
        },
      });
      jest.spyOn(wrapper.vm, 'loadTeam').mockImplementation(() => {});

      await wrapper.vm.fetchEvents();
      expect(wrapper.vm.loadTeam).toHaveBeenCalledTimes(1);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'standard',
          id: '123',
        },
        store: {
          modules: {
            event: {
              actions,
            },
            team: {
              actions,
            },
          },
        },
      });
    });

    describe('fetchEvents', () => {
      test('Events should be fetched', () => {
        jest.clearAllMocks();
        wrapper.vm.fetchEvents();
        expect(actions.fetchEvents).toHaveBeenCalledTimes(1);
      });
    });

    describe('handleRemoveEvent', () => {
      it('sets the eventsIdsAfterRemoval to its argument', () => {
        wrapper.vm.handleRemoveEvent(mockEventsData());
        expect(wrapper.vm.eventsAfterRemoval).toEqual(mockEventsData());
      });
      it('sets showEventDeleteConfirmationDialog  to true', () => {
        wrapper.vm.handleRemoveEvent(mockEventsData());
        expect(wrapper.vm.showEventDeleteConfirmationDialog).toBeTruthy();
      });
    });

    describe('handleRemoveEventConfirmation', () => {
      it('sets team events with the eventsAfterRemoval if argument is true', async () => {
        wrapper.vm.eventsAfterRemoval = mockEventsData();
        wrapper.vm.handleRemoveEventConfirmation(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.team.events).toEqual(mockEventsData());
      });

      it('set team events with a clone of team.events if argument is false', async () => {
        wrapper.vm.team.events = [mockEventsData()[0]];
        wrapper.vm.handleRemoveEventConfirmation(false);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.team.events).toEqual([mockEventsData()[0]]);
      });

      it('sets showEventDeleteConfirmationDialog to false', () => {
        wrapper.vm.handleRemoveEventConfirmation(false);
        expect(wrapper.vm.showEventDeleteConfirmationDialog).toBeFalsy();
      });
    });

    describe('handleSubmitError', () => {
      it('sets isNameUnique to false if this is the error in its argument', async () => {
        await wrapper.vm.handleSubmitError(['Team name already exists ']);
        expect(wrapper.vm.isNameUnique).toBeFalsy();
      });

      it(' opens an error toast in case of a different error', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'error').mockImplementation(() => {});
        await wrapper.vm.handleSubmitError('foo');

        expect(wrapper.vm.$toasted.global.error).toHaveBeenLastCalledWith('error.unexpected_error');
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
          computed: {
            isEditMode() {
              return false;
            },
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
        });

        expect(wrapper.vm.isSubmitDisabled(false, true)).toBeFalsy();
      });
    });

    describe('loadTeam', (() => {
      beforeEach(async () => {
        wrapper.vm.$store.commit('team/resetTeam');
        wrapper.vm.$route.params = { id: 'foo' };
        jest.spyOn(wrapper.vm.$storage.team.actions, 'getTeam');
      });

      it('sets the right primary contact user', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.currentPrimaryContact).toEqual(mockTeamMembers()[0]);
      });

      it('calls the action getTeam', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.$storage.team.actions.getTeam).toHaveBeenCalledWith('123');
      });

      it('sets the right primaryContactQuery', async () => {
        await wrapper.vm.loadTeam();
        expect(wrapper.vm.primaryContactQuery).toEqual(mockTeamMembers()[0].displayName);
      });
    }));

    describe('navigateToHome', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          teamType: 'standard',
        },
      });
      jest.spyOn(wrapper.vm.$router, 'push');
      wrapper.vm.navigateToHome();
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.teams.home.name });
    });

    describe('onCancel', () => {
      it('sets showCancelConfirmationDialog to true if the passed argument is true', () => {
        wrapper.vm.showCancelConfirmationDialog = false;
        wrapper.vm.onCancel(true);
        expect(wrapper.vm.showCancelConfirmationDialog).toBeTruthy();
      });

      it('calls navigateToHome if the passed argument is false', () => {
        jest.spyOn(wrapper.vm, 'navigateToHome').mockImplementation(() => {});
        wrapper.vm.onCancel(false);
        expect(wrapper.vm.navigateToHome).toHaveBeenCalledTimes(1);
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
        jest.spyOn(wrapper.vm.$storage.appUser.getters, 'searchAppUser').mockImplementation(() => [mockAppUserAzureData()[0]]);
        wrapper.vm.primaryContactQuery = 'ab';
        wrapper.vm.minimumContactQueryLength = 2;
        await wrapper.vm.searchPrimaryContacts();
        expect(wrapper.vm.$storage.appUser.getters.searchAppUser).toHaveBeenCalledWith(wrapper.vm.primaryContactQuery, false, ['displayName']);
        expect(wrapper.vm.primaryContactUsers).toEqual([mockAppUserAzureData()[0]]);
      });

      it('does not call the searchAppUsers action when the query is not long enough long enough and empties the list of users', async () => {
        jest.spyOn(wrapper.vm.$storage.appUser.getters, 'searchAppUser').mockImplementation(() => {});
        wrapper.vm.primaryContactQuery = 'a';
        wrapper.vm.minimumContactQueryLength = 2;
        await wrapper.vm.searchPrimaryContacts();

        expect(wrapper.vm.$storage.appUser.getters.searchAppUser).not.toHaveBeenCalled();
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
      it('calls the validation method', async () => {
        wrapper.vm.currentPrimaryContact = {
          id: 'id',
        };
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$refs.form.validate).toHaveBeenCalledTimes(1);
      });

      it('calls the method setPrimaryContact of team with currentPrimaryContact', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
          },
          computed: {
            team() {
              return new Team();
            },
          },
        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        [wrapper.vm.currentPrimaryContact] = mockTeamMembers();
        jest.spyOn(wrapper.vm.team, 'setPrimaryContact');
        await wrapper.vm.submit();
        expect(wrapper.vm.team.setPrimaryContact).toHaveBeenCalledWith(mockTeamMembers()[0]);
      });

      describe('in create mode', () => {
        jest.clearAllMocks();

        beforeEach(() => {
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              teamType: 'standard',
            },
            store: {
              modules: {
                team: {
                  actions,
                },
              },
            },
            computed: {
              isEditMode() {
                return false;
              },
            },
            data() {
              return {
                currentPrimaryContact: {
                  id: 'id',
                },
              };
            },
          });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
        });

        it('does not call submitCreateTeam unless form validation succeeds', async () => {
          jest.spyOn(wrapper.vm, 'submitCreateTeam');
          wrapper.vm.$refs.form.validate = jest.fn(() => false);

          await wrapper.vm.submit();
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
              team() {
                return new Team();
              },
            },
            data() {
              return {
                currentPrimaryContact: {
                  id: 'id',
                },
              };
            },
          });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
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
      beforeAll(() => {
        jest.clearAllMocks();
      });
      it('calls createTeam action', async () => {
        const actions = {
          createTeam: jest.fn(),
        };
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            teamType: 'standard',
            id: '123',
          },
          store: {
            modules: {
              team: {
                actions,
              },
            },
          },
        });
        await wrapper.vm.submitCreateTeam();
        expect(actions.createTeam).toHaveBeenCalledTimes(1);
      });

      it('opens a toast with a success message for standard team', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});
        await wrapper.vm.submitCreateTeam();

        expect(wrapper.vm.$toasted.global.success).toHaveBeenLastCalledWith('teams.standard_team_created');
      });

      it('opens a toast with a success message for adhoc team', async () => {
        wrapper.vm.$store.$services.teams.createTeam = jest.fn(() => mockTeamsData()[1]);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});

        await wrapper.vm.submitCreateTeam();

        expect(wrapper.vm.$toasted.global.success).toHaveBeenLastCalledWith('teams.adhoc_team_created');
      });

      it('redirects to the edit page with the id of the newly created team', async () => {
        jest.spyOn(wrapper.vm.$router, 'replace').mockImplementation(() => {});

        await wrapper.vm.submitCreateTeam();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith(
          { name: routes.teams.edit.name, params: { id: mockTeamsData()[0].id, teamType: 'standard' } },
        );
      });

      it('resets the form validation', async () => {
        // wrapper.vm.$refs.form.validate = jest.fn(() => true);
        jest.spyOn(wrapper.vm, 'resetFormValidation').mockImplementation(() => {});
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.resetFormValidation).toHaveBeenCalledTimes(1);
      });
    });

    describe('submitEditTeam', () => {
      beforeAll(() => {
        jest.clearAllMocks();
      });

      it('calls editTeam action', async () => {
        await wrapper.vm.submitEditTeam();
        expect(actions.editTeam).toHaveBeenCalledTimes(1);
      });

      it('opens a toast with a success message', async () => {
        jest.spyOn(wrapper.vm.$toasted.global, 'success').mockImplementation(() => {});
        await wrapper.vm.submitEditTeam();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenLastCalledWith('teams.team_updated');
      });

      it('resets the form validation', async () => {
        // wrapper.vm.$refs.form.validate = jest.fn(() => true);
        jest.spyOn(wrapper.vm, 'resetFormValidation').mockImplementation(() => {});
        await wrapper.vm.submitCreateTeam();
        expect(wrapper.vm.resetFormValidation).toHaveBeenCalledTimes(1);
      });
    });
  });
});
