<template>
  <div class="household-member mb-4">
    <div class="header rc-body16 fw-bold">
      <div class="flex-grow-1" data-test="additionalMember__identity">
        {{ member.identitySet.firstName }} {{ member.identitySet.lastName }}
      </div>
      <v-btn
        v-if="!inlineEdit && showEditButton"
        :aria-label="`${member.identitySet.firstName} ${member.identitySet.lastName} ${$t('common.buttons.edit')}`"
        data-test="inlineEdit__additionalMember__open"
        icon
        @click.native="edit()">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        v-if="!inlineEdit && showDeleteButton"
        class="mr-2 ml-2"
        :aria-label="`${member.identitySet.firstName} ${member.identitySet.lastName} ${$t('common.buttons.remove')}`"
        data-test="inlineEdit__additionalMember__delete"
        icon
        @click.native="onDelete()">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>
    <div v-if="inlineEdit" class="mt-4">
      <slot name="inline" />
    </div>
    <div v-else>
      <slot />
    </div>

    <div v-if="inlineEdit" class="inline__actions mt-8">
      <v-btn class="mr-2" data-test="inlineEdit__cancel" @click.native="cancel()">
        {{ $t('common.cancel') }}
      </v-btn>
      <v-btn
        class="ml-2"
        color="primary"
        data-test="inlineEdit__save"
        :loading="loading"
        :disabled="loading || saveDisabled"
        @click.native="onSubmit()">
        {{ $t('common.save') }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { IMember } from '@libs/entities-lib/value-objects/member';
import { MemberDuplicateStatus } from '@libs/entities-lib/value-objects/identity-set';

const vueComponent: VueConstructor = Vue.extend({
  name: 'AdditionalMemberSection',

  props: {
    member: {
      type: Object as () => IMember,
      required: true,
    },

    inlineEdit: {
      type: Boolean,
      required: false,
    },

    showEditButton: {
      type: Boolean,
      default: true,
    },

    showDeleteButton: {
      type: Boolean,
      default: true,
    },

    saveDisabledIfDuplicate: {
      type: Boolean,
      default: false,
    },

    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return { MemberDuplicateStatus };
  },

  computed: {
    saveDisabled():boolean {
      return this.member.identitySet && this.saveDisabledIfDuplicate
          && this.member.identitySet.getMemberDuplicateStatus() === MemberDuplicateStatus.Duplicate;
    },
  },

  methods: {
    edit() {
      this.$emit('edit');
    },

    cancel() {
      this.$emit('cancel');
    },

    onSubmit() {
      this.$emit('submit');
    },

    onDelete() {
      this.$emit('delete');
    },
  },
});

export default vueComponent;
</script>

<style lang="scss" scoped>
@import "@libs/shared-lib/assets/styles/breakpoints";

.household-member {
  & > .header {
    height: 47px;
    background-color: var(--v-grey-lighten5);
    padding-left: 16px;
    border: solid 1px var(--v-grey-lighten2);
    display: flex;
    width: 100%;
    align-items: center;
  }
  & > .information-container {
    border: solid var(--v-grey-lighten2);
    border-width: 0 1px 1px 1px;
    justify-items: center;
    align-items: baseline;
    padding: 16px;
    width: 100%;

    & > .column {
      display: flex;
      width: 100%;
      flex-direction: column;
      justify-content: space-around;
    }
  }
}

.inline__actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .household-member {
    & > .header {
      border-radius: 4px 4px 0 0;
    }
  }
}

@media only screen and (min-width: $breakpoint-sm-min) {
  .household-member {
    & > .header {
      border-radius: 4px 4px 0 0;
    }
  }
}

</style>
