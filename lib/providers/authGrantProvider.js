/*

 ----------------------------------------------------------------------------
 | ripple-fhir-service: Ripple FHIR Interface                               |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
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

  17 April 2019

*/

'use strict';

const ClientCredentialsGrantProvider = require('./clientCredentialsGrantProvider');
const JwtBearerGrantProvider = require('./jwtBearerGrantProvider');

/**
 * Fhir API Auth Grant Provider
 */
class AuthGrantProvider {
    
  static create(ctx, hostConfig) {
    
    if (hostConfig.grant_type === 'client_credentials') {
      return ClientCredentialsGrantProvider.create(hostConfig);
    }

    if (hostConfig.grant_type === 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
      return JwtBearerGrantProvider.create(ctx, hostConfig);
    }

    throw Error(`Invalid grant_type: ${ hostConfig.grant_type }, check configuration file.`);
  }
}

module.exports = AuthGrantProvider;