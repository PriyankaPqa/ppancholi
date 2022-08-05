<template>
  <div>
    <div class="title">
      <span class="rc-heading-5 fw-bold"> {{ massAction.entity.name }}</span>
      <div class="actions">
        <status-chip :show-loading="loadingChip" status-name="MassActionRunStatus" :status="massActionStatus" />
        <div>
          <v-btn v-if="showEditIcon" class="ml-2" icon data-test="edit" @click="$emit('edit')">
            <v-icon size="24" color="grey darken-2">
              mdi-pencil
            </v-icon>
          </v-btn>

          <v-btn v-if="showDeleteIcon" icon data-test="delete" @click="$emit('delete')">
            <v-icon size="24" color="grey darken-2">
              mdi-delete
            </v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <div v-if="massAction.entity.description" class="rc-body14 mt-4" data-test="description">
      {{ massAction.entity.description }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IMassActionCombined } from '@libs/entities-lib/mass-action';
import StatusChip from '@/ui/shared-components/StatusChip.vue';

export default Vue.extend({
  name: 'MassActionTitleDescription',
  components: {
    StatusChip,
  },
  props: {
    massAction: {
      type: Object as () => IMassActionCombined,
      required: true,
    },
    massActionStatus: {
      type: Number,
      required: true,
    },

    loadingChip: {
      type: Boolean,
      default: true,
    },

    showDeleteIcon: {
      type: Boolean,
      default: false,
    },

    showEditIcon: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
}

.actions {
  display: flex;
  align-items: center;
}

</style>
