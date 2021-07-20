import Vue from 'vue';
import { Response } from 'node-fetch';
import SwaggerClient from 'swagger-client';

export default async ({ $axios, redirect }, inject) => {
  const ApiSpecUrl = process.env.apiSpecUrl;
  let ApiSpec;

  try {
    ApiSpec = await $axios(ApiSpecUrl)
      .then((response) => response.data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Open Api Specification could not be fetched from ${ApiSpecUrl}`);
    }
    redirect(`${process.env.backendBaseUrl}/500`);
  }

  const APIClient = {
    // eslint-disable-next-line no-shadow
    install(Vue) {
      SwaggerClient({
        spec: ApiSpec,
        userFetch: async (url, req) => {
          const data = req.body ? JSON.parse(req.body) : {};
          const axiosRequest = {
            ...req,
            data,
            withCredentials: true,
            xsrfCookieName: 'csrftoken_showroom',
            xsrfHeaderName: 'X-CSRFToken',
          };
          const axiosResponse = await $axios(axiosRequest);

          return new Response(JSON.stringify(axiosResponse.data), {
            status: axiosResponse.status,
            headers: axiosResponse.headers,
          });
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
