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
 | Licensed under the Apache License, Version 2.0 (the 'License');          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an 'AS IS' BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  14 March 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const AuthRestService = require('@lib/services/authRestService');
const nock = require('nock');
const fs = require('fs');

describe('lib/services/authRestService', () => {
  let ctx;
  let authService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    authService = new AuthRestService(ctx, ctx.globalConfig.auth);
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = AuthRestService.create(ctx, ctx.globalConfig.auth);

      expect(actual).toEqual(jasmine.any(AuthRestService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  it('should return token', async () => {
    const expected = {
      access_token: 'foo.bar.baz'
    };

    nock('https://test:444', {
      reqheaders: {
        authorization: `Basic ${ Buffer.from('clientId:clientSecret').toString('base64') }`
      }})
      .post('/AuthService/oauth/token')
      .reply(200, {
        access_token: 'foo.bar.baz'
      });

    const actual = await authService.authenticate();

    expect(nock).toHaveBeenDone();
    expect(actual).toEqual(expected);
  });

  it('should return token for jwt-bearer grant type', async () => {
    const context = new ExecutionContextMock();
    context.globalConfig.auth.privateKey = fs.readFileSync(__dirname + '/../../../support/testPrivateKey.pem');
    context.globalConfig.auth.grant_type = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
    context.session = {
      openid: {}
    };

    const auth = new AuthRestService(context, context.globalConfig.auth);
    
    const expected = {
      access_token: 'foo.bar.baz'
    };

    nock('https://test:444', {
      reqheaders: {
        authorization: `Basic ${ Buffer.from('clientId:clientSecret').toString('base64') }`
      }})
      .post('/AuthService/oauth/token')
      .reply(200, {
        access_token: 'foo.bar.baz'
      });

    const actual = await auth.authenticate();

    expect(nock).toHaveBeenDone();
    expect(actual).toEqual(expected);
  });

  it('should throw unauthorised error', async () => {
    
    nock('https://test:444', {
      reqheaders: {
        authorization: `Basic ${ Buffer.from('clientId:clientSecret').toString('base64') }`
      }})
      .post('/AuthService/oauth/token')
      .reply(403, {
        error: 'invalid_client'
      });

    const actual = authService.authenticate();

    await expectAsync(actual).toBeRejectedWith({ error: 'invalid_client' });

    expect(nock).toHaveBeenDone();
  });

  it('should throw error', async () => {
    
    nock('https://test:444', {
      reqheaders: {
        authorization: `Basic ${ Buffer.from('clientId:clientSecret').toString('base64') }`
      }})
      .post('/AuthService/oauth/token')
      .replyWithError(500);

    const actual = authService.authenticate();

    await expectAsync(actual).toBeRejected();

    expect(nock).toHaveBeenDone();
  });
});
