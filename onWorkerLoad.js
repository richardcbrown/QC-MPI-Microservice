/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | http://www.synanetics.com                                                |
 | Email: support@synanetics.com                                            |
 |                                                                          |
 | Author: Richard Brown                                                    |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  17 Mar 2020

*/

'use strict';

const fs = require('fs');
const { logger } = require('./lib/core');
const config = require('./configuration/fhir_service.config');
const searchConfig = require('./configuration/fhir_service.search');
const fileLogger = require('./logger').logger;

/* 
  allows bypass of certificate validation
  when the certificate is unsigned
  this should only be false in non-production
  environments
*/
if (config.rejectUnauthorized === false) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
}

module.exports = async function () {
  try {
    logger.info('FhirService - onWorkerLoad');

    this.userDefined.globalConfig = config;
    this.userDefined.searchConfig = searchConfig;

    if (config.auth.grant_type === 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
      this.userDefined.globalConfig.auth.privateKey = fs.readFileSync(__dirname + '/configuration/privateKey.key');
    }
  } catch (error) {
    fileLogger.error('', error);
  }
};
