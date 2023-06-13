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

    <validation-observer ref="contactInfo" v-slot="{ failed }" tag="div" class="row px-3">
      <v-col cols="12" class="pb-1 d-flex flex-column">
        <div class="rc-body16 fw-bold">
          {{ $t('registration.personal_info.contact_methods') }}
        </div>
        <div
          v-if="!isCRCRegistration"
          :class="[failed ? 'invalidClass' : 'validClass', 'rc-body14']">
          <v-icon size="16" :class="[failed ? 'invalidClass' : 'validClass']">
            mdi-information
          </v-icon>
          {{ $t('registration.personal_info.enter_contact_info_msg') }}
        </div>
      </v-col>

      <v-col cols="12" sm="6">
        <rc-phone-with-validation
          v-model="formCopy.homePhoneNumber"
          :rules="rules.homePhoneNumber"
          outlined
          :label="homePhoneNumberLabel"
          :data-test="`${prefixDataTest}__homePhoneNumber`"
          @focusout="onFocusOut()" />
      </v-col>

      <v-col cols="12" sm="6">
        <rc-phone-with-validation
          v-model="formCopy.mobilePhoneNumber"
          :rules="rules.mobilePhoneNumber"
          outlined
          :label="mobilePhoneNumberLabel"
          :data-test="`${prefixDataTest}__mobilePhoneNumber`"
          @focusout="onFocusOut()" />
      </v-col>

      <v-col cols="12" sm="6">
        <rc-phone-with-validation
          v-model="formCopy.alternatePhoneNumber"
          :rules="rules.alternatePhoneNumber"
          outlined
          :label="alternatePhoneNumberLabel"
          :data-test="`${prefixDataTest}__alternatePhoneNumber`"
          @focusout="onFocusOut()" />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field-with-validation
          v-if="formCopy.alternatePhoneNumber.number"
          v-model="formCopy.alternatePhoneNumber.extension"
          :data-test="`${prefixDataTest}__alternatePhoneNumberExtension`"
          :rules="rules.alternatePhoneNumberExtension"
          :label="$t('registration.personal_info.alternatePhoneNumberExtension')" />
      </v-col>

      <v-col cols="12" sm="6">
        <validation-observer ref="email">
          <v-text-field-with-validation
            v-model="formCopy.email"
            class="email-field"
            :loading="emailChecking"
            :data-test="`${prefixDataTest}__email`"
            :rules="rules.email"
            :label="emailLabel"
            @input="resetEmailValidation"
            @focusout="onFocusOut()"
            @blur="validateEmailOnBlur($event.target.value)" />
        </validation-observer>
      </v-col>
    </validation-observer>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { RcPhoneWithValidation, VSelectWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import helpers from '@libs/entities-lib/helpers';
import { ValidationObserver } from 'vee-validate';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import { IOptionItemData } from '@libs/shared-lib/types';
import { IContactInformation, IValidateEmailResponse } from '@libs/entities-lib/value-objects/contact-information';
import { MAX_LENGTH_MD } from '../../constants/validations';

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

    allowDuplicateEmails: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      formCopy: null as IContactInformation,
      focusPhoneCounter: 0,
      triggerPhoneMessage: 4,
      emailValidator: {
        isValid: true,
        messageKey: null,
      },
      emailChecking: false,
      previousEmail: '',
      submitting: false,
      validateEntireFormFn: null,
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
        homePhoneNumber: {
          phone: true,
          requiredContactInfo: this.contactInfoRequired,
        },
        mobilePhoneNumber: {
          phone: true,
          requiredContactInfo: this.contactInfoRequired,
        },
        alternatePhoneNumber: {
          phone: true,
          requiredContactInfo: this.contactInfoRequired,
        },
        alternatePhoneNumberExtension: {
          max: MAX_LENGTH_MD,
        },
        email: {
          customValidator: this.emailValidator,
          requiredContactInfo: this.contactInfoRequired,
        },
      };
    },

    emailLabel(): string {
      return `${this.$t('registration.personal_info.emailAddress')}${this.missingContactInfo ? '*' : ''}`;
    },

    homePhoneNumberLabel(): string {
      return `${this.$t('registration.personal_info.homePhoneNumber')}${this.missingContactInfo ? '*' : ''}`;
    },

    mobilePhoneNumberLabel(): string {
      return `${this.$t('registration.personal_info.mobilePhoneNumber')}${this.missingContactInfo ? '*' : ''}`;
    },

    alternatePhoneNumberLabel(): string {
      return `${this.$t('registration.personal_info.alternatePhoneNumber')}${this.missingContactInfo ? '*' : ''}`;
    },

    hasAnyPhone(): boolean {
      return !!(this.formCopy.homePhoneNumber?.number || this.formCopy.mobilePhoneNumber?.number || this.formCopy.alternatePhoneNumber?.number);
    },

    contactInfoRequired(): { isMissing:boolean } | boolean {
      return !this.skipPhoneEmailRules
      && ((this.submitting && this.missingContactInfo) || this.focusPhoneCounter >= this.triggerPhoneMessage) ? { isMissing: this.missingContactInfo } : false;
    },

    missingContactInfo(): boolean {
      return !this.skipPhoneEmailRules && !this.hasAnyPhone && !this.formCopy.email;
    },

    isCRCRegistration(): boolean {
      return this.$registrationStore.isCRCRegistration();
    },

    emailAlreadyExistMessage(): TranslateResult {
      const emailAlreadyExists = 'errors.the-email-provided-already-exists-in-the-system';
      if (this.isCRCRegistration) {
        return this.$t(`${emailAlreadyExists}.crc-registration`);
      }
      return this.$t(`${emailAlreadyExists}.self-registration`, { phoneNumber: this.$registrationStore.getEvent().responseDetails.assistanceNumber });
    },
  },

  watch: {
    formCopy: {
      deep: true,
      handler(form: IContactInformation) {
        if (form.email) {
          form.email = form.email.trim();
        }
        this.$emit('change', form);
      },
    },
  },

  created() {
    this.formCopy = _cloneDeep(this.form);
    this.prePopulate();

    EventHub.$on('checkEmailValidation', this.validateForm);
    EventHub.$on('resetEmailValidation', this.resetEmailValidation);
  },

  destroyed() {
    if (EventHub) {
      EventHub.$off('checkEmailValidation', this.validateForm);
      EventHub.$off('resetEmailValidation', this.resetEmailValidation);
    }
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

    onFocusOut() {
      this.focusPhoneCounter += 1;
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

    async validateEmailOnBlur(email:string) {
      // wait for the validation on submit to trigger before
      await helpers.timeout(300);
      if (!this.submitting) {
        if (this.isCRCRegistration) {
          this.validateEmail(email);
        } else {
          // in order to validate emails we need a public token (recaptcha approved)
          EventHub.$emit('fetchPublicToken', () => this.validateEmail(email));
        }
      }
    },

    async validateForm(validateEntireForm: ()=> void, allowDuplicateOverride: boolean = null) {
      // if for this specific call we have rules on duplicates we must ensure the validations are redone
      if (allowDuplicateOverride != null) {
        this.formCopy.emailValidatedByBackend = false;
      }
      this.submitting = true;
      // Needed to trigger validation of all contact info fields
      await helpers.timeout(10);
      if (!this.formCopy.email || this.formCopy.emailValidatedByBackend) {
        await validateEntireForm();
      } else {
        this.validateEntireFormFn = validateEntireForm;
        if (this.isCRCRegistration) {
          this.validateEmail(this.formCopy.email, true, allowDuplicateOverride);
        } else {
          // in order to validate emails we need a public token (recaptcha approved)
          EventHub.$emit('fetchPublicToken', () => this.validateEmail(this.formCopy.email, true, allowDuplicateOverride));
        }
      }
    },

    async validateEmail(formEmail?: string, onSubmit?: boolean, allowDuplicateOverride?: boolean) {
      let email = formEmail || this.formCopy.email;

      if (!email) {
        this.resetEmailValidation();
        return;
      }

      email = email.trim();
      if (email !== this.previousEmail || onSubmit) {
        this.previousEmail = email;
        this.emailChecking = true;
        let result = null as IValidateEmailResponse;

        try {
          if (this.isCRCRegistration) {
            result = await this.$services.households.validateEmail({ emailAddress: email, personId: this.personId });
          } else {
            result = await this.$services.households.validatePublicEmail({ emailAddress: email, personId: this.personId });
          }
          // on some calls we want to make sure no duplicate is possible, while on others we can allow them
          // if an override is sent that takes precedence
          if ((allowDuplicateOverride == null ? this.allowDuplicateEmails : allowDuplicateOverride) && result.errors?.length) {
            result.errors = result.errors.filter((e) => e.code !== 'errors.the-email-provided-already-exists-in-the-system');
            result.emailIsValid = !result.errors.length;
          }
        } catch (e: any) {
          result = { emailIsValid: false, errors: e };
        } finally {
          this.emailChecking = false;
          this.submitting = false;
        }

        this.formCopy.emailValidatedByBackend = result.emailIsValid;
        this.setEmailValidator(result as IValidateEmailResponse);
        (this.$refs.email as InstanceType<typeof ValidationObserver>).validate();
        if (this.validateEntireFormFn) {
          this.validateEntireFormFn();
          this.validateEntireFormFn = null;
        }
      }
    },

    resetEmailValidation() {
      this.setEmailValidator({
        emailIsValid: true,
        errors: [],
      });

      this.formCopy.emailValidatedByBackend = false;
    },
  },

});
</script>

<style scoped lang="scss">
.validClass {
  color: gray darken-2
}
.invalidClass {
  color: var(--v-error-base)
}

::v-deep .email-field .v-messages__message {
  white-space: pre-line;
}
</style>
