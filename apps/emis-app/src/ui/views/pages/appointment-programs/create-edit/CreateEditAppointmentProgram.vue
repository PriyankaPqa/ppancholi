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
            <v-col cols="12" xl="8" lg="9" md="11">
              <language-tabs :language="languageMode" @click="setLanguageMode" />
              <v-row class=" ma-0 pa-0 pb-4">
                <v-col class="d-flex ma-0 pa-0 align-center">
                  <status-select
                    data-test="appointment-program-status"
                    :value="appointmentProgram.appointmentProgramStatus"
                    :statuses="[Status.Active, Status.Inactive]"
                    status-name="AppointmentProgramStatus"
                    @input="onStatusChange($event)" />
                </v-col>
              </v-row>
              <v-row class="my-0">
                <v-col cols="12" class="py-0">
                  <v-text-field-with-validation
                    v-model="appointmentProgram.name.translation[languageMode]"
                    data-test="appointment-program-name"
                    :label="`${$t('appointmentProgram.name')}*`"
                    :rules="rules.name"
                    @input="resetAsUnique()" />
                </v-col>
              </v-row>
              <v-row class="my-0">
                <v-col cols="12" class="py-0">
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

              <v-row class="my-0">
                <v-col cols="12" class="py-0">
                  <div class="fw-bold pb-4">
                    {{ $t('appointmentProgram.section.businessHours') }}
                  </div>
                  <availability-hours :schedule.sync="schedule" :schedule-has-error.sync="scheduleHasError" />
                </v-col>
              </v-row>

              <v-row v-if="isEditMode">
                <v-col cols="12" class="d-flex justify-end pb-4">
                  <v-btn class="mr-4" data-test="appointment-program-edit-cancel" @click.stop="back()">
                    {{ $t('common.cancel') }}
                  </v-btn>
                  <v-btn
                    color="primary"
                    data-test="appointment-program-edit-save"
                    :loading="loading"
                    :disabled="failed || loading || (!changed && !scheduleIsModified) || scheduleHasError"
                    @click.stop="submit">
                    {{ $t('common.save') }}
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-divider />
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col>
              <v-row justify="center">
                <v-col cols="12" xl="8" lg="9" md="11">
                  <service-options-table :appointment-program-id="appointmentProgram.id" :service-options="appointmentProgram.serviceOptions" />
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="12" xl="8" lg="9" md="11">
                  <staff-members-table :appointment-program-id="appointmentProgram.id" />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>

        <template v-if="!isEditMode" #actions>
          <v-btn class="mr-4" data-test="appointment-program-create-cancel" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            data-test="appointment-program-create-submit"
            :loading="loading"
            :disabled="failed || loading || scheduleHasError"
            @click.stop="submit">
            {{ $t('common.buttons.create') }}
          </v-btn>
        </template>
      </rc-page-content>
    </validation-observer>
    <rationale-dialog ref="rationaleDialog" />
  </div>
</template>

<script lang="ts">
import { RcPageContent, VSelectWithValidation, VTextFieldWithValidation,
} from '@libs/component-lib/components';
import { Status, VForm } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import _cloneDeep from 'lodash/cloneDeep';
import helpers from '@/ui/helpers/helpers';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import mixins from 'vue-typed-mixins';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import { AppointmentProgram, DayOfWeek, IDaySchedule } from '@libs/entities-lib/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { canadaTimeZones } from '@/constants/canadaTimeZones';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import { NavigationGuardNext, Route } from 'vue-router';
import RationaleDialog from '@/ui/shared-components/RationaleDialog.vue';
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
    const condition = this.isEditMode && ((this.$refs.form as VForm).flags.changed || this.scheduleIsModified);
    await helpers.confirmBeforeLeaving(this, condition, next);
  },

  data() {
    return {
      appointmentProgramLoading: false,
      loading: false,
      languageMode: 'en',
      appointmentProgram: new AppointmentProgram(),
      Status,
      timeZoneOptions: canadaTimeZones,
      scheduleHasError: false,
      initialBusinessHours: null as IDaySchedule[],
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
      };
    },

    isEditMode(): boolean {
      return this.$route.name === routes.events.appointmentPrograms.edit.name;
    },

    scheduleIsModified(): boolean {
      return (this.isEditMode && JSON.stringify(this.initialBusinessHours) !== JSON.stringify(this.appointmentProgram.businessHours));
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
      } finally {
        this.appointmentProgramLoading = false;
      }
    } else {
      this.appointmentProgram.eventId = this.id;
      this.appointmentProgram.businessHours = defaultBusinessHours;
    }
  },

  watch: {
    initialAppointmentProgram(newVal) {
      this.appointmentProgram = newVal;
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
        const dialog = this.$refs.rationaleDialog as any;
        const userInput = (await dialog.open({
          title: this.$t('appointmentProgram.edit.changeStatus.rationale.title'),
          userBoxText: this.$t('appointmentProgram.edit.changeStatus.rationale.message'),
        })) as { answered: boolean, rationale: string };
        if (userInput.answered) {
          const res = await useAppointmentProgramStore().setAppointmentProgramStatus(this.appointmentProgram.id, status, userInput.rationale);
          if (res) {
            this.appointmentProgram.appointmentProgramStatus = status;
            this.$toasted.global.success(this.$t('appointmentProgram.edit.changeStatus.success'));
          } else {
            this.$toasted.global.error(this.$t('appointmentProgram.edit.changeStatus.error'));
          }
          dialog.close();
        }
      } else {
        this.appointmentProgram.appointmentProgramStatus = status;
      }
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (!isValid) {
        helpers.scrollToFirstError('scrollAnchor');
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
