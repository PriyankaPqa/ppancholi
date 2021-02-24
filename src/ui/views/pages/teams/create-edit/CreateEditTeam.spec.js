import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { MAX_LENGTH_MD } from '@/constants/validations';
import { EEventStatus } from '@/entities/event';
import routes from '@/constants/routes';

import Component from './CreateEditTeam.vue';

const localVue = createLocalVue();

describe('CreateEditTeam.vue', () => {
  let wrapper;
  let actions;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          teamType: 'standard',
        },
      });
    });

    describe('Rendered elements', () => {
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
      });

      describe('cancel Confirmation Dialog', () => {
        let element;
        beforeEach(() => {
          element = wrapper.find('[data-test="createEditTeam__confirmCancelDialog"]');
        });

        it('displays the cancel confirmation dialog when showCancelConfirmationDialog is true', () => {
          wrapper.vm.showCancelConfirmationDialog = true;
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

          it('is disabled by default', () => {
            expect(element.attributes('disabled')).toBeFalsy();
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
        expect(wrapper.vm.headerTitle).toBe('teams.create_team');
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
        expect(wrapper.vm.rules.name).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
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
  });

  describe('Lifecycle', () => {
    actions = {
      searchEvents: jest.fn(),
    };
    beforeEach(() => {
      wrapper = mount(Component, {
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
    });

    test('Events should be fetched with the right filter', () => {
      expect(actions.searchEvents).toHaveBeenCalledWith(expect.anything(), {
        filter: { Schedule: { Status: EEventStatus.Open } },
      });
    });
  });

  describe('Methods', () => {
    describe('setEventIds', () => {
      it('should set the team eventIds to the argument passed to the method, if the argument is an array', async () => {
        await wrapper.vm.setEventIds(['foo', 'bar']);
        expect(wrapper.vm.team.eventIds).toEqual(['foo', 'bar']);
      });

      it('should set the team eventIds to an array containing the argument passed to the method, if the argument is a string', async () => {
        await wrapper.vm.setEventIds('foo');
        expect(wrapper.vm.team.eventIds).toEqual(['foo']);
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
  });
});
