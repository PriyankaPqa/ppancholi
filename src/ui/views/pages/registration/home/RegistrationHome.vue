<template>
  <main class="flex-grow-1 landingPageContainer">
    <v-container fluid fill-height>
      <v-row justify="center">
        <v-col class="text-center">
          <h1 class="registration__title fw-bold">
            {{ $t('registration.landingpage.welcome_crc') }}
          </h1>

          <div :style="`width: 304px; margin: 8px auto 0px;`">
            <v-autocomplete-with-validation
              v-model="event"
              background-color="white"
              outlined
              :items="events"
              :loading="loading"
              :item-text="(item) => $m(item.name)"
              item-value="id"
              return-object
              :label="$t('crcregistration.landingpage.selectEvent')"
              data-test="crcRegistrationLandingPage__event" />
          </div>

          <div v-if="canRegister" class="registration__select rc-body14 pt-0">
            {{ $t('registration.landingpage.selectType') }}
          </div>
        </v-col>
      </v-row>

      <v-row class="ma-0 pa-0 justify-center" no-gutters>
        <v-col
          v-for="(tab, index) in tabs"
          :key="index"
          :ref="tab.id"
          :class="tab.id">
          <v-card
            :class="`registrationCard full-width text-left`"
            :disabled="!canRegister || !tab.active">
            <v-layout class="layout" no-gutters>
              <v-flex class="registrationCard__image__box" sm12>
                <svg class="registrationCard__image" width="80px" height="80px" viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                  <title>{{ tab.id }}</title>
                  <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g :transform="tab.svg.transform1" fill="#EE0000" fill-rule="nonzero">
                      <g transform="translate(243.000000, 115.000000)">
                        <g :transform="tab.svg.transform2">
                          <path :d="tab.svg.d" />
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>
              </v-flex>
              <v-flex class="boxContent" xs12>
                <v-card-title class="cardTitle" :data-test="`startRegistration__${tab.id}-title`">
                  {{ $t(`registration.landingpage.${tab.id}.title`) }}
                </v-card-title>

                <v-card-subtitle class="rc-body12" :data-test="`startRegistration__${tab.id}-subtitle`">
                  {{ $t(`registration.landingpage.${tab.id}.subtitle`) }}
                </v-card-subtitle>

                <div class="px-1">
                  <v-btn
                    :disabled="!canRegister || !tab.active"
                    color="primary"
                    :aria-label="$t('registration.landingpage.beginbutton')"
                    :data-test="`startRegistration__${tab.id}`"
                    @click="redirect(`${tab.id}`)">
                    {{ tab.id === 'individual' ? $t('registration.landingpage.beginbutton') : $t('registration.landingpage.beginbutton.soon') }}
                  </v-btn>
                </div>

                <div
                  v-if="event && event.responseDetails && event.responseDetails.assistanceNumber && tab.id === 'individual'"
                  class="rc-body12 grey--text pt-4"
                  data-test="registrationLandingPage__phoneNumber">
                  {{ $t('registration.landingpage.call') }}
                  <rc-phone-display :value="event.responseDetails.assistanceNumber" />
                </div>
              </v-flex>
            </v-layout>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<script lang="ts">
import Vue from 'vue';
import { IEvent } from '@/entities/event';
import { VAutocompleteWithValidation, RcPhoneDisplay } from '@rctech/component-library';
import { EEventStatus } from '@/types';

