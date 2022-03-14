<template>
  <v-dialog
    :value="show"
    width="65%"
    content-class="dataTableHeader__exportDialog"
    @input="$emit('update:show', $event)">
    <v-card>
      <v-card-title primary-title>
        {{ labels.exportTitle }}
      </v-card-title>

      <v-card-text>
        <v-simple-table>
          <thead>
            <tr>
              <th>{{ labels.exportFormat }}</th>
              <th>{{ labels.exportItems }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                CSV
              </td>
              <td>
                {{ count }}
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          text
          data-test="dataTableHeader__cancelExport"
          @click="$emit('update:show', false)">
          {{ labels.exportCancel }}
        </v-btn>

        <v-btn
          text
          color="primary"
          data-test="dataTableHeader__confirmExport"
          @click="emitExportEvent">
          {{ labels.exportDownload }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { IFilterToolbarLabels } from '@libs/component-lib/types';

export default Vue.extend({
  name: 'RcToolbarExportDialog',
  components: {
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    labels: {
      type: Object as () => IFilterToolbarLabels,
      default: null,
    },
    count: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
    };
  },
  methods: {
    onClose() {
      this.$emit('update:show', false);
    },
    emitExportEvent() {
      this.$emit('export');
      this.$emit('update:show', false);
    },
  },
});
</script>
