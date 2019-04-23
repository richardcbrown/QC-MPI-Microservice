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

  23 April 2019

*/

'use strict';

const fs = require('fs');
const jwt = require('jwt-simple');
const { ExecutionContextMock } = require('@tests/mocks');
const JwtBearerGrantProvider = require('@lib/providers/jwtBearerGrantProvider');

describe('lib/providers/jwtBearerGrantProvider', () => {
  let ctx;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    ctx.globalConfig.auth.privateKey = fs.readFileSync(__dirname + '/../../../support/testPrivateKey.pem');
    ctx.globalConfig.auth.grant_type = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
    ctx.session = {
      openid: {
        firstName: 'TestFN',
        lastName: 'TestLN'
      },
      role: 'TestRole',
      email: 'TestEmail'
    };
  });

  describe('#applyAuthenticationScheme', () => {
    it('should apply the authentication scheme', () => {

      const provider = new JwtBearerGrantProvider(ctx, ctx.globalConfig.auth);

      const options = {
        url: 'https://test:444/AuthService/oauth/token',
        method: 'POST',
        headers: {
          authorization: `Basic ${ Buffer.from('clientId:clientSecret').toString('base64') }`
        },
        json: true
      };

      const actual = provider.applyAuthenticationScheme(options);

      expect(actual.form.grant_type).toEqual('urn:ietf:params:oauth:grant-type:jwt-bearer');
    });
  });

  describe('#applyOptionsForJwtBearerGrant', () => {
    it('should return correct options for jwt bearer grant type', () => {

      const issuedAt = new Date();

      const assertion = {
        iss: 'T1',
        aud: 'T2',
        ods: 'T3',
        scope: 'T4',
        src: 'T5',
        jti: 'testjwtid',
        iat: issuedAt.getTime(),
        exp: issuedAt.getTime() + (3600 * 1000),
        username: 'TestFN TestLN',
        roles: 'TestRole',
        jobRole: 'TestRole',
        sub: 'TestEmail'
      };

      const expected = {
        url: 'https://test:444/AuthService/oauth/token',
        method: 'POST',
        form: {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt.encode(assertion, ctx.globalConfig.auth.privateKey, 'RS256')
        },
        headers: {
          authorization: `Basic ${ Buffer.from('clientId:clientSecret').toString('base64') }`
        },
        json: true
      };

      const provider = new JwtBearerGrantProvider(ctx, ctx.globalConfig.auth);

      const options = {
        url: 'https://test:444/AuthService/oauth/token',
        method: 'POST',
        headers: {
          authorization: `Basic ${ Buffer.from('clientId:clientSecret').toString('base64') }`
        },
        json: true
      };

      const actual = provider.applyOptionsForJwtBearerGrant(options, 'testjwtid', issuedAt);

      expect(actual).toEqual(expected);
    });
  });
});