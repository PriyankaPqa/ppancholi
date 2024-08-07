<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
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
              <v-col class="d-flex ma-0 pa-0 align-center" cols="10">
                <status-select
                  data-test="appointment-program-status"
                  :value="appointmentProgram.appointmentProgramStatus"
                  :statuses="[AppointmentProgramStatus.Active, AppointmentProgramStatus.Inactive]"
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
                  :rules="rules.timeZone"
                  @input="resetAsUnique()" />
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

            <v-row>
              <v-col cols="12">
                <service-options-table :appointment-program-id="appointmentProgram.id" />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <staff-members-table :appointment-program-id="appointmentProgram.id" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>

      <template #actions>
        <v-btn class="mr-4" data-test="cancel" @click.stop="back()">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          data-test="save"
          :loading="loading"
          :disabled="failed || loading || (isEditMode && !dirty) || scheduleHasError"
          @click.stop="submit">
          {{ submitLabel }}
        </v-btn>
      </template>
    </rc-page-content>
  </validation-observer>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { RcPageContent, VSelectWithValidation, VTextFieldWithValidation,
} from '@libs/component-lib/components';
import { VForm } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import mixins from 'vue-typed-mixins';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import entityUtils from '@libs/entities-lib/utils';
import { AppointmentProgram, AppointmentProgramStatus, DayOfWeek, IDaySchedule } from '@libs/entities-lib/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { canadaTimeZones } from '@/constants/canadaTimeZones';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
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

  data() {
    return {
      appointmentProgramLoading: false,
      loading: false,
      languageMode: 'en',
      appointmentProgram: new AppointmentProgram(),
      AppointmentProgramStatus,
      timeZoneOptions: canadaTimeZones,
      scheduleHasError: false,
    };
  },

  computed: {
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

    submitLabel(): TranslateResult {
      return this.isEditMode
        ? this.$t('common.save')
        : this.$t('common.buttons.create');
    },

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
      } finally {
        this.appointmentProgramLoading = false;
      }
    } else {
      this.appointmentProgram.businessHours = defaultBusinessHours;
    }
  },

  methods: {
    back(): void {
      this.$router.back();
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.appointmentProgram.name = entityUtils.getFilledMultilingualField(this.appointmentProgram.name);
    },

    onStatusChange(status: AppointmentProgramStatus) {
      if (!this.isEditMode) {
        this.appointmentProgram.appointmentProgramStatus = status;
      }
    },

    async createAppointmentProgram() {
      this.appointmentProgram.eventId = this.id;
      const newProgram = await useAppointmentProgramStore().createAppointmentProgram(this.appointmentProgram);
      if (newProgram) {
        this.$toasted.global.success(this.$t('event.appointmentProgram.created'));
        this.$router.replace({ name: routes.events.appointmentPrograms.details.name, params: { appointmentProgramId: newProgram.id } });
      } else {
        this.$toasted.global.error(this.$t('event.appointmentProgram.create.failed'));
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
        if (!this.isEditMode) {
          await this.createAppointmentProgram();
        } else {
          // edit program
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
