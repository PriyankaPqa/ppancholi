<template>
  <v-row>
    <v-col cols="12" sm="6">
      <v-select-with-validation
        v-model="formCopy.preferredLanguage"
        :data-test="`${prefixDataTest}__preferredLanguage`"
        :items="preferredLanguagesItems"
        :rules="rules.preferredLanguage"
        :item-text="(item) => $m(item.name)"
        return-object
        :label="`${$t('registration.personal_info.preferredLanguage')}*`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-if="formCopy.preferredLanguage && formCopy.preferredLanguage.isOther"
        v-model="formCopy.preferredLanguageOther"
        :data-test="`${prefixDataTest}__preferredLanguageOther`"
        :rules="rules.preferredLanguageOther"
        :label="`${$t('registration.personal_info.preferredLanguage.other')}`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-select-with-validation
        v-model="formCopy.primarySpokenLanguage"
        :data-test="`${prefixDataTest}__primarySpokenLanguage`"
        :items="primarySpokenLanguagesItems"
        :rules="rules.primarySpokenLanguage"
        :item-text="(item) => $m(item.name)"
        return-object
        :label="$t('registration.personal_info.primarySpokenLanguage')" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-if="formCopy.primarySpokenLanguage && formCopy.primarySpokenLanguage.isOther"
        v-model="formCopy.primarySpokenLanguageOther"
        :data-test="`${prefixDataTest}__primarySpokenLanguageOther`"
        :rules="rules.primarySpokenLanguageOther"
        :label="`${$t('registration.personal_info.primarySpokenLanguage.pleaseSpecify')}*`" />
    </v-col>

    <v-col cols="12" sm="6">
      <rc-phone-with-validation
        v-model="formCopy.homePhoneNumber"
        :rules="rules.homePhoneNumber"
        outlined
        :label="homePhoneNumberLabel"
        :data-test="`${prefixDataTest}__homePhoneNumber`"
        @focusout="incrementFocusPhoneCounter()" />
    </v-col>

    <v-col cols="12" sm="6">
      <rc-phone-with-validation
        v-model="formCopy.mobilePhoneNumber"
        :rules="rules.mobilePhoneNumber"
        outlined
        :label="mobilePhoneNumberLabel"
        :data-test="`${prefixDataTest}__mobilePhoneNumber`"
        @focusout="incrementFocusPhoneCounter()" />
    </v-col>

    <v-col cols="12" sm="6">
      <rc-phone-with-validation
        v-model="formCopy.alternatePhoneNumber"
        :rules="rules.alternatePhoneNumber"
        outlined
        :label="alternatePhoneNumberLabel"
        :data-test="`${prefixDataTest}__alternatePhoneNumber`"
        @focusout="incrementFocusPhoneCounter()" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-if="formCopy.alternatePhoneNumber"
        v-model="formCopy.alternatePhoneNumber.extension"
        :data-test="`${prefixDataTest}__alternatePhoneNumberExtension`"
        :rules="rules.alternatePhoneNumberExtension"
        :label="$t('registration.personal_info.alternatePhoneNumberExtension')" />
    </v-col>

    <v-col cols="12" sm="6">
      <validation-observer ref="email">
        <template v-if="recaptchaKey">
          <vue-programmatic-invisible-google-recaptcha
            ref="recaptchaEmail"
            :sitekey="recaptchaKey"
            element-id="recaptchaEmail"
            badge-position="left"
            :show-badge-mobile="false"
            :show-badge-desktop="false"
            @recaptcha-callback="recaptchaCallBack" />
          <v-text-field-with-validation
            v-model="formCopy.email"
            :loading="emailChecking"
            :data-test="`${prefixDataTest}__email`"
            :rules="rules.email"
            :label="emailLabel"
            @blur="getTokenAndValidate($event.target.value)" />
        </template>
        <template v-else>
          <v-text-field-with-validation
            v-model="formCopy.email"
            :loading="emailChecking"
            :data-test="`${prefixDataTest}__email`"
            :rules="rules.email"
            :label="emailLabel"
            @blur="validateEmail($event.target.value)" />
        </template>
      </validation-observer>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { RcPhoneWithValidation, VSelectWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import { ValidationObserver } from 'vee-validate';
import { IOptionItemData } from '../../types';
import { MAX_LENGTH_MD } from '../../constants/validations';
import { IContactInformation, IValidateEmailResponse } from '../../entities/value-objects/contact-information';

export default Vue.extend({
  name: 'ContactInformationForm',

  components: {
    VTextFieldWithValidation,
    VSelectWithValidation,
    RcPhoneWithValidation,
  },

  props: {
    form: {
      type: Object as () => IContactInformation,
      required: true,
    },

    personId: {
      type: String,
      default: null,
    },

    prefixDataTest: {
      type: String,
      default: 'personalInfo',
    },

    preferredLanguagesItems: {
      type: Array as () => IOptionItemData[],
      required: true,
    },

    primarySpokenLanguagesItems: {
      type: Array as () => IOptionItemData[],
      required: true,
    },

    skipPhoneEmailRules: {
      type: Boolean,
      default: false,
    },

    recaptchaKey: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      formCopy: null as IContactInformation,
      focusPhoneCounter: 0,
      triggerPhoneMessage: 3,
      emailValidator: {
        isValid: true,
        messageKey: null,
      },
      emailChecking: false,
      previousEmail: '',
      recaptchaRequired: false,
      recaptchaResolved: false,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        preferredLanguage: {
          required: true,
        },
        preferredLanguageOther: {
          max: MAX_LENGTH_MD,
        },
        primarySpokenLanguageOther: {
          required: this.formCopy.primarySpokenLanguage && this.formCopy.primarySpokenLanguage.isOther,
          max: MAX_LENGTH_MD,
        },
        homePhoneNumber: this.phoneRule,
        mobilePhoneNumber: this.phoneRule,
        alternatePhoneNumber: this.phoneRule,
        alternatePhoneNumberExtension: {
          max: MAX_LENGTH_MD,
        },
        email: {
          required: this.emailRequired,
          customValidator: this.emailValidator,
        },
      };
    },

    emailLabel(): string {
      return `${this.$t('registration.personal_info.emailAddress')}${this.emailRequired ? '*' : ''}`;
    },

    homePhoneNumberLabel(): string {
      return `${this.$t('registration.personal_info.homePhoneNumber')}${this.phoneRequired ? '*' : ''}`;
    },

    mobilePhoneNumberLabel(): string {
      return `${this.$t('registration.personal_info.mobilePhoneNumber')}${this.phoneRequired ? '*' : ''}`;
    },

    alternatePhoneNumberLabel(): string {
      return `${this.$t('registration.personal_info.alternatePhoneNumber')}${this.phoneRequired ? '*' : ''}`;
    },

    hasAnyPhone(): boolean {
      return !!(this.formCopy.homePhoneNumber?.number || this.formCopy.mobilePhoneNumber?.number || this.formCopy.alternatePhoneNumber?.number);
    },

    phoneRequired(): boolean {
      if (this.skipPhoneEmailRules) {
        return false;
      }
      return (!this.hasAnyPhone && !this.formCopy.email);
    },

    emailRequired(): boolean {
      if (this.skipPhoneEmailRules) {
        return false;
      }
      return !this.hasAnyPhone;
    },

    phoneRule(): Record<string, unknown> {
      if (this.skipPhoneEmailRules) {
        return {
          phone: true,
        };
      }
      return {
        requiredPhone: (this.focusPhoneCounter >= this.triggerPhoneMessage) ? { isMissing: this.phoneRequired } : false,
        phone: true,
      };
    },

    isCRCRegistration(): boolean {
      return this.$storage.registration.getters.isCRCRegistration();
    },

    emailAlreadyExistMessage(): TranslateResult {
      const emailAlreadyExists = 'errors.the-email-provided-already-exists-in-the-system';
      if (this.isCRCRegistration) {
        return this.$t(`${emailAlreadyExists}.crc-registration`);
      }
      return this.$t(`${emailAlreadyExists}.self-registration`, { phoneNumber: this.$storage.registration.getters.event().responseDetails.assistanceNumber });
    },
  },

  watch: {
    formCopy: {
      deep: true,
      handler(form: IContactInformation) {
        this.$emit('change', form);
      },
    },
  },

  created() {
    this.formCopy = _cloneDeep(this.form);
    this.prePopulate();
  },

  methods: {
    prePopulate() {
      if (!this.formCopy.preferredLanguage) {
        this.formCopy.preferredLanguage = this.findDefault(this.preferredLanguagesItems);
      }
      if (!this.formCopy.primarySpokenLanguage) {
        this.formCopy.primarySpokenLanguage = this.findDefault(this.primarySpokenLanguagesItems);
      }
    },

    findDefault(source: IOptionItemData[]): IOptionItemData {
      return source?.find((option) => option.isDefault);
    },

    incrementFocusPhoneCounter() {
      this.focusPhoneCounter += 1;
    },

    async getTokenAndValidate(email: string) {
      if (!email) {
        this.resetEmailValidation();
      }

      if (email && email !== this.previousEmail) {
        // eslint-disable-next-line
        (this.$refs.recaptchaEmail as any).execute();
        // Display error, will be resolved automatically if no challenge to resolve
        // eslint-disable-next-line
        this.setEmailValidator({ emailIsValid: false, errors: [{ code: 'errors.need_to_resolve_challenge' } as any] });
      }
    },

    async recaptchaCallBack(token: string) {
      if (token) { // you're not a robot
        this.setEmailValidator({ emailIsValid: true, errors: [] }); // Once token is got (with or without resolving challenge), we clean the previous error
        await this.validateEmail(this.formCopy.email, token);
      }
    },

    setEmailValidator(result: IValidateEmailResponse) {
      this.emailValidator.isValid = result.emailIsValid;

      const error = result.emailIsValid ? null : result.errors[0]?.code;

      if (error === 'errors.the-email-provided-already-exists-in-the-system') {
        this.emailValidator.messageKey = this.emailAlreadyExistMessage;
      } else {
        this.emailValidator.messageKey = error;
      }
    },

    async validateEmail(email: string, recaptchaToken?: string) {
      if (!email) {
        this.resetEmailValidation();
      }

      if (email && email !== this.previousEmail) {
        this.previousEmail = email;
        this.emailChecking = true;
        let result = null;

        try {
          if (this.isCRCRegistration) {
            result = await this.$services.households.validateEmail({ emailAddress: email, personId: this.personId });
          } else {
            result = await this.$services.households.validatePublicEmail({ emailAddress: email, personId: this.personId, recaptchaToken });
          }
        } catch (e) {
          result = { emailIsValid: false, errors: e };
        } finally {
          this.emailChecking = false;
        }

        this.formCopy.emailValidatedByBackend = result.emailIsValid;
        this.setEmailValidator(result);
        (this.$refs.email as InstanceType<typeof ValidationObserver>).validate();
      }
    },

    resetEmailValidation() {
      this.setEmailValidator({
        emailIsValid: true,
        errors: [],
      });

      this.formCopy.emailValidatedByBackend = true;
    },
  },

});
</script>