export default Vue.extend({
  name: 'RegistrationHome',
  components: {
    VAutocompleteWithValidation,
    RcPhoneDisplay,
  },
  data() {
    return {
      events: [] as Array<IEvent>,
      event: null,
      loading: false,
      individualTab: {
        id: 'individual',
        active: true,
        svg: {
          transform1: 'translate(-682.000000, -307.000000)',
          transform2: 'translate(328.000000, 164.000000)',
          // eslint-disable-next-line max-len
          d: 'M151,28 C173.09139,28 191,45.90861 191,68 C191,90.09139 173.09139,108 151,108 C128.90861,108 111,90.09139 111,68 C111,45.90861 128.90861,28 151,28 Z M151,29 C129.460895,29 112,46.4608948 112,68 C112,89.5391052 129.460895,107 151,107 C172.539105,107 190,89.5391052 190,68 C190,46.4608948 172.539105,29 151,29 Z M169,66 C174.522847,66 179,70.4771525 179,76 L179,88 L149,88 L149,76 C149,70.4771525 153.477153,66 159,66 L169,66 Z M169,68 L159,68 C154.581722,68 151,71.581722 151,76 L151,86 L177,86 L177,76 C177,71.581722 173.418278,68 169,68 Z M135,71 C139.418278,71 143,74.581722 143,79 L143,85 L121,85 L121,79 C121,74.581722 124.581722,71 129,71 L135,71 Z M135,73 L129,73 C125.686292,73 123,75.6862915 123,79 L123,83 L141,83 L141,79 C141,75.6862915 138.313708,73 135,73 Z M132,57 C135.313708,57 138,59.6862915 138,63 C138,66.3137085 135.313708,69 132,69 C128.686292,69 126,66.3137085 126,63 C126,59.6862915 128.686292,57 132,57 Z M132,59 C129.790861,59 128,60.790861 128,63 C128,65.209139 129.790861,67 132,67 C134.209139,67 136,65.209139 136,63 C136,60.790861 134.209139,59 132,59 Z M164,47 C168.418278,47 172,50.581722 172,55 C172,59.418278 168.418278,63 164,63 C159.581722,63 156,59.418278 156,55 C156,50.581722 159.581722,47 164,47 Z M164,49 C160.686292,49 158,51.6862915 158,55 C158,58.3137085 160.686292,61 164,61 C167.313708,61 170,58.3137085 170,55 C170,51.6862915 167.313708,49 164,49 Z',
        },
      },
    };
  },

  computed: {
    canRegister(): boolean {
      return !!this.event;
    },
    tabs(): Array<Record<string, unknown>> {
      return [this.individualTab];
    },
  },

  async mounted() {
    this.events = await this.$storage.event.actions.searchEvents({ filter: { Schedule: { Status: EEventStatus.Open } } });
  },
});
</script>

<style scoped lang="scss">
::v-deep .v-btn__content {
  width: 100%;
  white-space: pre-wrap;
  word-break: break-word;
}

