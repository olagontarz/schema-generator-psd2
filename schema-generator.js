const fs = require('fs');
const config = require('./config.js');

function generateSchema() {
  const common = config.common;
  const events = config.eventTypes;

  const outputSchema = {
    type: 'object',
    properties: {
      eventType: {
        type: 'string',
        enum: Object.keys(events),
      },
      security: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
    required: ['eventType', 'security'],
    oneOf: [],
  };

  // loading security object properties
  const security = require(common);
  Object.assign(outputSchema.properties.security.properties, security);

  Object.keys(security).forEach((property) => {
    outputSchema.properties.security.required.push(property);
  });

  // loading business object properties from different eventType files defined in conf.json
  Object.keys(events).forEach((type) => {
    const newProperties = {
      properties: {
        eventType: {
          enum: [type],
        },
        business: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: false,
        },
      },
      required: ['eventType', 'business'],
    };

    const json = require(events[type]);
    Object.assign(newProperties.properties.business.properties, json);
    Object.keys(json).forEach((property) => {
      newProperties.properties.business.required.push(property);
    });
    outputSchema.oneOf.push(newProperties);
  });

  return outputSchema;
}

function start() {
  const schema = generateSchema();
  fs.writeFile('psd2_schema.json', JSON.stringify(schema), (err) => {
    if (err) console.error(err);
    else console.log('Json schema has been successfully created in schema.json file :)');
  });
}

start();
