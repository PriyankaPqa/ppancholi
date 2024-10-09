import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from '@/ui/shared-components/StatusChip.vue';
import { EEventCallCentreStatus, EEventStatus } from '@libs/entities-lib/event';
import colors from '@libs/shared-lib/plugins/vuetify/colors';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { ApprovalStatus, PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { AccountStatus } from '@libs/entities-lib/user-account';
import { DocumentStatus } from '@libs/entities-lib/case-file-document';
import { Status } from '@libs/shared-lib/types';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { CompletionStatus as AssessmentResponseCompletionStatus } from '@libs/entities-lib/assessment-template';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { TaskStatus } from '@libs/entities-lib/task';
import { AppointmentStatus } from '@libs/entities-lib/appointment';

const localVue = createLocalVue();

describe('StatusChip.vue', () => {
  let wrapper;
  const mountWithStatus = (statusName, status) => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        statusName,
        status,
      },
    });
  };
  describe('Template', () => {
    describe('loading-circular', () => {
      it('should render when showLoading is true', async () => {
        mountWithStatus('EEventStatus', null);
        await wrapper.setProps({
          showLoading: true,
        });
        const element = wrapper.findDataTest('loading-circular');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('chevron-icon', () => {
      it('should render when showChevron is true', async () => {
        mountWithStatus('EEventStatus', null);
        await wrapper.setProps({
          showChevron: true,
        });
        const element = wrapper.findDataTest('chevron-icon');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('chip-text', () => {
      it('should render proper text', async () => {
        mountWithStatus('EEventStatus', EEventStatus.Open);
        const text = wrapper.findDataTest('chip-text');
        expect(text.text()).toEqual('eventsTable.eventStatus.Open');

        await wrapper.setProps({
          text: 'test-text-1',
        });
        expect(text.text()).toEqual('test-text-1');
      });
    });
  });

  describe('Chip color and text', () => {
    describe('EEventStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('EEventStatus', EEventStatus.Open);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('eventsTable.eventStatus.Open'));

        mountWithStatus('EEventStatus', EEventStatus.Closed);
        expect(wrapper.vm.color).toEqual(colors.chips.red);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('eventsTable.eventStatus.Closed'));

        mountWithStatus('EEventStatus', EEventStatus.OnHold);
        expect(wrapper.vm.color).toEqual(colors.chips.green_pale);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('eventsTable.eventStatus.OnHold'));

        mountWithStatus('EEventStatus', EEventStatus.Archived);
        expect(wrapper.vm.color).toEqual(colors.chips.light_grey);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('eventsTable.eventStatus.Archived'));
      });
    });

    describe('EEventCallCentreStatus and EEventLocationStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('EEventCallCentreStatus', EEventCallCentreStatus.Active);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('eventSummary.status.Active'));

        mountWithStatus('EEventCallCentreStatus', EEventCallCentreStatus.Inactive);
        expect(wrapper.vm.color).toEqual(colors.chips.light_grey);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('eventSummary.status.Inactive'));
      });
    });

    describe('CaseFileStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('CaseFileStatus', CaseFileStatus.Open);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.status.Open'));

        mountWithStatus('CaseFileStatus', CaseFileStatus.Inactive);
        expect(wrapper.vm.color).toEqual(colors.chips.light_grey);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.status.Inactive'));

        mountWithStatus('CaseFileStatus', CaseFileStatus.Closed);
        expect(wrapper.vm.color).toEqual(colors.chips.red);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.status.Closed'));

        mountWithStatus('CaseFileStatus', CaseFileStatus.Archived);
        expect(wrapper.vm.color).toEqual(colors.chips.grey);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.status.Archived'));
      });
    });

    describe('ApprovalStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('ApprovalStatus', ApprovalStatus.New);
        expect(wrapper.vm.color).toEqual(colors.chips.green_pale);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.ApprovalStatus.New'));

        mountWithStatus('ApprovalStatus', ApprovalStatus.Pending);
        expect(wrapper.vm.color).toEqual(colors.chips.orange);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.ApprovalStatus.Pending'));

        mountWithStatus('ApprovalStatus', ApprovalStatus.Declined);
        expect(wrapper.vm.color).toEqual(colors.chips.red);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.ApprovalStatus.Declined'));
      });
    });

    describe('FinancialAssistancePaymentStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('FinancialAssistancePaymentStatus', PaymentStatus.New);
        expect(wrapper.vm.color).toEqual(colors.chips.green_pale);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.financialAssistance.paymentStatus.New'));

        mountWithStatus('FinancialAssistancePaymentStatus', PaymentStatus.InProgress);
        expect(wrapper.vm.color).toEqual(colors.chips.orange);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.financialAssistance.paymentStatus.InProgress'));

        mountWithStatus('FinancialAssistancePaymentStatus', PaymentStatus.Sent, false);
        expect(wrapper.vm.color).toEqual(colors.chips.blue_pale);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.financialAssistance.paymentStatus.Sent'));

        mountWithStatus('FinancialAssistancePaymentStatus', PaymentStatus.Issued);
        expect(wrapper.vm.color).toEqual(colors.chips.blue_pale);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.financialAssistance.paymentStatus.Issued'));

        mountWithStatus('FinancialAssistancePaymentStatus', PaymentStatus.Cancelled);
        expect(wrapper.vm.color).toEqual(colors.chips.red);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.financialAssistance.paymentStatus.Cancelled'));
      });
    });

    describe('AccountStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('AccountStatus', AccountStatus.Active);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('common.account_status.Active'));

        mountWithStatus('AccountStatus', AccountStatus.Pending);
        expect(wrapper.vm.color).toEqual(colors.chips.green_pale);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('common.account_status.Pending'));

        mountWithStatus('AccountStatus', AccountStatus.Inactive);
        expect(wrapper.vm.color).toEqual(colors.chips.light_grey);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('common.account_status.Inactive'));
      });
    });

    describe('DocumentStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('DocumentStatus', DocumentStatus.Current);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.document.status.Current'));

        mountWithStatus('DocumentStatus', DocumentStatus.Past);
        expect(wrapper.vm.color).toEqual(colors.chips.light_grey);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('caseFile.document.status.Past'));
      });
    });

    describe('Status', () => {
      it('should render proper color and text', () => {
        mountWithStatus('Status', Status.Active);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.Status.Active'));

        mountWithStatus('Status', Status.Inactive);
        expect(wrapper.vm.color).toEqual(colors.chips.light_grey);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.Status.Inactive'));
      });
    });

    describe('AppointmentProgramStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('AppointmentProgramStatus', Status.Active);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.Status.Active'));

        mountWithStatus('AppointmentProgramStatus', Status.Inactive);
        expect(wrapper.vm.color).toEqual(colors.chips.light_grey);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.Status.Inactive'));
      });
    });

    describe('MassActionRunStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('MassActionRunStatus', MassActionRunStatus.Processed);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.MassActionRunStatus.Processed'));

        mountWithStatus('MassActionRunStatus', MassActionRunStatus.PreProcessing);
        expect(wrapper.vm.color).toEqual(colors.chips.orange);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.MassActionRunStatus.PreProcessing'));

        mountWithStatus('MassActionRunStatus', MassActionRunStatus.Processing);
        expect(wrapper.vm.color).toEqual(colors.chips.orange);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.MassActionRunStatus.Processing'));

        mountWithStatus('MassActionRunStatus', MassActionRunStatus.PreProcessed);
        expect(wrapper.vm.color).toEqual(colors.chips.green_pale);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.MassActionRunStatus.PreProcessed'));

        mountWithStatus('MassActionRunStatus', MassActionRunStatus.FailedPreProcessing);
        expect(wrapper.vm.color).toEqual(colors.chips.red);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.MassActionRunStatus.FailedPreProcessing'));

        mountWithStatus('MassActionRunStatus', MassActionRunStatus.FailedProcessing);
        expect(wrapper.vm.color).toEqual(colors.chips.red);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.MassActionRunStatus.FailedProcessing'));
      });
    });

    describe('AssessmentResponseCompletionStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('AssessmentResponseCompletionStatus', AssessmentResponseCompletionStatus.Pending);
        expect(wrapper.vm.color).toEqual(colors.chips.orange);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.completionStatus.Pending'));

        mountWithStatus('AssessmentResponseCompletionStatus', AssessmentResponseCompletionStatus.Partial);
        expect(wrapper.vm.color).toEqual(colors.chips.green_pale);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.completionStatus.Partial'));

        mountWithStatus('AssessmentResponseCompletionStatus', AssessmentResponseCompletionStatus.Completed);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.completionStatus.Completed'));

        mountWithStatus('AssessmentResponseCompletionStatus', AssessmentResponseCompletionStatus.Obsolete);
        expect(wrapper.vm.color).toEqual(colors.chips.light_grey);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.completionStatus.Obsolete'));
      });
    });

    describe('HouseholdStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('HouseholdStatus', HouseholdStatus.Open);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('household.profile.householdStatus.Open'));

        mountWithStatus('HouseholdStatus', HouseholdStatus.Closed);
        expect(wrapper.vm.color).toEqual(colors.chips.red);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('household.profile.householdStatus.Closed'));

        mountWithStatus('HouseholdStatus', HouseholdStatus.Archived);
        expect(wrapper.vm.color).toEqual(colors.chips.grey);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('household.profile.householdStatus.Archived'));
      });
    });

    describe('TaskStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('TaskStatus', TaskStatus.InProgress);
        expect(wrapper.vm.color).toEqual(colors.chips.orange);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('task.task_status.InProgress'));

        mountWithStatus('TaskStatus', TaskStatus.Completed);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('task.task_status.Completed'));
      });
    });

    describe('AppointmentStatus', () => {
      it('should render proper color and text', () => {
        mountWithStatus('AppointmentStatus', AppointmentStatus.Scheduled);
        expect(wrapper.vm.color).toEqual(colors.chips.green);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.AppointmentStatus.Scheduled'));

        mountWithStatus('AppointmentStatus', AppointmentStatus.Rescheduled);
        expect(wrapper.vm.color).toEqual(colors.chips.green_pale);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.AppointmentStatus.Rescheduled'));

        mountWithStatus('AppointmentStatus', AppointmentStatus.Cancelled);
        expect(wrapper.vm.color).toEqual(colors.chips.red);
        expect(wrapper.vm.textFromEnum).toEqual(wrapper.vm.$t('enums.AppointmentStatus.Cancelled'));
      });
    });
  });
});
