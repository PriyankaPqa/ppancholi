<template>
  <v-container>
    <ValidationObserver ref="form">
      <v-row class="justify-center">
        <v-col cols="12" xl="8" lg="9" md="11" sm="12">
          <language-tabs :language="languageMode" @click="setLanguageMode" />

          <v-row>
            <v-col cols="8">
              <v-text-field-with-validation
                v-model="localEvent.name.translation[languageMode]"
                data-test="event-name"
                autocomplete="nope"
                :label="`${$t('event.event_name')} *`"
                :hint="$t('event.event_name.hint')"
                persistent-hint
                :rules="rules.name" />
            </v-col>

            <v-col cols="4">
              <v-select-with-validation
                v-model="localEvent.responseDetails.responseLevel"
                data-test="event-level"
                attach
                :label="`${$t('event.response_level')} *`"
                :items="responseLevels"
                :rules="rules.responseDetails.responseLevel" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" md="6" sm="12">
              <v-select-with-validation
                v-model="localEvent.location.province"
                data-test="event-province"
                :disabled="isEditMode"
                attach
                :label="`${$t('event.province')} *`"
                :items="canadianProvinces"
                :rules="rules.location.province"
                @input="clearRegionAndOtherProvince" />
            </v-col>

            <v-col v-if="otherProvinceSelected" cols="6" md="6" sm="12">
              <rc-autosuggest
                v-model="provinceOther"
                :items="otherProvincesSorted"
                data-test="event-province-other"
                attach="event-province-other"
                :label="`${$t('event.other')} *`"
                :rules="rules.location.provinceOther"
                :item-text="(item) => item.name.translation[languageMode]" />
            </v-col>

            <v-col cols="6" md="6" sm="12">
              <rc-autosuggest
                v-model="region"
                :items="regionsSorted"
                data-test="event-region"
                attach="event-region"
                :label="$t('event.region')"
                :disabled="!localEvent.location.province"
                :rules="rules.location.region"
                :item-text="(item) => item.name.translation[languageMode]" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" md="6" sm="12">
              <v-select-with-validation
                v-model="localEvent.responseDetails.eventType"
                data-test="event-type"
                :disabled="isEditMode"
                attach
                :label="`${$t('event.type')} *`"
                :items="eventTypesSorted"
                :item-text="(item) => $m(item.name)"
                item-value="id"
                :rules="rules.responseDetails.eventType" />
            </v-col>

            <v-col cols="6" md="6" sm="12">
              <ValidationProvider v-slot="{ errors }" :rules="rules.responseDetails.assistanceNumber">
                <rc-phone
                  :value="assistanceNumber"
                  :disabled="isEditMode"
                  outlined
                  :label="`${$t('event.number')} *`"
                  :error-messages="errors"
                  data-test="event-phone"
                  @input="setAssistanceNumber" />
              </ValidationProvider>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" md="6" sm="12">
              <v-date-field-with-validation
                v-model="localEvent.responseDetails.dateReported"
                :data-test="'event-reported-date'"
                :rules="rules.responseDetails.dateReported"
                :disabled="isEditMode"
                :label="`${$t('event.date_reported')} *`"
                :max="today" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <div class="grey-container py-4 px-8">
                <p class="rc-body16 fw-bold">
                  {{ $t('event.status') }}
                </p>

                <div :class="['event_status mb-0', statusColor]">
                  <div>
                    <span class="fw-medium text-uppercase mr-2">{{ isStatusOpen ? $t('event.status.open') : $t('event.status.on_hold') }}</span>
                    <span v-if="isStatusOpen">{{ $t('event.start_on_a_date',) }} {{ event.schedule.scheduledOpenDate }}</span>
                  </div>

                  <v-switch
                    v-model="isStatusOpen"
                    :disabled="isEditMode"
                    data-test="event-switch-status"
                    class="pt-0 mt-0"
                    hide-details
                    color="white"
                    flat />
                </div>

                <v-row>
                  <v-col cols="6" lg="5" md="5" class="pl-0">
                    <v-col>
                      <p class="rc-body16 fw-bold">
                        {{ $t('event.schedule_open_date') }}
                      </p>

                      <v-date-field-with-validation
                        v-model="localEvent.schedule.scheduledOpenDate"
                        :close-on-content-click="false"
                        :data-test="'event-start-date'"
                        :rules="rules.schedule.scheduledOpenDate"
                        :disabled="isStatusOpen || isEditMode"
                        prepend-inner-icon="timer"
                        :readonly="!isEditMode"
                        :clearable="true"
                        :label="`${$t('event.select_date')}`"
                        :placeholder="$t('event.select_date')"
                        :min="today" />
                    </v-col>
                  </v-col>

                  <v-col cols="6" lg="5" md="5">
                    <v-col>
                      <p class="fw-bold">
                        {{ $t('event.schedule_close_date') }}
                      </p>

                      <v-date-field-with-validation
                        v-model="localEvent.schedule.scheduledCloseDate"
                        :close-on-content-click="false"
                        :data-test="'event-end-date'"
                        :rules="rules.schedule.scheduledCloseDate"
                        :disabled="isEditMode"
                        prepend-inner-icon="timer"
                        :readonly="!isEditMode"
                        :clearable="true"
                        :placeholder="$t('event.select_date')"
                        :label="`${$t('event.select_date')}`"
                        :min="event.schedule.scheduledOpenDate"
                        :picker-date="event.schedule.scheduledOpenDate"
                        @click:clear="()=> {localEvent.schedule.scheduledCloseDate = ''}" />
                    </v-col>
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <div class="grey-container py-4 px-8">
                <div class="registration__link">
                  <div class="rc-body16 fw-bold">
                    {{ $t('event.registration_link') }}
                  </div>

                  <v-tooltip :open-delay="TOOLTIP_DELAY" bottom>
                    <template #activator="{ on }">
                      <v-btn data-test="copy-link-btn" icon bottom v-on="on" @click="copyRegistrationLink">
                        <v-icon size="24" color="grey darken-2">
                          mdi-content-copy
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('dashboard.eventSummary.copyLinkTooltip') }}</span>
                  </v-tooltip>
                </div>
                <v-row>
                  <v-col cols="12" xl="12" lg="12">
                    <v-text-field
                      :value="registrationLink"
                      readonly
                      data-test="event-registration-path"
                      :prefix="prefixRegistrationLink"
                      :label="`${$t('event.registration_link')}`" />
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-autocomplete-with-validation
                v-model="localEvent.relatedEvents"
                data-test="event-related-events"
                item-value="id"
                :item-text="(item) => $m(item.name)"
                :label="$t('event.create.related_events.label')"
                :items="relatedEventsSorted"
                multiple
                hide-details />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-area-with-validation
                v-model="localEvent.description.translation[languageMode]"
                data-test="event-description"
                full-width
                :label="$t('event.description')"
                :rules="rules.description" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </ValidationObserver>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  VSelectWithValidation,
  VTextFieldWithValidation,
  VDateFieldWithValidation,
  VAutocompleteWithValidation,
  VTextAreaWithValidation,
  RcPhone,
  RcAutosuggest,
} from '@rctech/component-library';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import helpers from '@/ui/helpers';
import {
  ECanadaProvinces, EEventResponseLevels, EEventStatus,
} from '@/types';
import {
  Event, IEvent, IOtherProvince, IRegion,
} from '@/entities/event';
import moment from '@/ui/plugins/moment';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';
import { TOOLTIP_DELAY } from '@/ui/constants';
import _cloneDeep from 'lodash/cloneDeep';
import { IEventType } from '@/entities/eventType';
import utils from '@/entities/utils';

