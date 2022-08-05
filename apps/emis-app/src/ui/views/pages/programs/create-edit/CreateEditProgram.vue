<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <page-template :loading="programLoading" :show-left-menu="false">
      <rc-page-content
        :title="isEditMode ? $t('event.programManagement.updateProgram') : $t('event.programManagement.addNewProgram')"
        :show-help="false"
        :help-link="helpLink">
        <program-form :program.sync="program" :is-edit-mode="isEditMode" :is-name-unique.sync="isNameUnique" :is-dirty.sync="isDirty" />

        <template slot="actions">
          <v-btn data-test="cancel" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save" :loading="loading" :disabled="failed || (!dirty && !isDirty)" @click.stop="submit">
            {{ submitLabel }}
          </v-btn>
        </template>
      </rc-page-content>
    </page-template>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcPageContent } from '@libs/component-lib/components';
import { IServerError, VForm } from '@libs/core-lib/types';
import { ProgramEntity } from '@libs/entities-lib/program';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import ProgramForm from './ProgramForm.vue';

export default Vue.extend({
  name: 'CreateEditProgram',

  components: {
    PageTemplate,
    RcPageContent,
    ProgramForm,
  },

  props: {
    id: {
      type: String,
      default: '',
    },

    programId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      programLoading: true,
      loading: false,
      error: false,
      program: new ProgramEntity(),
      isNameUnique: true,
      isDirty: false,
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.programs.edit.name;
    },

    submitLabel(): TranslateResult {
      return this.isEditMode
        ? this.$t('common.save')
        : this.$t('common.buttons.create');
    },

    helpLink(): TranslateResult {
      return this.isEditMode
        ? this.$t('zendesk.help_link.edit_program')
        : this.$t('zendesk.help_link.create_program');
    },
  },

  async created() {
    this.programLoading = true;

    if (this.isEditMode) {
      try {
        const res = await this.$storage.program.actions.fetch({ id: this.programId, eventId: this.id });
        this.program = new ProgramEntity(res.entity);
      } finally {
        this.programLoading = false;
      }
    } else {
      this.program = new ProgramEntity();
      this.program.eventId = this.id;
      this.programLoading = false;
    }
  },

  methods: {
    back(): void {
      this.$router.replace({
        name: routes.programs.home.name,
      });
    },

    handleSubmitError(e: IServerError | unknown) {
      const errorData = (e as IServerError).response?.data?.errors;

      if (!errorData || !Array.isArray(errorData)) {
        this.$reportToasted(this.$t('error.submit_error'), e);
      } else {
        errorData.forEach((error) => {
          if (error.code === 'errors.program-with-this-name-already-exists-for-this-event') {
            this.isNameUnique = false;
            setTimeout(() => {
              helpers.scrollToFirstError('scrollAnchor');
            }, 300);
          } else if (this.$te(error.code)) {
            this.$toasted.global.error(this.$t(error.code));
          } else {
            this.$reportToasted(this.$t('error.submit_error'), e);
          }
        });
      }
    },

    async createProgram() {
      const newProgram = await this.$storage.program.actions.createProgram(this.program);
      if (newProgram) {
        this.$toasted.global.success(this.$t('event.programManagement.created'));
        this.$router.replace({ name: routes.programs.details.name, params: { programId: newProgram.id } });
      } else {
        this.$toasted.global.error(this.$t('event.programManagement.create.failed'));
      }
    },

    async editProgram() {
      const res = await this.$storage.program.actions.updateProgram(this.program);
      if (res) {
        this.$toasted.global.success(this.$t('event.programManagement.updated'));
        this.$router.replace({ name: routes.programs.details.name, params: { programId: this.program.id } });
      } else {
        this.$toasted.global.error(this.$t('event.programManagement.update.failed'));
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
        if (this.isEditMode) {
          await this.editProgram();
        } else {
          await this.createProgram();
        }
      } catch (e) {
        this.$appInsights.trackTrace('Program submit error', { error: e }, 'CreateEditProgram', 'submit');
        this.handleSubmitError(e);
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
