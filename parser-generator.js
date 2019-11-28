const fs = require('fs');
const config = require('./config.js');

function sortJSON(obj) {
  const sorted = {};
  const a = [];

  Object.keys(obj).forEach(key => a.push(key));
  a.sort();

  let key;
  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = obj[a[key]];
  }
  return sorted;
}

function generateParser() {
  let parser = '';
  parser += 'do.unparsed.events=false\n\n';
  parser += 'regex=\\\\{"business"\\:(.*),"eventType"\\:(.*),"security"\\:\\\\{';

  const commonDefFile = config.common;
  const eventTypes = config.eventTypes;

  const securityFile = require(commonDefFile);
  const security = sortJSON(securityFile);

  Object.keys(security).forEach((property) => {
    parser += `"${property}"\\:"(.*)",`;
  });
  // remove last comma
  parser = parser.substring(0, parser.length - 1);
  parser += '\\\\}.*\n\n';

  // eventType + security keys + business section
  const tokenCount = 1 + Object.keys(security).length + 1;

  parser += `token.count=${tokenCount}\n\n`;
  parser += 'token[0].name=business\n';
  parser += 'token[0].type=String\n\n';
  parser += 'token[1].name=eventType\n';
  parser += 'token[1].type=String\n\n';

  let i = 2;
  Object.keys(security).forEach((property) => {
    parser += `token[${i}].name=${property}\n`;
    const obj = security[property];
    let type;
    if (obj.type === 'string') {
      type = 'String';
      if (Object.prototype.hasOwnProperty.call(obj, 'format')) {
        if (obj.format === 'ipv4' || obj.format === 'ipv6') {
          type = 'IPAddress';
        } else if (obj.format === 'date' || obj.format === 'date-time') {
          type = 'Date';
        }
      }
    }
    parser += `token[${i}].type=${type}\n\n`;
    i++;
  });

  parser += 'event.deviceVendor=__getVendor("BNP")\n';
  parser += 'event.deviceProduct=__stringConstant("NewRetail")\n\n';
  parser += 'submessage.messageid.token=eventType\n';
  parser += 'submessage.token=business\n\n';
  parser += `submessage.count=${Object.keys(eventTypes).length}\n\n`;

  let j = 0;
  Object.keys(eventTypes).forEach((eventType) => {
    const businessFile = require(eventTypes[eventType]);
    const business = sortJSON(businessFile);

    parser += `submessage[${j}].messageid="${eventType}"\n`;
    parser += `submessage[${j}].pattern.count=1\n`;
    parser += `submessage[${j}].pattern[0].regex=\\\\{`;

    Object.keys(business).forEach((property) => {
      parser += `"${property}"\\:"(.*)",`;
    });
    // remove last comma
    parser = parser.substring(0, parser.length - 1);

    parser += '\\\\}.*\n';
    parser += `submessage[${j}].pattern[0].fields=`;
    parser += '\n\n';

    j++;
  });
  return parser;
}

function start() {
  fs.writeFile('psd2_json_parser.properties', generateParser(), (err) => {
    if (err) console.error(err);
    else console.log('Parser has been successfully generated and saved in parser.properties file :)');
  });
}

start();
