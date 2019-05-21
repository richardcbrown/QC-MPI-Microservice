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
const { Role } = require('../shared/enums');
const P = require('bluebird');

class PostPatientConsentCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @return {Promise.<Object>}
   */
  async execute(consent) {
    logger.info('commands/postPatientConsent|execute');

    try {

      let patientId;

      if (this.session.role === Role.PHR_USER) {
        patientId = this.session.nhsNumber;
      }

      if (process.env.node_env === 'development') {
        patientId = 6666666666; //@TODO IMPORTANT TO REMOVE AFTER GOING TO LIVE !!!!!!!!!!!!!
      }

      logger.info('CONSENTS');
      logger.info(consent);

      const { resourceService } = this.ctx.services;

      const patientResult = await resourceService.fetchResources('Patient', { nhsNumber: patientId }, true);

      const patient = patientResult.resource.entry.filter((e) => e.resource.resourceType === 'Patient')[0];
      
      const consents = [];

      consent.forEach((c) => {
        consents.push({
          resourceType: 'Consent',
          policyRule: `Policy/${ c.id }`,
          patient: {
            reference: `Patient/${ patient.resource.id }`
          },
          consentingParty: [{
            reference: `Patient/${ patient.resource.id }`
          }]
        });
      });

      console.log("CONSTENT")
      console.log(JSON.stringify(consents));

      await P.each(consents, async (c) => {
        await resourceService.postResource('Consent', c);
      });

      const response = {
        ok: true
      };

      return response;
    } catch (error) {

      throw(error);
    }
  }
}

module.exports = PostPatientConsentCommand;
