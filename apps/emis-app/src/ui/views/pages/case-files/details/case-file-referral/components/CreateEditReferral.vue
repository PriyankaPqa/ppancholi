<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <page-template :loading="referralLoading" :show-left-menu="false">
      <rc-page-content
        :title="isEditMode ? $t('referral.edit.title') : $t('referral.add.title')"
        :show-help="false"
        :help-link="helpLink">
        <referral-form :referral.sync="referral" :is-edit-mode="isEditMode" :is-modal-open.sync="isModalOpen" />

        <template slot="actions">
          <v-btn data-test="cancel" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save" :loading="loading" :disabled="failed || !dirty || isModalOpen " @click.stop="submit">
            {{ submitLabel }}
          </v-btn>
        </template>
      </rc-page-content>
    </page-template>
  </validation-observer>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { RcPageContent } from '@libs/component-lib/components';
import { VForm } from '@libs/core-lib/types';
import { CaseFileReferralEntity, ICaseFileReferralEntity } from '@libs/entities-lib/case-file-referral';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import mixins from 'vue-typed-mixins';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import ReferralForm from './ReferralForm.vue';

export default mixins(handleUniqueNameSubmitError).extend({
  name: 'CreateEditReferral',

  components: {
    PageTemplate,
    RcPageContent,
    ReferralForm,
  },

  props: {
    referralId: {
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
      referralLoading: true,
      loading: false,
      error: false,
      referral: new CaseFileReferralEntity(null),
      isModalOpen: false,
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.caseFile.referrals.edit.name;
    },

    submitLabel(): TranslateResult {
      return this.isEditMode
        ? this.$t('common.save')
        : this.$t('common.buttons.add');
    },

    helpLink(): TranslateResult {
      return this.isEditMode
        ? this.$t('zendesk.help_link.edit_referral')
        : this.$t('zendesk.help_link.create_referral');
    },
  },

  async created() {
    this.referralLoading = true;

    if (this.isEditMode) {
      try {
        const res = await this.$storage.caseFileReferral.actions.fetch({ id: this.referralId, caseFileId: this.id });
        this.referral = new CaseFileReferralEntity(res.entity);
      } finally {
        this.referralLoading = false;
      }
    } else {
      this.referral = new CaseFileReferralEntity(null);
      this.referral.caseFileId = this.id;
      this.referralLoading = false;
    }
  },

  methods: {
    back(): void {
      this.$router.replace({
        name: routes.caseFile.referrals.home.name,
      });
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid) {
        try {
          this.loading = true;
          let referral: ICaseFileReferralEntity;

          if (this.isEditMode) {
            referral = await this.$storage.caseFileReferral.actions.updateReferral(this.referral);
          } else {
            referral = await this.$storage.caseFileReferral.actions.createReferral(this.referral);
          }
          if (referral) {
            this.$toasted.global.success(this.$t(this.isEditMode ? 'referral.edit.success' : 'referral.create.success'));
            this.$router.replace({ name: routes.caseFile.referrals.details.name, params: { referralId: referral.id } });
          }
        } catch (e) {
          this.$appInsights.trackTrace('caseFileReferral submit error', { error: e }, 'CreateEditReferral', 'submit');
          this.handleSubmitError(e);
        } finally {
          this.loading = false;
        }
      } else {
        helpers.scrollToFirstError('scrollAnchor');
      }
    },
  },
});
</script>
