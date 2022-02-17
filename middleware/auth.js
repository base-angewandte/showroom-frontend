// eslint-disable-next-line consistent-return
export default function auth({ store, redirect }) {
  // If the user is not authenticated
  if (process.env.authRequired && !store.getters['appData/getAuthState']) {
    return redirect(`${process.env.backendBaseUrl}${process.env.backendPrefix}/accounts/login/`);
  }
}
