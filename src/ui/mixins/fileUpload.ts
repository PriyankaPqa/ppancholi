import Vue from 'vue';
import axios, { CancelTokenStatic, CancelTokenSource } from 'axios';
import { VForm } from '@/types';
import { localStorageKeys } from '@/constants/localStorage';
import { IRestResponse } from '@/services/httpClient';
import { IEntity } from '@/entities/base';

const httpClient = axios.create({
  baseURL: `${localStorage.getItem(localStorageKeys.baseUrl.name)}/`,
  withCredentials: true,
});

export default Vue.extend({
  data() {
    return {
      file: {} as File,
      source: {} as CancelTokenSource,
      percentCompleted: 0,
      response: {} as IRestResponse<IEntity>,
      uploadSuccess: false,
      errors: [],
      showUploadDialog: false,
    };
  },
  computed: {
    headers(): Record<string, string> {
      let headers = {};
      const accessToken = localStorage.getItem(localStorageKeys.accessToken.name);

      if (accessToken) {
        // Add the access token to the request headers
        headers = { ...headers, Authorization: `Bearer ${accessToken}` };
      }
      return headers;
    },

    uploadHasErrors(): boolean {
      return this.errors.length > 0;
    },
  },
  methods: {
    async onUpdateFile(file: File) {
      this.file = file;
      this.$nextTick(async () => {
        await (this.$refs.file as VForm).validate();
      });
    },

    cancelUpload() {
      this.source.cancel();
      this.showUploadDialog = false;
      this.$toasted.global.info(this.$t('common.file.cancel_upload'));
    },

    async uploadForm(formData: FormData, url: string): Promise<IEntity> {
      this.uploadSuccess = false;
      this.errors = [];
      const cancelToken = axios.CancelToken as CancelTokenStatic;
      this.source = cancelToken.source();
      this.percentCompleted = 0;

      try {
        this.response = await httpClient.post(url, formData, {
          headers: { ...this.headers, 'Content-Type': 'multipart/form-data' },
          cancelToken: this.source.token,
          onUploadProgress: (progressEvent) => {
            this.percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          },
        });
        // TODO Set the response (mass action entity) to the store
        this.uploadSuccess = true;
      } catch (e) {
        if (axios.isCancel(e)) {
          this.uploadSuccess = false;
        } else {
          this.uploadSuccess = false;
          if (e.response.data.errors) {
            this.errors = e.response.data.errors;
          } else {
            this.errors = [{ code: 'error.unexpected_error' }];
          }
        }
      }
      return this.response?.data;
    },
  },
});
