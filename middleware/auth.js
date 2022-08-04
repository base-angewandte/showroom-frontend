// eslint-disable-next-line consistent-return
export default function auth({
  store,
  redirect,
  route,
  env,
}) {
  // If the user is not authenticated
  if (env.authRequired && !store.getters['appData/getAuthState']) {
    return redirect(`${env.backendBaseUrl}${env.backendPrefix}/accounts/login/?next=${env.appPrefix}${route.path}`);
  }
}
