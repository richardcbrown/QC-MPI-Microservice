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

const { logger } = require('../core');
const debug = require('debug')('ripple-fhir-service:commands:get-policies');

class GetPatientConsentCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @return {Promise.<Object>}
   */
  async execute(policyName) {
    logger.info('commands/getPolicies|execute');

    try {

      const { resourceService } = this.ctx.services;

      const policyResult = await resourceService.fetchResources('Policy', { name: policyName }, true);

      const policyResources = policyResult.resource.entry
        .filter((e) => e.resource.resourceType === 'Policy')
        .map((e) => e.resource);

      const response = {
        ok: true,
        resources: policyResources
      };

      return response;
    } catch (error) {

      throw(error);
    }
  }
}

module.exports = GetPatientConsentCommand;
