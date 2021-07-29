// TODO: this is just example content - check if this can be filled with

export default function request({ $axios }) {
  $axios.onRequest((config) => {
    console.log(`Making request to ${config.url}`);
  });

  // eslint-disable-next-line consistent-return
  $axios.onError((e) => {
    const code = parseInt(e.response && e.response.status, 10);
    console.error(e);
    if (code === 400) {
      // Todo: redirect to error page or inform the user in notifications?
      console.error(e);
    }

    if ($axios.isCancel(e)) {
      console.warn(e.message);
      // prevent the error from propagating
      return Promise.resolve(false);
    }
  });
}
