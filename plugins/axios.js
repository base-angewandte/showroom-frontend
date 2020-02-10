// TODO: this is just example content - check if this can be filled with
// something more useful - e.g. request cancellations!

export default function ({ $axios, redirect }) {
  $axios.onRequest((config) => {
    console.log(`Making request to ${config.url}`);
  });

  $axios.onError((error) => {
    const code = parseInt(error.response && error.response.status, 10);
    if (code === 400) {
      redirect('/400');
    }
  });
}