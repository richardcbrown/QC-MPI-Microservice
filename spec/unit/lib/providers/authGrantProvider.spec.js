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

const { ExecutionContextMock } = require('@tests/mocks');
const ClientCredentialsGrantProvider = require('@lib/providers/clientCredentialsGrantProvider');
const JwtBearerGrantProvider = require('@lib/providers/jwtBearerGrantProvider');
const AuthGrantProvider = require('@lib/providers/authGrantProvider');

describe('lib/providers/clientCredentialsGrantProvider', () => {
  let ctx;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance of ClientCredentialsGrantProvider', async () => {
      ctx.globalConfig.auth.grant_type = 'client_credentials';

      const actual = AuthGrantProvider.create(ctx, ctx.globalConfig.auth);

      expect(actual).toEqual(jasmine.any(ClientCredentialsGrantProvider));
    });

    it('should initialize a new instance of JwtBearerGrantProvider', async () => {
      ctx.globalConfig.auth.grant_type = 'urn:ietf:params:oauth:grant-type:jwt-bearer';

      const actual = AuthGrantProvider.create(ctx, ctx.globalConfig.auth);

      expect(actual).toEqual(jasmine.any(JwtBearerGrantProvider));
    });

    it('should throw an error with an invalid grant_type', () => {
      ctx.globalConfig.auth.grant_type = 'not_valid';

      expect(() => AuthGrantProvider.create(ctx, ctx.globalConfig.auth)).toThrow(new Error('Invalid grant_type: not_valid, check configuration file.'));
    });
  });
});