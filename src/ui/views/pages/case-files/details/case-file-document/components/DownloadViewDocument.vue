<template>
  <div class="grey-container pa-4 flex-row justify-space-between">
    <div class="rc-caption12 fw-bold">
      {{ document.originalFilename }}
    </div>
    <div>
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn icon data-test="open-link" v-on="on">
            <v-icon size="24" color="grey darken-2">
              mdi-file-find
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('caseFile.document.openDocument') }}</span>
      </v-tooltip>
      <v-tooltip v-if="canDownload" bottom>
        <template #activator="{ on }">
          <v-btn icon data-test="download-link" v-on="on" @click="download()">
            <v-icon size="24" color="grey darken-2">
              mdi-download
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('common.download') }}</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICaseFileDocumentEntity } from '@/entities/case-file-document';

export default Vue.extend({
  name: 'DownloadViewDocument',

  components: {
  },

  props: {
    document: {
      type: Object as () => ICaseFileDocumentEntity,
      required: true,
    },
  },

  computed: {
    canDownload(): boolean {
      return this.$hasLevel('level1') || this.$hasRole('contributor3');
    },
  },

  methods: {
    download() {
      this.$storage.caseFileDocument.actions.downloadDocumentAsUrl(this.document, true);
    },
  },
});
</script>