@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .registrationCard {
    text-align: center;
    overflow: hidden;
    margin: 0px 0px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .landingPageContainer {
    background-color: var(--v-grey-lighten4);
    align-items: center;
    padding: 0px 8px 4px;
  }
  .registration__title {
    margin-top: 57px;
    font-family: $font-family;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0.25px;
    color: var(--v-grey-darken3);
  }
  .registration__select {
    font-weight: 400;
    margin-bottom: 8px;
  }
  .layout {
    width: 100%;
  }
  .registrationCard__image {
    width: 48px;
    height: 48px;
    margin: 0px;
    padding: 0px;
    transition: 0.25s;
    & .imageRed {
      fill: var(--v-secondary-base);
    }
    & .imageWhite {
      fill: var(--v-white-base) !important;
    }
  }
  .registrationCard__image__box {
    width: 72px;
    margin: 0px;
    padding: 8px 8px 0px 8px;
     transition: 0.4s;
    & .red {
      background: var(--v-secondary-base);
    }
    & .white {
      background: var(--v-white-base);
    }
  }
  .boxContent {
    margin: 0px;
    padding: 16px 0px 16px 16px;
  }
  .v-card__title{
    margin: 0px;
    padding: 0px 4px 0px 4px;
    word-break: break-word;
    font-weight: 700;
  }
  .v-card__subtitle{
    margin: 0px;
    padding: 0px 4px 16px 4px;
    word-break: break-word;
  }
}
@media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-sm-max) {
  .registrationCard {
    text-align: center;
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .landingPageContainer {
    background-color: var(--v-grey-lighten4);
    display: flex;
    align-items: center;
    padding: 0px 66px 68px;
  }
  .registration__title {
    margin-top: 124px;
    padding-bottom: 8px;
    font-family: $font-family;
    font-size: 18px;
    line-height: 28px;
    letter-spacing: 0.4px;
    color: var(--v-grey-darken3);
  }
  .registration__select {
    font-weight: 700;
    margin-bottom: 4px;
  }
  .layout {
    display: table-row;
    text-align: center;
    width: 100%;
  }
  .registrationCard__image {
    width: 78px;
    height: 78px;
    margin: 0px;
    padding: 0px;
    transition: 0.25s;
    & .imageRed {
      fill: var(--v-secondary-base);
    }
    & .imageWhite {
      fill: var(--v-white-base) !important;
    }
  }
  .registrationCard__image__box {
    height: 136px;
    padding: 29px 0px;
    transition: 0.4s;
    & .red {
      background: var(--v-secondary-base);
    }
    & .white {
      background: var(--v-white-base);
    }
  }
  .boxContent {
    margin: 0px;
    padding: 16px 0px 40px;
  }
  .v-card__title{
    margin: 0px;
    padding: 0px;
    word-break: break-word;
    justify-content: center;
    font-family: $font-family;
    font-size: 20px;
    line-height: 30px;
    font-weight: 500;
    color: var(--v-grey-darken4);
  }
  .v-card__subtitle{
    margin: 0px;
    padding: 0px 0px 32px;
    word-break: break-word;
  }
}
@media only screen and (min-width: $breakpoint-md-min) and (max-width: $breakpoint-md-max) {
  .registrationCard {
    text-align: center;
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .landingPageContainer {
    background-color: var(--v-grey-lighten4);
    display: flex;
    align-items: center;
    padding: 0px 66px 68px;
  }
  .registration__title {
    margin-top: 124px;
    padding-bottom: 8px;
    font-family: $font-family;
    font-size: 18px;
    line-height: 28px;
    letter-spacing: 0.4px;
    color: var(--v-grey-darken3);
  }
  .registration__select {
    font-weight: 700;
    margin-bottom: 4px;
  }
  .layout {
    display: table-row;
    text-align: center;
    width: 100%;
  }
  .registrationCard__image {
    width: 78px;
    height: 78px;
    margin: 0px;
    padding: 0px;
    transition: 0.25s;
    & .imageRed {
      fill: var(--v-secondary-base);
    }
    & .imageWhite {
      fill: var(--v-white-base) !important;
    }
  }
  .registrationCard__image__box {
    height: 136px;
    padding: 29px 0px;
    transition: 0.4s;
    & .red {
      background: var(--v-secondary-base);
    }
    & .white {
      background: var(--v-white-base);
    }
  }
  .boxContent {
    margin: 0px;
    padding: 16px 0px 40px;
  }
  .v-card__title{
    margin: 0px;
    padding: 0px;
    word-break: break-word;
    justify-content: center;
    font-family: $font-family;
    font-size: 20px;
    line-height: 30px;
    font-weight: 500;
    color: var(--v-grey-darken4);
  }
  .v-card__subtitle{
    margin: 0px;
    padding: 0px 0px 32px;
    word-break: break-word;
  }
}
@media only screen and (min-width: $breakpoint-lg-min) {
  .registrationCard {
    text-align: center;
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .landingPageContainer {
    background-color: var(--v-grey-lighten4);
    display: flex;
    align-items: center;
    padding: 0px 191px 83px;
  }
  .registration__title {
    margin-top: 140px;
    padding-bottom: 8px;
    font-family: $font-family;
    font-size: 18px;
    line-height: 28px;
    letter-spacing: 0.4px;
    color: var(--v-grey-darken3);
  }
  .registration__select {
    font-weight: 700;
    margin-bottom: 12px;
  }
  .layout {
    display: table-row;
    text-align: center;
    width: 100%;
  }
  .registrationCard__image {
    width: 78px;
    height: 78px;
    margin: 0px;
    padding: 0px;
    transition: 0.25s;
    & .imageRed {
      fill: var(--v-secondary-base);
    }
    & .imageWhite {
      fill: var(--v-white-base) !important;
    }
  }
  .registrationCard__image__box {
    height: 136px;
    padding: 29px 0px;
    transition: 0.4s;
    & .red {
      background: var(--v-secondary-base);
    }
    & .white {
      background: var(--v-white-base);
    }
  }
  .boxContent {
    margin: 0px;
    padding: 40px 0px 36px;
  }
  .v-card__title{
    margin: 0px;
    padding: 0px;
    word-break: break-word;
    justify-content: center;
    font-family: $font-family;
    font-size: 24px;
    line-height: 36px;
    font-weight: 500;
    color: var(--v-grey-darken4);
  }
  .v-card__subtitle{
    margin: 0px;
    padding: 0px 0px 58px;
    word-break: break-word;
  }
}
</style>
