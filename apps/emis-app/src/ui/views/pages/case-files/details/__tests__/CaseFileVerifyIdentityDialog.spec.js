/* eslint-disable no-unused-vars */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';

import { IdentityAuthenticationMethod, IdentityAuthenticationStatus } from '@libs/entities-lib/case-file';
import Component from '../components/CaseFileVerifyIdentityDialog.vue';

const localVue = createLocalVue();

describe('CaseFileVerifyIdentityDialog.vue', () => {
  let wrapper;
  let storage;

  beforeEach(async () => {
    storage = mockStorage();
    storage.caseFile.getters.screeningIds = jest.fn(() => mockOptionItemData());
    wrapper = await mount(Component, {
      localVue,
      propsData: {
        show: true,
        caseFile: {
          id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
          identityAuthentication: {
            method: IdentityAuthenticationMethod.NotApplicable,
            status: IdentityAuthenticationStatus.NotVerified,
            identificationIds: [],
          },
        },
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    describe('Information are correctly loaded', () => {
      it('preselects status correctly', () => {
        const inputSelect = wrapper.find('[data-test="status-notVerified"]');
        expect(inputSelect.element.checked).toBe(true);
      });
      it('when status is not verified other values are not applicable and fields are disabled', () => {
        let inputSelect = wrapper.find('[data-test="verifyIdentity_method"]');
        expect(inputSelect.text()).toBe('​common.notApplicable');
        expect(inputSelect.attributes('disabled')).toBe('disabled');
        inputSelect = wrapper.find('[data-test="verifyIdentity_options"]');
        expect(inputSelect.text()).toBe('​common.notApplicable');
        expect(inputSelect.attributes('disabled')).toBe('disabled');
      });
      it('when status is verified other values are applicable and fields are not disabled', async () => {
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Passed } });
        let inputSelect = wrapper.find('[data-test="verifyIdentity_method"]');
        expect(inputSelect.text()).not.toBe('​common.notApplicable');
        expect(inputSelect.attributes('disabled')).not.toBe('disabled');
        inputSelect = wrapper.find('[data-test="verifyIdentity_options"]');
        expect(inputSelect.text()).not.toBe('​common.notApplicable');
        expect(inputSelect.attributes('disabled')).not.toBe('disabled');
      });
    });
    it('should be hidden for now (help button exists and has the correct link)', () => {
      const helpButton = wrapper.find('[data-test="showHelp"]');
      expect(helpButton.exists()).toBe(false);
      expect(wrapper.vm.helpLink).toBe('zendesk.authentication_identity');
    });

    test('Cancel button is linked to proper translation', () => {
      const cancel = wrapper.find('[data-test="dialog-cancel-action"]');
      expect(cancel.text()).toBe('common.cancel');
    });

    describe('Created', () => {
      it('sets default when no identityAuthentication is passed', async () => {
        wrapper = await shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            caseFile: {
              id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
              identityAuthentication: null,
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.NotApplicable);
        expect(wrapper.vm.form.status).toEqual(IdentityAuthenticationStatus.NotVerified);
        expect(wrapper.vm.form.identificationIds).toEqual([]);
        expect(wrapper.vm.form.specifiedOther).toEqual(null);
      });

      it('sets form when identityAuthentication is passed', async () => {
        wrapper = await shallowMount(Component, {
          localVue,
          propsData: {
            show: true,
            caseFile: {
              id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
              identityAuthentication: {
                method: IdentityAuthenticationMethod.Exceptional,
                status: IdentityAuthenticationStatus.Passed,
                identificationIds: [{ optionItemId: 'abc', specifiedOther: 'def' }],
              },
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.Exceptional);
        expect(wrapper.vm.form.status).toEqual(IdentityAuthenticationStatus.Passed);
        expect(wrapper.vm.form.identificationIds).toEqual(['abc']);
        expect(wrapper.vm.form.specifiedOther).toEqual('def');
      });

      it('calls fetchScreeningIds', async () => {
        expect(storage.caseFile.actions.fetchScreeningIds).toHaveBeenCalled();
      });

      it('should display the status and method from with the data from BE during the initial loading', async () => {
        await wrapper.setProps({
          show: true,
          caseFile: {
            id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
            identityAuthentication: {
              method: IdentityAuthenticationMethod.System,
              status: IdentityAuthenticationStatus.Failed,
              identificationIds: [],
            },
          },
        });
        await wrapper.setData({
          isInitialLoading: true,
        });
        await wrapper.vm.$nextTick();
        wrapper.vm.form.method = wrapper.vm.caseFile.identityAuthentication.method;
        wrapper.vm.form.status = wrapper.vm.caseFile.identityAuthentication.status;
        expect(wrapper.vm.form.status).toEqual(IdentityAuthenticationStatus.Failed);
        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.System);
      });
    });
  });

  describe('Computed', () => {
    describe('verificationMethods', () => {
      it('Returns the list of verification methods, with system disabled, no N/A', () => {
        const verifs = wrapper.vm.verificationMethods;
        expect(verifs.length).toBe(3);
        expect(verifs.filter((x) => x.value === IdentityAuthenticationMethod.NotApplicable).length).toBe(0);
        expect(verifs.filter((x) => x.value === IdentityAuthenticationMethod.System && x.disabled).length).toBe(1);
        expect(verifs.filter((x) => x.disabled).length).toBe(1);
      });
    });

    describe('verificationOptions', () => {
      it('calls storage for screeningIds and passes current value', async () => {
        await wrapper.setData({ form: { identificationIds: ['abc'] } });
        expect(wrapper.vm.$storage.caseFile.getters.screeningIds).toHaveBeenCalledWith(true, ['abc']);
        await wrapper.setData({ form: { identificationIds: [] } });
        expect(wrapper.vm.$storage.caseFile.getters.screeningIds).toHaveBeenCalledWith(true, []);
      });
    });

    describe('isValidAuthStatus', () => {
      it('is valid when status === IdentityAuthenticationStatus.Passed', async () => {
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Passed } });
        expect(wrapper.vm.isValidAuthStatus).toBeTruthy();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Failed } });
        expect(wrapper.vm.isValidAuthStatus).toBeFalsy();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.NotVerified } });
        expect(wrapper.vm.isValidAuthStatus).toBeFalsy();
      });
    });

    describe('canSelectIds', () => {
      it('returns true when status === IdentityAuthenticationStatus.Passed and not System', async () => {
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.InPerson } });
        expect(wrapper.vm.canSelectIds).toBeTruthy();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.System } });
        expect(wrapper.vm.canSelectIds).toBeFalsy();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Failed, method: IdentityAuthenticationMethod.InPerson } });
        expect(wrapper.vm.canSelectIds).toBeFalsy();
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.NotVerified, method: IdentityAuthenticationMethod.InPerson } });
        expect(wrapper.vm.canSelectIds).toBeFalsy();
      });
    });

    describe('mustSpecifyOther', () => {
      it('returns true selected ids contains one option with isOther = true', async () => {
        const withOther = mockOptionItemData().filter((m) => m.isOther)[0].id;
        const notOther = mockOptionItemData().filter((m) => !m.isOther)[0].id;
        await wrapper.setData({
          form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.InPerson, identificationIds: [] },
        });
        expect(wrapper.vm.mustSpecifyOther).toBeFalsy();
        await wrapper.setData({
          form: { status: IdentityAuthenticationStatus.Passed, method: IdentityAuthenticationMethod.InPerson, identificationIds: [notOther] },
        });
        expect(wrapper.vm.mustSpecifyOther).toBeFalsy();
        await wrapper.setData({
          form: {
            status: IdentityAuthenticationStatus.Passed,
            method: IdentityAuthenticationMethod.InPerson,
            identificationIds: [withOther],
          },
        });
        expect(wrapper.vm.mustSpecifyOther).toBeTruthy();
        await wrapper.setData({
          form: {
            status: IdentityAuthenticationStatus.Passed,
            method: IdentityAuthenticationMethod.InPerson,
            identificationIds: [notOther, withOther],
          },
        });
        expect(wrapper.vm.mustSpecifyOther).toBeTruthy();
      });
    });

    describe('watcher isValidAuthStatus', () => {
      it('empties form when validation of identity isnt ok', async () => {
        await wrapper.setData({
          form: {
            identificationIds: ['abc'],
            method: IdentityAuthenticationMethod.Exceptional,
          },
        });
        await wrapper.setData({
          form: {
            status: IdentityAuthenticationStatus.Passed,
          },
        });
        expect(wrapper.vm.form.identificationIds).toEqual(['abc']);
        expect(wrapper.vm.form.method).toBe(IdentityAuthenticationMethod.Exceptional);
        await wrapper.setData({ form: { status: IdentityAuthenticationStatus.Failed } });
        expect(wrapper.vm.form.identificationIds).toEqual([]);
        expect(wrapper.vm.form.method).toBe(IdentityAuthenticationMethod.NotApplicable);
      });
    });
  });

  describe('Methods', () => {
    describe('Save', () => {
      it('saves changes and triggers a toast', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        const withOther = mockOptionItemData().filter((m) => m.isOther)[0].id;
        await wrapper.setData({
          form: {
            method: IdentityAuthenticationMethod.Exceptional,
            status: IdentityAuthenticationStatus.Passed,
            identificationIds: [withOther],
            specifiedOther: 'xxx',
          },
        });

        await wrapper.vm.save();
        expect(storage.caseFile.actions.setCaseFileIdentityAuthentication).toHaveBeenCalledWith(wrapper.vm.caseFile.id, {
          method: IdentityAuthenticationMethod.Exceptional,
          status: IdentityAuthenticationStatus.Passed,
          identificationIds: [{ optionItemId: withOther, specifiedOther: 'xxx' }],
        });
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(1);
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
      it('saves changes and closes only when valid - method invalid', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        await wrapper.setData({
          form: {
            // method invalid
            method: IdentityAuthenticationMethod.NotApplicable,
            status: IdentityAuthenticationStatus.Passed,
            identificationIds: ['abc'],
          },
        });

        await wrapper.vm.save();
        expect(storage.caseFile.actions.setCaseFileIdentityAuthentication).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(0);
        expect(wrapper.emitted('update:show')).toBeUndefined();
      });

      it('saves changes and closes only when valid - need ids', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();

        await wrapper.setData({
          form: {
            method: IdentityAuthenticationMethod.Exceptional,
            status: IdentityAuthenticationStatus.Passed,
            // need ids
            identificationIds: [],
          },
        });

        await wrapper.vm.save();
        expect(storage.caseFile.actions.setCaseFileIdentityAuthentication).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(0);
        expect(wrapper.emitted('update:show')).toBeUndefined();
      });

      it('saves changes and closes only when valid - method System', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        await wrapper.setData({
          form: {
            // method invalid
            method: IdentityAuthenticationMethod.System,
            status: IdentityAuthenticationStatus.Passed,
            identificationIds: ['abc'],
          },
        });

        await wrapper.vm.save();
        expect(storage.caseFile.actions.setCaseFileIdentityAuthentication).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(0);
        expect(wrapper.emitted('update:show')).toBeUndefined();
      });
    });
  });

  describe('Watcher', () => {
    describe('form.status', () => {
      test('If user put status as Passed, the method should be switched to not applicable', async () => {
        await wrapper.setData({
          isInitialLoading: false,
        });
        wrapper.vm.form.method = IdentityAuthenticationMethod.System;
        await wrapper.vm.$nextTick();
        wrapper.vm.form.status = IdentityAuthenticationStatus.NotVerified;
        await wrapper.vm.$nextTick();
        wrapper.vm.form.status = IdentityAuthenticationStatus.Passed;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.NotApplicable);
      });

      test('If user put status as failed, the method should be switched to not applicable', async () => {
        await wrapper.setData({
          isInitialLoading: false,
        });
        wrapper.vm.form.method = IdentityAuthenticationMethod.System;
        await wrapper.vm.$nextTick();
        wrapper.vm.form.status = IdentityAuthenticationStatus.NotVerified;
        await wrapper.vm.$nextTick();
        wrapper.vm.form.status = IdentityAuthenticationStatus.Failed;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.NotApplicable);
      });

      test('If user put status as not verified, the method should be switched to not applicable', async () => {
        await wrapper.setData({
          isInitialLoading: false,
        });
        wrapper.vm.form.method = IdentityAuthenticationMethod.System;
        await wrapper.vm.$nextTick();
        wrapper.vm.form.status = IdentityAuthenticationStatus.Passed;
        await wrapper.vm.$nextTick();
        wrapper.vm.form.status = IdentityAuthenticationStatus.NotVerified;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.form.method).toEqual(IdentityAuthenticationMethod.NotApplicable);
      });
    });
  });
});
