export default ({
  $axios,
  error,
  isDev,
  redirect,
}) => {
  $axios.onRequest((config) => {
    if (isDev) {
      console.log(`Making request to ${config.url}`);
    }
    // create a regex to match entities
    const regex = /[\w-]+-[\w]+\/?$/;
    const personMatch = config.url.match(regex);
    // add special handling for /entity request concerning redirect to short UUID
    // TODO: eventually also match activities
    if (personMatch) {
      // eslint-disable-next-line no-param-reassign
      config.maxRedirects = 0;
      // eslint-disable-next-line no-param-reassign
      config.validateStatus = (status) => status < 400;
    }
    return config;
  });
  $axios.onResponse((response) => {
    const { status } = response;
    if (status >= 300 && status < 400) {
      if (response && response.data) {
        const regex = /\/([\w-]+-[\w]+\/?)$/;
        const personMatch = response.data.to.match(regex);
        redirect(personMatch[1]);
      }
    }
  });
  $axios.onError((e) => {
    // not sure what that is doing since this is an int already anyways
    // but doesnt break if e.response does not exist so still useful
    const code = parseInt(e.response && e.response.status, 10);
    // check if this was a BAD REQUEST (400)
    if (code === 400) {
      // check if the response provided some information to display
      if (e.response && e.response.data) {
        console.error(e.message, JSON.stringify(e.response.data));
        // otherwise just display complete error
      } else {
        console.error(e);
      }
      // TODO: check if this is ok
      return Promise.reject(e);
    }

    if (code === 404) {
      // if env is dev just put the error in the console and return
      // to calling function
      if (isDev) {
        console.error(e);
        return Promise.resolve(e);
      }
      // in production redirect to the error.vue layout page
      error({
        statusCode: code,
      });
      // prevent error from propagating
      return Promise.resolve(e);
    }

    if ($axios.isCancel(e)) {
      console.warn(e.message);
      // prevent the error from propagating
      return Promise.resolve(false);
    }

    return Promise.reject(e);
  });
};
