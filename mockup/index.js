const cors = require('cors');
const express = require('express');
const OpenAPIBackend = require('openapi-backend').default;

const apiSpec = require('./swagger.json');
const apiV1ActivitiesRead = require('./data/activities.json');
const apiV1EntitiesRead = require('./data/entities.json');
const apiV1EntitiesActivitiesRead = require('./data/entities.activities.json');

const port = 9001;

// add additional routes
const apiSpecAdditionalRoutes = apiSpec;
apiSpecAdditionalRoutes.paths['/swagger.json'] = {
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
  definition: apiSpecAdditionalRoutes,
  handlers: {
    api_v1_activities_read: async (c, req, res) => res.status(200).json(
      apiV1ActivitiesRead,
    ),
    api_v1_entities_read: async (c, req, res) => res.status(200).json(
      apiV1EntitiesRead,
    ),
    api_v1_entities_activities_read: async (c, req, res) => res.status(200).json(
      apiV1EntitiesActivitiesRead,
    ),
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
