<template>
  <div>
    <validation-observer ref="form" v-slot="{ failed, changed }" slim>
      <rc-page-content
        :title="isEditMode ? $t('appointmentProgram.edit.title') : $t('appointmentProgram.add.title')">
        <v-container v-if="appointmentProgramLoading">
          <v-row justify="center">
            <v-col cols="12" lg="10" class="mt-10">
              <v-skeleton-loader class="my-6" type="article" />
              <v-skeleton-loader class="my-6" type="article" />
              <v-skeleton-loader class="my-6" type="article" />
            </v-col>
          </v-row>
        </v-container>
        <v-container v-else>
          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11" class="pt-0">
              <language-tabs :language="languageMode" @click="setLanguageMode" />
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11" class="pt-2 pb-6">
              <status-select
                class="pb-2"
                data-test="appointment-program-status"
                :value="appointmentProgram.appointmentProgramStatus"
                :statuses="[Status.Active, Status.Inactive]"
                status-name="AppointmentProgramStatus"
                @input="onStatusChange($event)" />
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11">
              <v-text-field-with-validation
                v-model="appointmentProgram.name.translation[languageMode]"
                data-test="appointment-program-name"
                :label="`${$t('appointmentProgram.name')}*`"
                :rules="rules.name"
                @input="resetAsUnique()" />
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11" class="pt-0">
              <v-select-with-validation
                v-model="appointmentProgram.timeZone"
                data-test="appointment-program-time-zone"
                attach
                :label="`${$t('appointmentProgram.timeZone')}*`"
                :item-value="(item) => item.name"
                :item-text="(item) => $t(`appointmentProgram.timeZones.${item.label}`, { offset: item.offset })"
                :items="timeZoneOptions"
                :rules="rules.timeZone" />
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11" class="pt-0">
              <div class="fw-bold pb-4">
                {{ $t('appointmentProgram.section.businessHours') }}
              </div>
              <availability-hours :schedule.sync="schedule" :schedule-has-error.sync="scheduleHasError" />
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11" class="pb-0">
              <div class="fw-bold pb-4">
                {{ $t('appointmentProgram.section.email.message') }}
              </div>
              <language-tabs :language="languageMode" @click="setLanguageMode" />
              <v-text-field-with-validation
                v-model="appointmentProgram.emailConfirmationSubject.translation[languageMode]"
                data-test="appointment-program-edit-email-subject"
                :label="`${$t('appointmentProgram.emailConfirmation.subject')} *`"
                :rules="rules.emailConfirmationSubject" />

              <div class="mb-8">
                <vue-editor-a11y
                  id="appointment-program-email-text-editor"
                  v-model="appointmentProgram.emailConfirmationMessage.translation[languageMode]"
                  data-test="appointment-program-edit-email-message"
                  :editor-toolbar="toolbarSettings" />
                <div
                  v-if="editorError"
                  class="error-message"
                  data-test="appointment-program-edit-email-message-error">
                  {{ editorError }}
                </div>
              </div>
              <v-btn
                class="mb-8"
                small
                data-test="appointment-program-email-preview"
                @click="showPreview = true">
                <v-icon left>
                  mdi-camera-metering-center
                </v-icon>
                {{ $t('appointmentProgram.email.buttons.preview') }}
              </v-btn>
            </v-col>
          </v-row>

          <v-row v-if="isEditMode" justify="center">
            <v-col cols="12" xl="8" lg="9" md="11" class="d-flex justify-end">
              <v-btn class="mr-4" data-test="appointment-program-edit-cancel" @click.stop="back()">
                {{ $t('common.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                data-test="appointment-program-edit-save"
                :loading="loading"
                :disabled="editDisabled(failed, changed)"
                @click.stop="submit">
                {{ $t('common.save') }}
              </v-btn>
            </v-col>
            <v-col cols="12" xl="8" lg="9" md="11">
              <v-divider />
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11">
              <div class="fw-bold pb-4">
                {{ $t('appointmentProgram.section.serviceOptions') }}
              </div>
              <message-box
                v-if="showServiceOptionsError"
                icon="mdi-alert"
                class="failed"
                data-test="appointment-program-service-options-error"
                :message=" $t('appointments.serviceOptions.shouldNotBeEmpty')" />
              <service-options-table
                :appointment-program-id="appointmentProgram.id"
                :service-options.sync="appointmentProgram.serviceOptions"
                :is-edit-mode="isEditMode" />
            </v-col>
          </v-row>

          <v-row v-if="!isEditMode" justify="center">
            <v-col cols="12" xl="8" lg="9" md="11" class="d-flex justify-end">
              <v-btn class="mr-4" data-test="appointment-program-create-cancel" @click.stop="back()">
                {{ $t('common.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                data-test="appointment-program-create-submit"
                :loading="loading"
                :disabled="createDisabled(failed)"
                @click.stop="submit">
                {{ $t('common.buttons.create') }}
              </v-btn>
            </v-col>
            <v-col cols="12" xl="8" lg="9" md="11">
              <v-divider />
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11">
              <div class="fw-bold pb-4" :class="{ disabled: !isEditMode }">
                {{ $t('appointmentProgram.section.staffMembers') }}
              </div>
              <staff-members-table
                :appointment-program-id="appointmentProgram.id"
                :disabled="!isEditMode"
                :event-id="id"
                :service-options="appointmentProgram.serviceOptions" />
            </v-col>
          </v-row>
        </v-container>
      </rc-page-content>
    </validation-observer>
    <rationale-dialog ref="rationaleDialog" />
    <email-template-preview
      v-if="showPreview"
      email-template-key="AppointmentProgramEmail"
      :event-id="id"
      :show.sync="showPreview"
      :title="$t('appointmentProgram.email.preview.title')"
      :language-mode="languageMode"
      :subject="appointmentProgram.emailConfirmationSubject.translation[languageMode]"
      :message="appointmentProgram.emailConfirmationMessage.translation[languageMode]" />
  </div>
</template>

<script lang="ts">
import { MessageBox, RcPageContent, VSelectWithValidation, VTextFieldWithValidation, VueEditorA11y,
} from '@libs/component-lib/components';
import { Status, VForm } from '@libs/shared-lib/types';
import _isEqual from 'lodash/isEqual';
import routes from '@/constants/routes';
import _cloneDeep from 'lodash/cloneDeep';
import helpers from '@/ui/helpers/helpers';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import mixins from 'vue-typed-mixins';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import { AppointmentProgram, DayOfWeek, IDaySchedule } from '@libs/entities-lib/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { MAX_LENGTH_MD, MAX_LENGTH_XXL } from '@libs/shared-lib/constants/validations';
import { canadaTimeZones } from '@/constants/canadaTimeZones';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import { NavigationGuardNext, Route } from 'vue-router';
import { ui } from '@/constants/ui';
import entityUtils from '@libs/entities-lib/utils';
import EmailTemplatePreview from '@/ui/views/pages/mass-actions/components/EmailTemplatePreview.vue';
import RationaleDialog from '@/ui/shared-components/RationaleDialog.vue';
import { IMultilingual } from '@libs/shared-lib/src/types';
import { TranslateResult } from 'vue-i18n';
import appointmentHelpers from '../appointmentProgramsHelpers';
import AvailabilityHours from '../../appointments/components/AvailabilityHours.vue';
import ServiceOptionsTable from '../components/ServiceOptionsTable.vue';
import StaffMembersTable from '../components/StaffMembersTable.vue';
import { defaultBusinessHours } from '../../appointments/utils/defaultBusinessHours';

export default mixins(handleUniqueNameSubmitError).extend({
  name: 'CreateEditAppointmentProgram',

  components: {
    PageTemplate,
    RcPageContent,
    VSelectWithValidation,
    VTextFieldWithValidation,
    AvailabilityHours,
    ServiceOptionsTable,
    StaffMembersTable,
    StatusSelect,
    LanguageTabs,
    RationaleDialog,
    MessageBox,
    VueEditorA11y,
    EmailTemplatePreview,
  },

  props: {
    appointmentProgramId: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },

  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    const condition = this.isEditMode && ((this.$refs.form as VForm).flags.changed || this.scheduleIsModified || this.messageIsModified);
    await helpers.confirmBeforeLeaving(this, condition, next);
  },

  data() {
    return {
      EMAIL_DEFAULT_MESSAGE_EN: 'You have been scheduled for an appointment with a Red Cross Representative.',
      EMAIL_DEFAULT_MESSAGE_FR: 'Vous avez rendez-vous avec un représentant ou une représentante de la Croix-Rouge.',
      toolbarSettings: ui.vueEditorToolbarSettings,
      appointmentProgramLoading: false,
      loading: false,
      languageMode: 'en',
      appointmentProgram: new AppointmentProgram(),
      Status,
      timeZoneOptions: canadaTimeZones,
      scheduleHasError: false,
      showServiceOptionsError: false,
      initialBusinessHours: null as IDaySchedule[],
      initialMessage: null as IMultilingual,
      showPreview: false,
      editorError: '' as TranslateResult,
    };
  },

  computed: {
    initialAppointmentProgram() {
      return this.appointmentProgramId ? new AppointmentProgram(useAppointmentProgramStore().getById(this.appointmentProgramId)) : new AppointmentProgram();
    },

    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
        },
        timeZone: {
          required: true,
        },
        emailConfirmationSubject: {
          max: MAX_LENGTH_MD,
          required: true,
        },
      };
    },

    isEditMode(): boolean {
      return this.$route.name === routes.events.appointmentPrograms.edit.name;
    },

    scheduleIsModified(): boolean {
      return this.isEditMode && JSON.stringify(this.initialBusinessHours) !== JSON.stringify(this.appointmentProgram.businessHours);
    },

    messageIsModified(): boolean {
      return this.isEditMode && !_isEqual(this.appointmentProgram.emailConfirmationMessage, this.initialMessage);
    },

    // The component AvailabilityHours takes the schedule as an object with all week days as keys. Therefore the schedule stored in businessHours,
    // which is a list, needs to be transformed into this object (in the getter) and back (in the setter)
    schedule: {
      get(): Record<number, IDaySchedule> {
        const weekSchedule = {} as Record<number, IDaySchedule>;
        (helpers.getEnumValues(DayOfWeek) as number[]).forEach((weekDay) => {
          weekSchedule[weekDay] = this.appointmentProgram.businessHours.find((s) => s.day === weekDay) || { day: weekDay, timeSlots: [] };
        });

        return weekSchedule;
      },
      set(val: Record<number, IDaySchedule>): void {
        this.appointmentProgram.businessHours = Object.keys(val).map((day) => (val[+day].timeSlots.length ? {
          day: val[+day].day,
          timeSlots: val[+day].timeSlots.map((slot) => ({ start: slot.start, end: slot.end })),
        } : null)).filter((x) => x);
      },
    },
  },

  async created() {
    if (this.isEditMode) {
      try {
        this.appointmentProgramLoading = true;
        const res = await useAppointmentProgramStore().fetch(this.appointmentProgramId) as AppointmentProgram;
        this.appointmentProgram = new AppointmentProgram(res);
        this.initialBusinessHours = _cloneDeep(this.appointmentProgram.businessHours);
        this.initialMessage = _cloneDeep(this.appointmentProgram.emailConfirmationMessage);
      } finally {
        this.appointmentProgramLoading = false;
      }
    } else {
      this.appointmentProgram.eventId = this.id;
      this.appointmentProgram.businessHours = defaultBusinessHours;
      this.appointmentProgram.emailConfirmationMessage = { translation: { en: this.EMAIL_DEFAULT_MESSAGE_EN, fr: this.EMAIL_DEFAULT_MESSAGE_FR } };
    }
  },

  watch: {
    initialAppointmentProgram(newVal) {
      this.appointmentProgram = newVal;
    },

    'appointmentProgram.serviceOptions': {
      handler(newVal, oldVal) {
        if (newVal.length && !oldVal.length) {
          this.showServiceOptionsError = false;
        }
      },
    },

    'appointmentProgram.appointmentProgramStatus': {
      handler() {
          this.showServiceOptionsError = false;
      },
    },

    'appointmentProgram.emailConfirmationMessage': {
      handler() {
          this.editorError = '';
      },
      deep: true,
    },
  },

  methods: {
    back(): void {
      this.$router.back();
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.appointmentProgram.fillEmptyMultilingualAttributes();
    },

    async onStatusChange(status: Status) {
      if (this.isEditMode) {
        if (!appointmentHelpers.canSetActiveStatus(this.appointmentProgram, status)) {
          this.$message({ title: this.$t('common.error'), message: this.$t('appointmentProgram.edit.changeStatus.error') });
          return;
        }

        const dialog = this.$refs.rationaleDialog as any;
        const userInput = (await dialog?.open({
          title: this.$t('appointmentProgram.edit.changeStatus.rationale.title'),
          userBoxText: this.$t('appointmentProgram.edit.changeStatus.rationale.message'),
        })) as { answered: boolean, rationale: string };
        if (userInput?.answered) {
          const res = await useAppointmentProgramStore().setAppointmentProgramStatus(this.appointmentProgram.id, status, userInput.rationale);
          if (res) {
            this.appointmentProgram.appointmentProgramStatus = status;
            this.$toasted.global.success(this.$t('appointmentProgram.edit.changeStatus.success'));
          } else {
            this.$toasted.global.error(this.$t('appointmentProgram.edit.changeStatus.failed'));
          }
          dialog.close();
        }
      } else {
        this.appointmentProgram.appointmentProgramStatus = status;
      }
    },

    editDisabled(failed: boolean, changed: boolean): boolean {
      return this.createDisabled(failed) || (!changed && !this.scheduleIsModified && !this.messageIsModified);
    },

    createDisabled(failed: boolean): boolean {
     return failed || this.loading || this.scheduleHasError || this.showServiceOptionsError || !!this.editorError;
    },

   async validateForm(): Promise<boolean> {
      const validServiceOptionsCount = appointmentHelpers.validServiceOptionsCount(this.appointmentProgram);
      if (!validServiceOptionsCount) {
        this.showServiceOptionsError = true;
      }

      if (!entityUtils.validateMultilingualFieldRequired(this.appointmentProgram.emailConfirmationMessage, false)) {
        this.editorError = this.$t('validations.required');
      } else if (!entityUtils.validateMultilingualFieldLength(this.appointmentProgram.emailConfirmationMessage, MAX_LENGTH_XXL)) {
        this.editorError = this.$t('validations.max', { value: MAX_LENGTH_XXL });
      }

      return await (this.$refs.form as VForm).validate() && validServiceOptionsCount && !this.editorError;
    },

    async submit() {
      const isValid = await this.validateForm();
      if (!isValid) {
        helpers.scrollToFirstError('app');
        return;
      }

      try {
        this.loading = true;

        const programResponse = !this.isEditMode ? await useAppointmentProgramStore().createAppointmentProgram(this.appointmentProgram)
        : await useAppointmentProgramStore().updateAppointmentProgram(this.appointmentProgram);

        if (programResponse) {
          this.$toasted.global.success(!this.isEditMode ? this.$t('event.appointmentProgram.created') : this.$t('event.appointmentProgram.updated'));
          // so we can leave without warning
          (this.$refs.form as VForm).reset();
          this.initialBusinessHours = this.appointmentProgram.businessHours;
          this.initialMessage = this.appointmentProgram.emailConfirmationMessage;
          // reset actually takes a few ms but isnt awaitable...
          await helpers.timeout(500);
          this.$router.replace({ name: routes.events.appointmentPrograms.details.name, params: { appointmentProgramId: programResponse.id } });
        } else {
          this.$toasted.global.error(!this.isEditMode ? this.$t('event.appointmentProgram.create.failed') : this.$t('event.appointmentProgram.updated.failed'));
        }
      } catch (e) {
        this.$appInsights.trackTrace('Appointment program submit error', { error: e }, 'CreateEditAppointmentProgram', 'submit');
        this.handleSubmitError(e);
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
  .disabled {
    opacity: 50%
  }

  .error-message {
    color: var(--v-error-base) !important;
    font-size: 12px;
    padding: 4px 12px;
    position: absolute;
  }

  ::v-deep .row {
    margin-top: 0;
  }
</style>
