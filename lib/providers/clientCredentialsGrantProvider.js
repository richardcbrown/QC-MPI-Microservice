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

const uuid = require('uuid')

/**
 * Fhir Client Credentials Grant Provider
 */
class ClientCredentialsGrantProvider {

  constructor(hostConfig) {
    this.hostConfig = hostConfig;
  }

  /**
   * Applies client credentials authentication scheme
   * 
   * @param {Object} options 
   * 
   * @return {Object}
   */
  applyAuthenticationScheme(options, rsn) {
    return Object.assign(options, {
      form: {
        grant_type: this.hostConfig.grant_type,
        assertion: this.getAssertion(rsn)
      }
    });
  }

  /**
     * @private
     * @returns {string}
     */
    getAssertion(rsn) {
        const { scope, ods, aud, usr, sub, iss, azp } = this.hostConfig.assertion;

        const iat = new Date().getTime() / 1000;
        const exp = iat + 3600;

        const jwtAssertion = {
            iss,
            scope,
            aud,
            ods,
            usr,
            sub,
            rsn,
            exp,
            iat,
            azp,
            jti: uuid.v4(),
        };

        return JSON.stringify(jwtAssertion);
    }
}

module.exports = ClientCredentialsGrantProvider;