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

  17 April 2019

*/

'use strict';

/**
 * Fhir Client Credentials Grant Provider
 */
class ClientCredentialsGrantProvider {

  constructor(hostConfig) {
    this.hostConfig = hostConfig;
  }

  static create(hostConfig) {
    return new ClientCredentialsGrantProvider(hostConfig);
  }

  /**
   * Applies client credentials authentication scheme
   * 
   * @param {Object} options 
   * 
   * @return {Object}
   */
  applyAuthenticationScheme(options) {
    return Object.assign(options, {
      form: {
        grant_type: this.hostConfig.grant_type
      }
    });
  }
}

module.exports = ClientCredentialsGrantProvider;