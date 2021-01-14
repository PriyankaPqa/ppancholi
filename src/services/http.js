// axios setup
import axios from 'axios';
import qs from 'qs';
import { v4 as uuidv4 } from 'uuid';
import Vue from 'vue';
import _isArray from 'lodash/isArray';
import { i18n } from '@/ui/plugins/i18n';
import { localStorageKeys } from '@/constants/localStorage';
import helpers from '@/ui/helpers';

const baseURL = process.env.VUE_APP_API_BASE_URL;

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    Object.keys(params).forEach((key) => {
      if (_isArray(params[key]) && !params[key].length) {
        delete params[key];
      }
    });
    return qs.stringify(params, { arrayFormat: 'repeat' });
  },
});

// The global handler is enable by default.
const isGlobalHandlerEnabled = (config = {}) => (!(Object.prototype.hasOwnProperty.call(config, 'globalHandler') && !config.globalHandler));
// We send token and role by default
const sendTokenAndRole = (config = {}) => (!(Object.prototype.hasOwnProperty.call(config, 'sendTokenAndRole') && !config.sendTokenAndRole));

const requestHandler = (request) => {
  if (sendTokenAndRole(request)) {
    const accessToken = localStorage.getItem(localStorageKeys.accessToken.name);
    if (accessToken) {
      // Add the access token to the request headers
      request.headers.common.Authorization = `Bearer ${accessToken}`;
    }
  }

  if (isGlobalHandlerEnabled(request)) {
    // Add what you want when request is sent
    // It is applied globally except when { globalHandler: false }
  }
  // Add 'X-Request-ID' and 'X-Correlation-ID' headers to each request
  request.headers.common['X-Request-ID'] = uuidv4();
  request.headers.common['X-Correlation-ID'] = uuidv4();

  return request;
};

const successHandler = (response) => {
  if (isGlobalHandlerEnabled(response.config)) {
    // Add what you want when request is successful
    // It is applied globally except when { globalHandler: false }
  }
  return response;
};

const errorHandler = (error) => {
  if (isGlobalHandlerEnabled(error.config)) {
    let errorMessage = i18n.t('error.server_not_reachable');
    if (error.response.data.customErrorDetailsList !== undefined) { // Display a error toast when server error occurred
      errorMessage = helpers.formatErrorMessages(error.response.data.customErrorDetailsList, error.response.data.statusCode);
    } else {
      errorMessage = error;
    }
    Vue.toasted.global.error(errorMessage);
  }
  return Promise.reject(error);
};

// Add interceptors
http.interceptors.request.use(
  (request) => requestHandler(request),
);

http.interceptors.response.use(
  (response) => successHandler(response),
  (error) => errorHandler(error),
);
