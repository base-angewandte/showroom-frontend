import Vue from 'vue';
import { Response } from 'node-fetch';
import SwaggerClient from 'swagger-client';

const cancelRequest = [];

export default async ({
  $axios, store, isDev, redirect,
}, inject) => {
  const ApiSpecUrl = process.env.apiSpecUrl;
  let ApiSpec;

  try {
    ApiSpec = await $axios(ApiSpecUrl)
      .then((response) => response.data);
  } catch (e) {
    console.error(e);
    if (isDev) {
      throw new Error(`Open Api Specification could not be fetched from ${ApiSpecUrl}`);
    } else {
      // if the api specification can not be fetched the whole app will not work so
      // redirect to server base url (on server: basedev or base)
      redirect(`${process.env.appBaseUrl}/500`);
    }
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
          $axios.setHeader('Accept-Language', store.state.appData.locale);
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

            if (axiosResponse.data) {
              return new Response(JSON.stringify(axiosResponse.data), {
                status: axiosResponse.status,
                headers: axiosResponse.headers,
              });
            }
            // ending up here when 404 or request was cancelled - both does not
            // need to be propagated as error (404 already handled in axios.js)
            return new Response(false);
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
