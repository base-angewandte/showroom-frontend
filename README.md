# showroom-frontend

> Showcase your portfolio

## Project Setup

git is required on your system

```bash
# clone the git repository
git clone https://github.com/base-angewandte/showroom-frontend.git
```

Install node dependencies
```bash
# switch into the project folder
cd showroom-frontend

# install dependencies
npm install
```

Also check and if necessary adapt the configuration:
```bash
# create a copy of the default environment variables
cp .env-skel .env

# use your favourite text editor to inspect and adapt the config file 
nano .env

# if you need to adapt the default values for e.g. the leaflet tile-layer service
# create a copy of the default settings
cp config/settings-skel.js config/settings.js

# and edit the settings
nano config/settings.js
```

For configuration details and possible options see the [config section](#configuration-of-the-showroom-app).

## Production Setup

git and docker are required on the system.

``` bash
# build and start the Showroom App
make start
```

## Configuration of the Showroom App

The configuration of your project can be done with environment variables specified in a `.env` file.

### Configurable values:
Following variables in the `.env` file contained in project folder can be defined and must be available:

| Variable                    | Description                                                                         |
|-----------------------------|-------------------------------------------------------------------------------------|
| APP_TITLE                   | name of the app, used to set title tag                                              |
| INSTITUTION_ID              | the id of the institution this showroom belongs to as assigned in showroom backend                                                   |
| APP_BASE_URL                | url where the frontend is located                                                   |
| APP_PREFIX                  | desired prefix of the application                                                   |
| API_SPEC_URL                | url to the open-api-definition in json format                                       |
| BACKEND_BASE_URL            | url where the backend is located (e.g for login/logout)                             |
| BACKEND_PREFIX              | prefix for the backend                                                              |
| HEADER_JSON                 | url where the latest header version is specified                                    |
| HEADER_LOGOUT_REDIRECT_URL  | url to redirect after logout                                                        |
| HEADER_URL_TERMS            | link to terms and conditions                                                        |
| HEADER_URL_NOTICE           | link to site legal notice                                                           |
| LOCALES                     | available locales                                                                   |
| DEFAULT_LOCALE              | default language, if one should be set (else the browser language will be used)     |
| EN_TITLE_CASING             | as per default with locale set to english, all text except complete sentences will be title-cased. Set false to turn this behaviour off.     |
| USER_PREFERENCES_URL        | url where the user preferences app is located                                       |
| AUTH_REQUIRED               | set true for users to be redirected to login page if not authenticated                                       |
| USER_PREFERENCES_URL        | define how many rows of search results should be displayed                                       |
| BASE_UI_ICONS               | url to icons spriteSheet (base-ui-icons.svg)                                        |

Following `.env` variable get updated during project start up - so no need to set up!

| Variable                    | Description                                                                         |
|-----------------------------|-------------------------------------------------------------------------------------|
| HEADER                      | complete header url (can also be set manually via `gulp set-header`)                |
