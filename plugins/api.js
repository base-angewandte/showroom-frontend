import Vue from 'vue';
import { Response } from 'node-fetch';
import SwaggerClient from 'swagger-client';

const cancelRequest = [];

export default async ({ $axios, store }, inject) => {
  const ApiSpecUrl = process.env.apiSpecUrl;
  let ApiSpec;

  try {
    ApiSpec = await $axios(ApiSpecUrl)
      .then((response) => response.data);
  } catch (error) {
    console.error(error);
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Open Api Specification could not be fetched from ${ApiSpecUrl}`);
    }
    // redirect(`${process.env.backendBaseUrl}/500`);
  }

  const { CancelToken } = $axios;

  const APIClient = {
    // eslint-disable-next-line no-shadow
    install(Vue) {
      SwaggerClient({
        spec: ApiSpec,
        userFetch: async (url, req) => {
          const cancelId = url.match(/[^?]*/i)[0];

          // cancel previous request if still pending
          if (cancelRequest[cancelId]) {
            cancelRequest[cancelId]('new request started');
          }

          // eslint-disable-next-line no-param-reassign
          req.headers = { 'Accept-Language': store.state.appData.locale };
          const data = req.body ? JSON.parse(req.body) : {};
          const axiosRequest = {
            ...req,
            data,
            cancelToken: new CancelToken(function executor(c) {
              // An executor function receives a cancel function as a parameter
              cancelRequest[cancelId] = c.bind(this);
            }),
            withCredentials: true,
            xsrfCookieName: 'csrftoken_showroom',
            xsrfHeaderName: 'X-CSRFToken',
          };

          try {
            const axiosResponse = await $axios(axiosRequest);

            return new Response(JSON.stringify(axiosResponse.data), {
              status: axiosResponse.status,
              headers: axiosResponse.headers,
            });
          } catch (e) {
            return Promise.reject(e);
          }
        },
      }).then((client) => {
        // register to vue instance
        // eslint-disable-next-line no-param-reassign
        Vue.prototype.$swaggerClient = client;
        // eslint-disable-next-line no-param-reassign
        Vue.prototype.$api = client.apis;

        // register to vue context for asyncData()
        inject('swaggerClient', client);
        inject('api', client.apis);
      }, (error) => {
        console.error('failed to load api spec: %o', error);
      });
    },
  };
  Vue.use(APIClient);
};
