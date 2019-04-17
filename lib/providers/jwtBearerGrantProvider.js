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

const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');

/**
 * Fhir Jwt Bearer Grant Provider
 */
class JwtBearerGrantProvider {

  constructor(ctx, hostConfig) {
    this.ctx = ctx;
    this.hostConfig = hostConfig;
  }

  static create(ctx, hostConfig) {
    return new JwtBearerGrantProvider(ctx, hostConfig);
  }

  applyAuthenticationScheme(options) {
    return this.applyOptionsForJwtBearerGrant(options, uuidv4(), new Date());
  }

  /**
   * Generates options for jwt bearer grant_type
   * @param {Object} session
   * @param {String} jwtId
   * @param {Date} issuedAt
   * 
   * @return {Object}
   */
  applyOptionsForJwtBearerGrant(options, jwtId, issuedAt) {

    const { session } = this.ctx;

    const { openid } = session;
    const notBefore = issuedAt.getTime();

    let userAssertions = {
      jti: jwtId,
      iat: notBefore,
      exp: notBefore + (this.hostConfig.expires * 1000),
    };

    if (openid && openid.firstName && openid.lastName) {
      userAssertions.username = `${openid.firstName} ${openid.lastName}`;
    } else {
      userAssertions.username = session.email;
    }

    userAssertions.roles = session.role;
    userAssertions.jobRole = session.role;
    userAssertions.sub = session.email;

    const assertion = Object.assign({ }, this.hostConfig.assertion, userAssertions);

    return Object.assign(options, {
      form: {
        grant_type: this.hostConfig.grant_type,
        assertion: `${ jwt.encode(assertion, this.hostConfig.privateKey, 'RS256') }`
      }
    });
  }
}

module.exports = JwtBearerGrantProvider;