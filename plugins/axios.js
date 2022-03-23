export default function request({ $axios, error, isDev }) {
  $axios.onRequest((config) => {
    console.log(`Making request to ${config.url}`);
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
      if (!isDev) {
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
}
