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

describe('lib/providers/clientCredentialsGrantProvider', () => {
  let ctx;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    ctx.globalConfig.auth.grant_type = 'client_credentials';
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = ClientCredentialsGrantProvider.create(ctx.globalConfig.auth);

      expect(actual).toEqual(jasmine.any(ClientCredentialsGrantProvider));
    });
  });

  describe('#applyAuthenticationScheme', () => {
    it('should apply the authentication scheme', () => {

      const provider = new ClientCredentialsGrantProvider(ctx.globalConfig.auth);

      const options = {
        url: 'https://test:444/AuthService/oauth/token',
        method: 'POST',
        headers: {
          authorization: `Basic ${ Buffer.from('clientId:clientSecret').toString('base64') }`
        },
        json: true
      };

      const actual = provider.applyAuthenticationScheme(options);

      expect(actual.form.grant_type).toEqual('client_credentials');
    });
  });
});