<template>
  <v-container>
    <ValidationObserver ref="form">
      <v-row justify="center">
        <v-col cols="12" xl="8" lg="9" md="11" sm="12">
          <language-tabs :language="languageMode" @click="setLanguageMode" />

          <v-row>
            <v-col cols="8">
              <v-text-field-with-validation
                v-model="localEvent.name.translation[languageMode]"
                data-test="event-name"
                :label="`${$t('event.event_name')} *`"
                :hint="$t('event.event_name.hint')"
                persistent-hint
                :rules="rules.name"
                :disabled="inputDisabled"
                @input="resetAsUnique()" />
            </v-col>

            <v-col cols="4">
              <v-select-with-validation
                v-model="localEvent.responseDetails.responseLevel"
                data-test="event-level"
                attach
                :label="`${$t('event.response_level')} *`"
                :items="responseLevels"
                :disabled="inputDisabled"
                :rules="rules.responseDetails.responseLevel" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" md="6" sm="12">
              <v-select-with-validation
                v-model="localEvent.location.province"
                data-test="event-province"
                attach
                :label="`${$t('event.province')} *`"
                :items="canadianProvinces"
                :rules="rules.location.province"
                :disabled="inputDisabled"
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
                :disabled="inputDisabled"
                :item-text="(item) => item.name.translation[languageMode]" />
            </v-col>

            <v-col cols="6" md="6" sm="12">
              <rc-autosuggest
                v-model="region"
                :items="regionsSorted"
                data-test="event-region"
                attach="event-region"
                :label="$t('event.region')"
                :disabled="!localEvent.location.province || inputDisabled"
                :rules="rules.location.region"
                :item-text="(item) => item.name.translation[languageMode]" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" md="6" sm="12">
              <v-select-with-validation
                v-model="eventType"
                data-test="event-type"
                attach
                :label="`${$t('event.type')} *`"
                :items="eventTypesSorted"
                :item-text="(item) => $m(item.name)"
                return-object
                :rules="rules.responseDetails.eventType"
                :disabled="inputDisabled"
                @change="localEvent.responseDetails.eventType.optionItemId = $event.id" />
            </v-col>

            <v-col v-if="eventType && eventType.isOther" cols="6" md="6" sm="12">
              <v-text-field-with-validation
                v-model="localEvent.responseDetails.eventType.specifiedOther"
                data-test="event-type-specified-other"
                autocomplete="nope"
                :label="`${$t('common.pleaseSpecify')} *`"
                :disabled="inputDisabled"
                :rules="rules.responseDetails.eventTypeOther" />
            </v-col>

            <v-col cols="6" md="6" sm="12">
              <ValidationProvider v-slot="{ errors }" :rules="rules.responseDetails.assistanceNumber">
                <rc-phone
                  :value="assistanceNumber"
                  outlined
                  :label="`${$t('event.number')} *`"
                  :error-messages="errors"
                  data-test="event-phone"
                  :disabled="inputDisabled"
                  @input="setAssistanceNumber" />
              </ValidationProvider>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" md="6" sm="12">
              <v-date-field-with-validation
                v-model="localEvent.responseDetails.dateReported"
                :data-test="'event-reported-date'"
                readonly
                :rules="rules.responseDetails.dateReported"
                :label="`${$t('event.date_reported')} *`"
                :disabled="inputDisabled"
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
                    <span v-if="isStatusOpen">{{ $t('event.start_on_a_date',) }} {{ getStringDate(event.schedule.scheduledOpenDate, 'll') }}</span>
                  </div>

                  <v-switch
                    v-model="isStatusOpen"
                    data-test="event-switch-status"
                    class="pt-0 mt-0"
                    hide-details
                    color="white"
                    :disabled="inputDisabled"
                    flat />
                </div>

                <div class="mt-4">
                  <v-text-field-with-validation
                    v-if="showReOpenInput"
                    v-model="localEvent.schedule.updateReason"
                    data-test="reopen-reason"
                    background-color="white"
                    autocomplete="nope"
                    :label="`${$t('event.reOpenReason')} *`"
                    :disabled="inputDisabled"
                    :rules="rules.schedule.reOpenReason" />
                </div>

                <!-- <v-row>
                  <v-col cols="6" lg="5" md="5" class="pl-0 pt-0">
                    <v-col>
                      <p class="rc-body16 fw-bold">
                        {{ $t('event.schedule_open_date') }}
                      </p>

                      <v-date-field-with-validation
                        v-model="localEvent.schedule.scheduledOpenDate"
                        :close-on-content-click="false"
                        :data-test="'event-start-date'"
                        :rules="rules.schedule.scheduledOpenDate"
                        :disabled="isStatusOpen || (isEditMode && localEvent.schedule.hasBeenOpen) || inputDisabled"
                        prepend-inner-icon="timer"
                        :label="`${$t('event.select_date')}`"
                        :placeholder="$t('event.select_date')"
                        :min="today" />
                    </v-col>
                  </v-col>

                  <v-col cols="6" lg="5" md="5" class="pt-0">
                    <v-col>
                      <p class="fw-bold">
                        {{ $t('event.schedule_close_date') }}
                      </p>

                      <v-date-field-with-validation
                        v-model="localEvent.schedule.scheduledCloseDate"
                        :close-on-content-click="false"
                        :data-test="'event-end-date'"
                        :rules="rules.schedule.scheduledCloseDate"
                        prepend-inner-icon="timer"
                        :placeholder="$t('event.select_date')"
                        :label="`${$t('event.select_date')}`"
                        :min="localEvent.schedule.scheduledOpenDate"
                        :disabled="inputDisabled"
                        :picker-date="localEvent.schedule.scheduledOpenDate" />
                    </v-col>
                  </v-col>
                </v-row> -->
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
                    <span>{{ $t('eventSummary.copyLinkTooltip') }}</span>
                  </v-tooltip>
                </div>
                <v-row>
                  <v-col cols="12" xl="12" lg="12">
                    <v-text-field
                      :value="registrationLink"
                      background-color="white"
                      readonly
                      outlined
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
                :value="relatedEventIds"
                data-test="event-related-events"
                item-value="id"
                :item-text="(item) => $m(item.name)"
                :label="$t('event.create.related_events.label')"
                :items="relatedEventsSorted"
                :attach="true"
                multiple
                hide-details
                :disabled="inputDisabled"
                @change="setRelatedEvents($event)"
                @delete="setRelatedEvents($event)" />
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
} from '@crctech/component-library';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import helpers from '@/ui/helpers';
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import {
  ECanadaProvinces,
} from '@/types';
import {
  Event, IEvent, IOtherProvince, IRegion, EResponseLevel, EEventStatus,
} from '@/entities/event';
import moment from '@/ui/plugins/moment';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';
import { TOOLTIP_DELAY } from '@/ui/constants';
import _cloneDeep from 'lodash/cloneDeep';
import { IOptionItem } from '@/entities/optionItem';
import utils from '@/entities/utils';
import { localStorageKeys } from '@/constants/localStorage';

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

    isNameUnique: {
      type: Boolean,
      required: true,
    },

    isDirty: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    const getStringDate = (date: Date| string, format = 'YYYY-MM-DD'): string => moment(date).utc().format(format);

    const localEvent = _cloneDeep(this.event);

    const assistanceNumber = {
      number: '',
      countryISO2: '',
      e164Number: '',
    };

    if (this.isEditMode) {
      localEvent.responseDetails.dateReported = getStringDate(localEvent.responseDetails.dateReported);

      if (localEvent.schedule.scheduledOpenDate) {
        localEvent.schedule.scheduledOpenDate = getStringDate(localEvent.schedule.scheduledOpenDate);
      }

      if (localEvent.schedule.scheduledCloseDate) {
        localEvent.schedule.scheduledCloseDate = getStringDate(localEvent.schedule.scheduledCloseDate);
      }

      if (localEvent && localEvent.responseDetails.assistanceNumber) {
        assistanceNumber.number = localEvent.responseDetails.assistanceNumber;
      }
    }

    return {
      localEvent,
      assistanceNumber,
      eventType: null,
      initialEventType: null,
      languageMode: 'en',
      otherProvinces: [],
      regions: [],
      TOOLTIP_DELAY,
      initialStatus: localEvent.schedule.status,
      initialOpenDate: localEvent.schedule.scheduledOpenDate,
      initialCloseDate: localEvent.schedule.scheduledCloseDate,
      getStringDate,
    };
  },

  computed: {
    inputDisabled(): boolean {
      return !this.$hasLevel('level6');
    },

    isStatusOpen: {
      get(): boolean {
        return this.localEvent.schedule.status === EEventStatus.Open;
      },

      set(isOpen: boolean): void {
        this.localEvent.schedule.status = isOpen ? EEventStatus.Open : EEventStatus.OnHold;

        if (this.isEditMode) {
          this.localEvent.schedule.scheduledOpenDate = isOpen ? this.today : this.initialOpenDate;
          if (!isOpen) {
            this.localEvent.schedule.scheduledCloseDate = this.initialCloseDate;
          }
        } else {
          this.localEvent.schedule.scheduledOpenDate = isOpen ? this.today : null;
          if (!isOpen) {
            this.localEvent.schedule.scheduledCloseDate = null;
          }
        }

        this.$emit('update:is-dirty', true);
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
      return helpers.enumToTranslatedCollection(EResponseLevel, 'event.response_level');
    },

    eventTypesSorted(): Array<IOptionItem> {
      const eventTypes = this.$storage.event.getters.eventTypes();

      if (eventTypes && eventTypes.length && this.initialEventType) {
        const initialActiveEventType = eventTypes.find((e: IOptionItem) => e.id === this.initialEventType.id);

        if (!initialActiveEventType) {
          return [
            ...eventTypes,
            this.initialEventType,
          ];
        }
      }

      return eventTypes;
    },

    relatedEventIds(): Array<string> {
      return this.localEvent.relatedEventsInfos.map((el) => el.id);
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
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
        },
        responseDetails: {
          responseLevel: {
            required: true,
          },
          eventType: {
            required: true,
          },
          eventTypeOther: {
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
          reOpenReason: {
            required: true,
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
      if (this.isStatusOpen) return 'status_success white--text';
      return 'status_green_pale black--text';
    },

    prefixRegistrationLink(): string {
      const prefix = localStorage.getItem(localStorageKeys.prefixRegistrationLink.name);
      return `${prefix}/${this.languageMode}/registration/`;
    },

    registrationLink(): string {
      if (this.isEditMode) {
        return this.localEvent.registrationLink.translation[this.languageMode];
      }

      const link = libHelpers.encodeUrl(this.localEvent.name.translation[this.languageMode]);

      return link;
    },

    showReOpenInput(): boolean {
      return this.isEditMode
        && this.initialStatus === EEventStatus.OnHold
        && this.localEvent.schedule.status === EEventStatus.Open
        && this.localEvent.hasBeenOpen;
    },

    today(): string { return this.getStringDate(new Date()); },
  },

  watch: {
    localEvent: {
      handler(newEvent) {
        this.$emit('update:event', newEvent);
      },
      deep: true,
    },

    eventType() {
      if (!this.eventType || !this.eventType.isOther) {
        this.localEvent.responseDetails.eventType.specifiedOther = '';
      }
    },
  },

  async mounted() {
    if (!this.isEditMode) {
      this.localEvent.responseDetails.dateReported = this.today;
    }

    await this.$storage.event.actions.fetchEventTypes();
    await this.$storage.event.actions.fetchEvents();

    const provincesRes = await this.$storage.event.actions.fetchOtherProvinces();
    const regionsRes = await this.$storage.event.actions.fetchRegions();

    this.otherProvinces = provincesRes.value;
    this.regions = regionsRes.value;

    if (this.localEvent && this.localEvent.responseDetails.eventType.optionItemId) {
      const activeEventType = this.eventTypesSorted.find((e) => e.id === this.localEvent.responseDetails.eventType.optionItemId);

      if (activeEventType) {
        this.eventType = activeEventType;
      } else {
        this.eventType = {
          id: this.localEvent.eventTypeId,
          name: this.localEvent.eventTypeName,
        };

        this.initialEventType = { ...this.eventType };
      }
    }

    // Set the default event type
    if (!this.isEditMode) {
      const defaultEventType = this.eventTypesSorted.find((t) => t.isDefault);

      if (defaultEventType) {
        this.localEvent.responseDetails.eventType.optionItemId = defaultEventType.id;
        this.eventType = defaultEventType;
      }
    }
  },

  methods: {
    copyRegistrationLink() {
      helpers.copyToClipBoard(`${this.prefixRegistrationLink}${this.registrationLink}`);
      this.$toasted.global.success(this.$t('eventSummary.copyLinkSuccessful'));
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.localEvent.fillEmptyMultilingualAttributes();
    },

    setAssistanceNumber(p: {number: string; countryISO2: string; e164Number: string}) {
      this.assistanceNumber = p;
      this.localEvent.responseDetails.assistanceNumber = p.e164Number;
    },

    setRelatedEvents(eventsIds: Array<string>) {
      this.localEvent.relatedEventsInfos = eventsIds.map((id) => {
        const event = this.relatedEventsSorted.find((ev) => ev.id === id);
        if (event) {
          return {
            id,
            eventName: event.name,
          };
        }
        return null;
      });
      this.$emit('update:is-dirty', true);
    },

    clearRegionAndOtherProvince() {
      this.localEvent.location.provinceOther = utils.initMultilingualAttributes();
      this.localEvent.location.region = utils.initMultilingualAttributes();
    },

    resetAsUnique() {
      if (!this.isNameUnique) {
        this.$emit('update:is-name-unique', true);
      }
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
