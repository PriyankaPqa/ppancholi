<template>
  <ValidationObserver ref="form" v-slot="{ failed, dirty }" slim>
    <page-template :loading="programLoading" :show-left-menu="false">
      <rc-page-content
        :title="isEditMode ? $t('event.programManagement.updateProgram') : $t('event.programManagement.addNewProgram')"
        :show-help="true"
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
  </ValidationObserver>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcPageContent } from '@crctech/component-library';
import { IError } from '@/services/httpClient';
import { VForm } from '@/types';
import { ProgramEntity } from '@/entities/program';
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

    handleSubmitError(errors: IError[]) {
      errors.forEach((error) => {
        if (error.code === 'errors.program-with-this-name-already-exists-for-this-event') {
          this.isNameUnique = false;
        } else {
          this.$toasted.global.error(this.$t(error.code));
        }
      });
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid) {
        try {
          this.loading = true;
          let programId;

          if (this.isEditMode) {
            await this.$storage.program.actions.updateProgram(this.program);
            programId = this.program.id;
            this.$toasted.global.success(this.$t('event.programManagement.updated'));
          } else {
            const newProgram = await this.$storage.program.actions.createProgram(this.program);
            programId = newProgram.id;
            this.$toasted.global.success(this.$t('event.programManagement.created'));
          }
          this.$router.replace({ name: routes.programs.details.name, params: { programId } });
        } catch (e) {
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
