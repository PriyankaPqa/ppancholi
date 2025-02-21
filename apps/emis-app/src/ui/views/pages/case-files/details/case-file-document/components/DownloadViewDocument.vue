<template>
  <div class="grey-container pa-4 flex-row justify-space-between">
    <div class="rc-body14 fw-bold" data-test="file-name">
      {{ document.originalFilename }}
    </div>
    <div>
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            icon
            data-test="open-link"
            :aria-label="$t('documentDetails.title')"
            v-on="on"
            @click="preview()">
            <v-icon size="24" color="grey darken-2">
              mdi-file-find
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('caseFile.document.openDocument') }}</span>
      </v-tooltip>
      <v-tooltip v-if="canDownload" bottom>
        <template #activator="{ on }">
          <v-btn icon :aria-label="$t('common.download')" data-test="download-link" v-on="on" @click="download()">
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
import { ICaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import { useCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document';
import { UserRoles } from '@libs/entities-lib/user';

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
      return this.$hasLevel(UserRoles.level1) || this.$hasRole(UserRoles.contributor3);
    },
  },

  methods: {
    download() {
      useCaseFileDocumentStore().downloadDocumentAsUrl({ item: this.document, saveDownloadedFile: true });
    },

    async preview() {
      const documentUrl = await useCaseFileDocumentStore().downloadDocumentAsUrl({ item: this.document, saveDownloadedFile: false });
      window.open(documentUrl);
    },
  },
});
</script>
