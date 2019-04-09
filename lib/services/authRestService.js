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

  14 March 2019

*/

'use strict';

const jwt = require('jwt-simple');
const request = require('request');
const uuidv4 = require('uuid/v4');
const { logger } = require('../core');
const debug = require('debug')('ripple-fhir-service:services:resource-rest');

function requestAsync(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {

      if (err) return reject(err);

      if (response.statusCode === 403) return reject(body);

      debug('body: %j', body);

      return resolve(body);
    });
  });
}

/**
 * Fhir API Auth REST service
 */
class AuthRestService {
  constructor(ctx, hostConfig) {
    this.ctx = ctx;
    this.hostConfig = hostConfig;
  }

  static create(ctx) {

    return new AuthRestService(ctx, ctx.globalConfig.auth);
  }

  /**
   * Sends a request to get token
   *
   * @return {Promise.<Object>}
   */
  async authenticate() {
    logger.info('services/authRestService|authenticate');

    let options = {};

    if (this.hostConfig.grant_type === 'client_credentials') {
      options = {
        url: `${this.hostConfig.host + this.hostConfig.path}`,
        method: 'POST',
        form: {
          grant_type: this.hostConfig.grant_type
        },
        headers: {
          'authorization': `Basic ${ Buffer.from(this.hostConfig.client_id + ':' + this.hostConfig.client_secret).toString('base64') }`
        },
        json: true
      };
    }

    if (this.hostConfig.grant_type === 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
      options = this.getOptionsForJwtBearerGrant(this.ctx.session, uuidv4(), new Date());
    }

    debug('options: %j', options);

    return requestAsync(options);
  }

  /**
   * Generates options for jwt bearer grant_type
   * @param {Object} session
   * @param {String} jwtId
   * @param {Date} issuedAt
   * 
   * @return {Object}
   */
  getOptionsForJwtBearerGrant(session, jwtId, issuedAt) {

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

    return {
      url: `${this.hostConfig.host + this.hostConfig.path}`,
      method: 'POST',
      form: {
        grant_type: this.hostConfig.grant_type,
        assertion: `${ jwt.encode(assertion, this.hostConfig.privateKey, 'RS256') }`
      },
      headers: {
        'authorization': `Basic ${ Buffer.from(this.hostConfig.client_id + ':' + this.hostConfig.client_secret).toString('base64') }`
      },
      json: true
    };
  }
}

module.exports = AuthRestService;
