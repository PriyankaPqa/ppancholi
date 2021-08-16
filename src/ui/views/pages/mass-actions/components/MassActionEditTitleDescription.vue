<template>
  <v-container class="border">
    <v-row justify="center" class="pa-7">
      <v-col cols="12">
        <v-text-field-with-validation
          v-model="name"
          data-test="name"
          :label="`${$t('massActions.importValidationStatus.create.name.label')} *`"
          persistent-hint
          :rules="rules.name" />
        <v-text-area-with-validation
          v-model="description"
          data-test="description"
          :label="`${$t('massActions.importValidationStatus.create.description.label')}`"
          persistent-hint
          :rules="rules.description" />
      </v-col>
    </v-row>
    <div class="actions pr-7 pb-4">
      <v-btn data-test="cancel" @click="$emit('cancel')">
        {{ $t('common.cancel') }}
      </v-btn>
      <v-btn data-test="save" :disabled="!hasChanged" color="primary" @click="$emit('update', {name, description})">
        {{ $t('common.save') }}
      </v-btn>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { VTextAreaWithValidation, VTextFieldWithValidation } from '@crctech/component-library';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';
import { IMassActionCombined } from '@/entities/mass-action';

export default Vue.extend({
  name: 'MassActionEditTitleDescription',
  components: {
    VTextAreaWithValidation,
    VTextFieldWithValidation,
  },

  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },
  },

  data() {
    return {
      name: this.massAction.entity.name,
      description: this.massAction.entity.description,
      backup: {
        name: '',
        description: '',
      },
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        description: {
          max: MAX_LENGTH_LG,
        },
      };
    },

    hasChanged(): boolean {
      return this.name !== this.backup.name || this.description !== this.backup.description;
    },
  },

  mounted() {
    this.backup.name = this.massAction.entity.name;
    this.backup.description = this.massAction.entity.description;
  },
});
</script>

<style lang="scss" scoped>

.border {
  border-radius: 4px;
  border: 1px solid var(--v-grey-lighten2);
}

.actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  & button {
    margin: 0 0 0 16px;
  }
}
</style>
