const cors = require('cors');
const express = require('express');
const OpenAPIBackend = require('openapi-backend').default;

const apiSpec = require('./swagger.json');
const apiV1ActivitiesRead = require('./data/activities.json');
const apiV1AutocompleteResultsRead = require('./data/discover.autocomplete.json');
const apiV1EntitiesActivitiesRead = require('./data/entities.activities.json');
const apiV1EntitiesRead = require('./data/entities.json');
const apiV1EntitiesSearch = require('./data/entities.id.search.json');
const apiV1EntitiesActivitiesEditReadSD = require('./data/entities.secondaryDetails.json');
const apiV1Filters = require('./data/filters.json');
const apiV1SearchInitialRead = require('./data/discover.search.initial.json');

const port = 9001;

// Api modifications
const apiSpecModified = apiSpec;

// openapi-backend could not resolve paths with a trailing slash
// remove trailing slashes from paths
Object.entries(apiSpecModified.paths).forEach(([key, value]) => {
  apiSpecModified.paths[key.replace(/\/$/, '')] = value;
  delete apiSpecModified.paths[key];
});

// add additional routes
apiSpecModified.paths['/swagger.json'] = {
  get: {
    operationId: 'swagger',
    responses: {},
  },
};

// config app
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// define api
const api = new OpenAPIBackend({
  definition: apiSpecModified,
  handlers: {
    api_v1_filters_list: async (c, req, res) => res.status(200).json(
      apiV1Filters,
    ),
    api_v1_search_create: async (c, req, res) => res.status(200).json(
      apiV1SearchInitialRead,
    ),
    api_v1_autocomplete_create: async (c, req, res) => {
      const searchString = req.query.q;
      const filterName = req.query.filter_name;
      let matchingData = [];
      let subsetData = apiV1AutocompleteResultsRead;
      if (filterName) {
        subsetData = apiV1AutocompleteResultsRead.filter(({ subset }) => subset === filterName);
      }
      if (searchString) {
        matchingData = subsetData.map(({ subset, data }) => ({
          subset,
          data: data.filter((entry) => entry.title.toLowerCase()
            .includes(searchString.toLowerCase())),
        }));
      }
      return res.status(200).json(
        matchingData,
      );
    },
    api_v1_activities_retrieve: async (c, req, res) => res.status(200).json(
      apiV1ActivitiesRead,
    ),
    api_v1_entities_search_create: async (c, req, res) => res.status(200).json(
      apiV1EntitiesSearch,
    ),
    api_v1_entities_retrieve: async (c, req, res) => res.status(200).json(
      apiV1EntitiesRead,
    ),
    api_v1_entities_list_retrieve: async (c, req, res) => res.status(200).json(
      apiV1EntitiesActivitiesRead,
    ),
    api_v1_entities_edit_retrieve: async (c, req, res) => {
      if (req.query.field === 'secondary_details') {
        res.status(200).json(apiV1EntitiesActivitiesEditReadSD);
      }

      if (req.query.field === 'showcase') {
        res.status(200).json({ message: 'tbd.' });
      }
    },
    api_v1_entities_edit_update: async (c, req, res) => res.status(200).json(),
    swagger: async (c, req, res) => {
      // remove schema 'CommonList', due problems with converting circular structures to JSON
      // - not needed for further frontend processing
      // "oneOf": [{ "$ref": "#/components/schemas/CommonList" },
      //           { "$ref": "#/components/schemas/CommonListItem" }]
      apiSpec.components.schemas.CommonList.properties.data.items.oneOf.shift();

      return res.status(200).json(apiSpec);
    },
    notFound: async (c, req, res) => res.status(404).json({ err: 'not found' }),
    notImplemented: async (c, req, res) => {
      const { status, mock } = c.api.mockResponseForOperation(c.operation.operationId);
      return res.status(status).json(mock);
    },
  },
});

// init api
api.init();

// use as express middleware
app.use((req, res) => api.handleRequest(req, req, res));

// start server
app.listen(port, () => console.info(`API listening at http://localhost:${port}`));
