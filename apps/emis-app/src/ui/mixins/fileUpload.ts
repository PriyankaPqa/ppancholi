import Vue from 'vue';
import axios, { CancelTokenStatic, CancelTokenSource } from 'axios';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { VForm, IServerError } from '@libs/shared-lib/types';
import { localStorageKeys } from '@/constants/localStorage';
import { IRestResponse } from '@libs/services-lib/http-client';
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import { IEntity } from '@libs/entities-lib/base';

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
      isFileValid: true,
    };
  },
  computed: {
    headers(): Record<string, string> {
      let headers = {};
      const accessToken = AuthenticationProvider.accessToken;

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
    async onUpdateFile(file: File, isFileValid: boolean) {
      this.file = file;
      this.isFileValid = isFileValid;
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
        this.uploadSuccess = true;
      } catch (error) {
        if (axios.isCancel(error)) {
          this.uploadSuccess = false;
        } else {
          const e = error as IServerError;
          this.uploadSuccess = false;
          if (e?.response?.data.errors) {
            this.errors = e.response.data.errors;
            applicationInsights.trackTrace(
              `File upload error ${e.response?.status || 'unknown status'}`,
              { error: this.errors },
              'fileUpload',
              'uploadForm',
            );
          } else {
            applicationInsights.trackException(
              `File upload error ${e.response?.status || 'unknown status'}`,
              { error: e },
              'fileUpload',
              'uploadForm',
            );
            this.errors = [{ code: 'error.upload_unexpected_error' }];
          }
        }
      }
      return this.response?.data;
    },
  },
});