export default Vue.extend({
  name: 'EventForm',

  components: {
    LanguageTabs,
    VSelectWithValidation,
    VTextFieldWithValidation,
    VDateFieldWithValidation,
    VAutocompleteWithValidation,
    VTextAreaWithValidation,
    RcPhone,
    RcAutosuggest,
  },

  props: {
    isEditMode: {
      type: Boolean,
      required: true,
    },

    event: {
      type: Event,
      required: true,
    },
  },

  data() {
    return {
      localEvent: _cloneDeep(this.event),
      assistanceNumber: {
        number: '',
        countryISO2: '',
        e164Number: '',
      },
      languageMode: 'en',
      prefixRegistrationLink: process.env.VUE_APP_EVENT_LINK_PREFIX,
      otherProvinces: [],
      regions: [],
      TOOLTIP_DELAY,
    };
  },

  computed: {
    isStatusOpen: {
      get(): boolean {
        return this.localEvent.schedule.status === EEventStatus.Open;
      },

      set(isOpen: boolean): void {
        this.localEvent.schedule.status = isOpen ? EEventStatus.Open : EEventStatus.OnHold;
        this.localEvent.schedule.scheduledOpenDate = isOpen ? this.today : null;
        if (!isOpen) {
          this.localEvent.schedule.scheduledCloseDate = null;
        }
      },
    },

    otherProvinceSelected(): boolean {
      return this.localEvent?.location?.province === ECanadaProvinces.OT;
    },

    provinceOther: {
      get(): string {
        return this.localEvent.location.provinceOther.translation[this.languageMode];
      },

      set(value: string | IOtherProvince) {
        if (typeof value === 'string') {
          this.localEvent.location.provinceOther.translation[this.languageMode] = value;
        } else {
          this.localEvent.location.provinceOther.translation = { ...value.name.translation };
        }
      },
    },

    otherProvincesSorted(): Array<IOtherProvince> {
      return helpers.sortMultilingualArray(this.otherProvinces, 'name');
    },

    region: {
      get(): string {
        return this.localEvent.location.region.translation[this.languageMode];
      },

      set(value: string | IRegion) {
        if (typeof value === 'string') {
          this.localEvent.location.region.translation[this.languageMode] = value;
        } else {
          this.localEvent.location.region.translation = { ...value.name.translation };
        }
      },
    },

    regionsSorted(): Array<IRegion> {
      if (!this.localEvent.location.province) {
        return [];
      }

      const sorted = helpers.sortMultilingualArray(this.regions, 'name');
      const filtered = sorted.filter((i) => i.province === this.localEvent.location.province);

      return filtered;
    },

    canadianProvinces(): Record<string, unknown>[] {
      const provinces = helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
      const index = provinces.findIndex((e) => e.value === ECanadaProvinces.OT);

      // Put the "Other" option at the bottom of the list
      return [
        ...provinces.slice(0, index),
        ...provinces.slice(index + 1),
        provinces[index],
      ];
    },

    responseLevels(): Record<string, unknown>[] {
      return helpers.enumToTranslatedCollection(EEventResponseLevels, 'event.response_level');
    },

    eventTypesSorted(): Array<IEventType> {
      return this.$storage.event.getters.eventTypes();
    },

    relatedEventsSorted(): Array<IEvent> {
      return this.$storage.event.getters.events();
    },

    rules(): Record<string, unknown> {
      return {
        location: {
          province: {
            required: true,
          },
          provinceOther: {
            required: true,
            max: MAX_LENGTH_MD,
          },
          region: {
            max: MAX_LENGTH_MD,
          },
        },
        name: {
          regex: /^[a-zA-Z0-9À-ÖÜ-öÜ-ÿ'\-_ ]*$/,
          required: true,
          max: MAX_LENGTH_MD,
        },
        responseDetails: {
          responseLevel: {
            required: true,
          },
          eventType: {
            required: true,
          },
          assistanceNumber: {
            phoneRequired: true,
            phone: true,
          },
          dateReported: {
            required: true,
            mustBeBeforeOrSame: { X: this.event.responseDetails.dateReported, Y: this.today },
          },
        },
        schedule: {
          scheduledOpenDate: {
            ...this.scheduledOpenDateRule,
          },
          scheduledCloseDate: {
            ...this.scheduledCloseDateRule,
          },
        },
        description: {
          max: MAX_LENGTH_LG,
        },
      };
    },

    scheduledOpenDateRule(): Record<string, unknown> {
      if (this.localEvent.schedule.scheduledOpenDate && this.localEvent.schedule.scheduledCloseDate) {
        return {
          mustBeBeforeOrSame: { X: this.localEvent.schedule.scheduledOpenDate, Y: this.localEvent.schedule.scheduledCloseDate },
        };
      }
      return null;
    },

    scheduledCloseDateRule(): Record<string, unknown> {
      if (this.localEvent.schedule.scheduledOpenDate && this.localEvent.schedule.scheduledCloseDate) {
        return {
          mustBeAfterOrSame: { X: this.localEvent.schedule.scheduledCloseDate, Y: this.localEvent.schedule.scheduledOpenDate },
        };
      }
      return null;
    },

    statusColor(): string {
      if (this.isEditMode) return 'grey darken-2 white--text';
      if (this.isStatusOpen) return 'status_success white--text';
      return 'status_green_pale black--text';
    },

    registrationLink(): string {
      return this.localEvent.name.translation[this.languageMode].toLowerCase().split(' ').join('-');
    },

    today(): string { return moment(new Date()).format('YYYY-MM-DD'); },
  },

  watch: {
    localEvent: {
      handler(newEvent) {
        this.$emit('update:event', newEvent);
      },
      deep: true,
    },
  },

  async mounted() {
    if (!this.localEvent.responseDetails.dateReported) {
      this.localEvent.responseDetails.dateReported = this.today;
    }

    await this.$storage.event.actions.fetchEventTypes();
    await this.$storage.event.actions.fetchEvents();

    this.otherProvinces = await this.$storage.event.actions.fetchOtherProvinces();
    this.regions = await this.$storage.event.actions.fetchRegions();
  },

  methods: {
    copyRegistrationLink() {
      helpers.copyToClipBoard(`${this.prefixRegistrationLink}${this.registrationLink}`);
      this.$toasted.global.success(this.$t('dashboard.eventSummary.copyLinkSuccessful'));
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.localEvent.fillEmptyMultilingualAttributes();
    },

    setAssistanceNumber(p: {number: string; countryISO2: string; e164Number: string}) {
      this.assistanceNumber = p;
      this.localEvent.responseDetails.assistanceNumber = p.e164Number;
    },

    clearRegionAndOtherProvince() {
      this.localEvent.location.provinceOther = utils.initMultilingualAttributes();
      this.localEvent.location.region = utils.initMultilingualAttributes();
    },
  },
});
</script>

<style scoped lang="scss">
.registration__link {
  display: flex;
  align-items: center;
  width: 100%;

  & > div {
    flex-grow: 2;
  }
}

.event_status {
  display: flex;
  align-items: center;
  padding: 10px;
  justify-content: space-between;
  margin-bottom: 20px;
  border-radius: 7px;
}
</style>
