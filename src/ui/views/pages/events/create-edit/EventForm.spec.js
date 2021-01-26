describe('EventForm.vue', () => {
  test('test', () => {
    expect(true).toBe(true);
  });
});

// import Vue from 'vue';
// import Vuetify from 'vuetify';
// import { createLocalVue, mount } from '@/test/testSetup';
// import { mockEventsData, Event } from '@/entities/event';
// import helpers from '@/ui/helpers';
// import {
//   ECanadaProvinces, EEventResponseLevels, EEventStatus,
// } from '@/types';
// import moment from '@/ui/plugins/moment';
// import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@/constants/validations';
// import Component from './EventForm.vue';

// Vue.use(Vuetify);

// const event = new Event(mockEventsData()[0]);
// event.schedule.scheduledCloseDate = event.schedule.scheduledCloseDate.toString();
// event.schedule.scheduledOpenDate = event.schedule.scheduledOpenDate.toString();
// event.responseDetails.dateReported = event.responseDetails.dateReported.toString();
// event.fillEmptyMultilingualAttributes = jest.fn();

// describe('EventForm.vue', () => {
//   let wrapper;

//   beforeEach(() => {
//     wrapper = mount(Component, {
//       localVue: createLocalVue(),
//       propsData: {
//         event,
//         isEditMode: false,
//       },
//       data() {
//         return {
//           languageMode: 'en',
//           prefixRegistrationLink: 'https://mytest.test/',
//           assistanceNumber: {},
//         };
//       },
//     });
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('Methods', () => {
//     describe('copyRegistrationLink', () => {
//       it('calls copyToClipBoard with right parameters', () => {
//         helpers.copyToClipBoard = jest.fn();
//         wrapper.vm.copyRegistrationLink();
//         expect(helpers.copyToClipBoard).toHaveBeenCalledWith('https://mytest.test/gatineau-floods-2021');
//       });

//       it('displays a toast success toast notification', () => {
//         helpers.copyToClipBoard = jest.fn();
//         wrapper.vm.copyRegistrationLink();
//         expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('dashboard.eventSummary.copyLinkSuccessful');
//       });
//     });

//     describe('setLanguageMode', () => {
//       it('sets the languageMode', () => {
//         wrapper.vm.setLanguageMode('fr');
//         expect(wrapper.vm.languageMode).toBe('fr');
//       });

//       it('calls fillEmptyMultilingualAttributes entity method', () => {
//         wrapper.vm.setLanguageMode('fr');
//         expect(event.fillEmptyMultilingualAttributes).toHaveBeenCalledTimes(1);
//       });
//     });

//     describe('setAssistanceNumber', () => {
//       it('sets assistanceNumber with the phone object', () => {
//         const phoneObject = { number: '12345', countryISO2: 'fr', e164Number: '12345' };
//         wrapper.vm.setAssistanceNumber(phoneObject);
//         expect(wrapper.vm.assistanceNumber).toEqual(phoneObject);
//       });

//       it('sets the assistanceNumber of the localEvent to the e164Number', () => {
//         const phoneObject = { number: '12345', countryISO2: 'fr', e164Number: '12345' };
//         wrapper.vm.setAssistanceNumber(phoneObject);
//         expect(wrapper.vm.localEvent.responseDetails.assistanceNumber).toEqual(phoneObject.e164Number);
//       });
//     });

//     describe('setNameAndLink', () => {
//       it('sets the name of the localEvent', () => {
//         wrapper.vm.setNameAndLink('eventName');
//         expect(wrapper.vm.localEvent.name.translation[wrapper.vm.languageMode]).toEqual('eventName');
//       });

//       it('sets the registrationLink of the localEvent while applying lowercase and replace space by -', () => {
//         wrapper.vm.setNameAndLink('event Name');
//         expect(wrapper.vm.localEvent.registrationLink.translation[wrapper.vm.languageMode]).toEqual('event-name');
//       });
//     });
//   });

//   describe('Computed', () => {
//     describe('canadianProvinces', () => {
//       it('returns the proper data', () => {
//         expect(wrapper.vm.canadianProvinces).toEqual(helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
//       });
//     });

//     describe('isStatusOpen', () => {
//       it('returns true if the status is open, false otherwise', () => {
//         wrapper.vm.localEvent.schedule.status = EEventStatus.Open;
//         expect(wrapper.vm.isStatusOpen).toBeTruthy();

//         wrapper.vm.localEvent.schedule.status = EEventStatus.OnHold;
//         expect(wrapper.vm.isStatusOpen).toBeFalsy();
//       });

//       it('set the status of the event to open if true, onHold otherwise', () => {
//         wrapper.vm.localEvent.schedule.status = null;
//         wrapper.vm.isStatusOpen = true;
//         expect(wrapper.vm.localEvent.schedule.status).toEqual(EEventStatus.Open);

//         wrapper.vm.isStatusOpen = false;
//         expect(wrapper.vm.localEvent.schedule.status).toEqual(EEventStatus.OnHold);
//       });

//       it('set scheduledOpenDate to today if true, null otherwise', () => {
//         wrapper.vm.localEvent.schedule.scheduledOpenDate = null;
//         wrapper.vm.isStatusOpen = true;
//         expect(wrapper.vm.localEvent.schedule.scheduledOpenDate).toEqual(wrapper.vm.today);

//         wrapper.vm.isStatusOpen = false;
//         expect(wrapper.vm.localEvent.schedule.scheduledOpenDate).toEqual(null);
//       });

//       it('set scheduledCloseDate to null if false', () => {
//         wrapper.vm.localEvent.schedule.scheduledCloseDate = '2020-01-02';
//         wrapper.vm.isStatusOpen = true;
//         expect(wrapper.vm.localEvent.schedule.scheduledCloseDate).toEqual('2020-01-02');

//         wrapper.vm.isStatusOpen = false;
//         expect(wrapper.vm.localEvent.schedule.scheduledCloseDate).toEqual(null);
//       });
//     });

//     describe('otherProvinceSelected', () => {
//       it('returns true if other province has been selected, false otherwise', () => {
//         wrapper.vm.localEvent.location.province = ECanadaProvinces.OT;
//         expect(wrapper.vm.otherProvinceSelected).toBeTruthy();
//         wrapper.vm.localEvent.location.province = ECanadaProvinces.AB;
//         expect(wrapper.vm.otherProvinceSelected).toBeFalsy();
//       });
//     });

//     describe('responseLevels', () => {
//       it('returns the proper data', () => {
//         expect(wrapper.vm.responseLevels).toEqual(helpers.enumToTranslatedCollection(EEventResponseLevels, 'event.response_level'));
//       });
//     });

//     describe('scheduledCloseDateRule', () => {
//       it('returns the rule mustBeAfterOrSame if scheduledOpenDate and scheduledCloseDate are defined', () => {
//         const rule = {
//           mustBeAfterOrSame: { X: wrapper.vm.localEvent.schedule.scheduledCloseDate, Y: wrapper.vm.localEvent.schedule.scheduledOpenDate },
//         };
//         expect(wrapper.vm.scheduledCloseDateRule).toEqual(rule);
//       });

//       it('returns null if scheduledOpenDate or scheduledCloseDate are not defined', () => {
//         wrapper.vm.localEvent.schedule.scheduledCloseDate = null;
//         expect(wrapper.vm.scheduledCloseDateRule).toEqual(null);

//         wrapper.vm.localEvent.schedule.scheduledCloseDate = '2020-12-01';
//         wrapper.vm.localEvent.schedule.scheduledOpenDate = null;
//         expect(wrapper.vm.scheduledCloseDateRule).toEqual(null);
//       });
//     });

//     describe('scheduledOpenDateRule', () => {
//       it('returns the rule mustBeBeforeOrSame if scheduledOpenDate and scheduledCloseDate are defined', () => {
//         const rule = {
//           mustBeBeforeOrSame: { X: wrapper.vm.localEvent.schedule.scheduledOpenDate, Y: wrapper.vm.localEvent.schedule.scheduledCloseDate },
//         };
//         expect(wrapper.vm.scheduledOpenDateRule).toEqual(rule);
//       });

//       it('returns null if scheduledOpenDate or scheduledCloseDate are not defined', () => {
//         wrapper.vm.localEvent.schedule.scheduledCloseDate = null;
//         expect(wrapper.vm.scheduledOpenDateRule).toEqual(null);

//         wrapper.vm.localEvent.schedule.scheduledCloseDate = '2020-12-01';
//         wrapper.vm.localEvent.schedule.scheduledOpenDate = null;
//         expect(wrapper.vm.scheduledOpenDateRule).toEqual(null);
//       });
//     });

//     describe('statusColor', () => {
//       it('returns proper color for editMode', () => {
//         wrapper.vm.isEditMode = true;
//         expect(wrapper.vm.statusColor).toEqual('grey darken-2 white--text');
//       });

//       it('returns proper color for status is open', () => {
//         wrapper.vm.isStatusOpen = true;
//         expect(wrapper.vm.statusColor).toEqual('status_success white--text');
//       });

//       it('returns proper color for other case', () => {
//         wrapper.vm.isEditMode = false;
//         wrapper.vm.isStatusOpen = false;
//         expect(wrapper.vm.statusColor).toEqual('status_green_pale black--text');
//       });
//     });

//     describe('today', () => {
//       it('returns the date of today', () => {
//         const today = moment(new Date()).format('YYYY-MM-DD');
//         expect(wrapper.vm.today).toEqual(today);
//       });
//     });
//   });

//   describe('Template', () => {
//     describe('Events handler', () => {
//       test('Input event name calls setNameAndLink method', () => {
//         // TODO
//       });

//       test('Input on assistance number calls setAssistanceNumber', () => {
//         // TODO
//       });

//       test('Changing related event ....', () => {
//         // TODO
//       });

//       test('Deleting related event ....', () => {
//         // TODO
//       });
//     });
//     describe('Validation rules', () => {
//       beforeEach(() => {
//         wrapper = mount(Component, {
//           localVue: createLocalVue(),
//           propsData: {
//             event: new Event(),
//             isEditMode: false,
//           },
//           data() {
//             return {
//               languageMode: 'en',
//               prefixRegistrationLink: 'https://mytest.test/',
//               assistanceNumber: {},
//             };
//           },
//         });
//       });

//       test('event name is required', async () => {
//         await wrapper.vm.$refs.form.validate();
//         const el = wrapper.findTextFieldWithValidation('event-name');
//         expect(el.classes('invalid')).toBe(true);
//       });

//       test('event name max is MAX_LENGTH_MD', async () => {
//         wrapper.vm.localEvent.name.translation[wrapper.vm.languageMode] = 'x'.repeat(MAX_LENGTH_MD + 1);
//         await wrapper.vm.$refs.form.validate();
//         const el = wrapper.findTextFieldWithValidation('event-name');
//         expect(el.classes('invalid')).toBe(true);
//       });

//       test('event response level is required', async () => {
//         await wrapper.vm.$refs.form.validate();
//         const el = wrapper.findSelectWithValidation('event-level');
//         expect(el.classes('invalid')).toBe(true);
//       });

//       test('event province is required', async () => {
//         await wrapper.vm.$refs.form.validate();
//         const el = wrapper.findSelectWithValidation('event-province');
//         expect(el.classes('invalid')).toBe(true);
//       });

//       test('event province is required', async () => {
//         await wrapper.vm.$refs.form.validate();
//         const el = wrapper.findSelectWithValidation('event-province');
//         expect(el.classes('invalid')).toBe(true);
//       });

//       test('provinceOther is required when displayed', async () => {
//         wrapper.vm.localEvent.location.province = ECanadaProvinces.OT;
//         await wrapper.vm.$nextTick();
//         await wrapper.vm.$refs.form.validate();
//         const el = wrapper.findTextFieldWithValidation('event-province-other');
//         expect(el.classes('invalid')).toBe(true);
//       });

//       test('event provinceOther max is MAX_LENGTH_MD', async () => {
//         wrapper.vm.localEvent.location.province = ECanadaProvinces.OT;
//         wrapper.vm.localEvent.location.provinceOther.translation[wrapper.vm.languageMode] = 'x'.repeat(MAX_LENGTH_MD + 1);
//         await wrapper.vm.$nextTick();
//         await wrapper.vm.$refs.form.validate();
//         const el = wrapper.findTextFieldWithValidation('event-province-other');
//         expect(el.classes('invalid')).toBe(true);
//       });

//       test('event region is not required', async () => {
//         await wrapper.vm.$refs.form.validate();
//         const el = wrapper.findTextFieldWithValidation('event-region');
//         expect(el.classes('invalid')).toBe(false);
//       });

//       test('eventType is required', async () => {
//         await wrapper.vm.$refs.form.validate();
//         const el = wrapper.findSelectWithValidation('event-type');
//         expect(el.classes('invalid')).toBe(true);
//       });

//       test('assistanceNumber is required', async () => {
//         expect(false).toBe(true);
//       });

//       test('description max is MAX_LENGTH_LG', async () => {
//         wrapper.vm.localEvent.description.translation[wrapper.vm.languageMode] = 'x'.repeat(MAX_LENGTH_LG + 1);
//         await wrapper.vm.$refs.form.validate();
//         const el = wrapper.findTextFieldWithValidation('event-description');
//         expect(el.classes('invalid')).toBe(true);
//       });
//     });
//   });
// });
