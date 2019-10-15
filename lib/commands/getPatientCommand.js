/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | http://www.synanetics.com                                                |
 | Email: support@synanetics.com                                            |
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

  09 Oct 2019

*/

'use strict';

const { BadRequestError } = require('../errors');
const { logger } = require('../core');
const { isPatientIdValid } = require('../shared/validation');
const { Role } = require('../shared/enums');
const debug = require('debug')('ripple-fhir-service:commands:get-patient-consent');

class GetPatientCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @return {Promise.<Object>}
   */
  async execute(patientId) {
    logger.info('commands/patient|execute', { patientId });

    debug('role: %s', this.session.role);

    if (this.session.role === Role.PHR_USER) {
      patientId = this.session.nhsNumber;
    }

    const patientValid = isPatientIdValid(patientId);
    if (!patientValid.ok) {
      throw new BadRequestError(patientValid.error);
    }

    if (process.env.node_env === 'development') {

      const { nhsNumberMapping } = this.ctx.userDefined.globalConfig;

      if (nhsNumberMapping && nhsNumberMapping[`${ patientId }`]) {
        patientId = nhsNumberMapping[`${ patientId }`];
      }
    }

    try {

      const { resourceService } = this.ctx.services;
      
      const patientResult = await resourceService.fetchResources('Patient', { nhsNumber: patientId }, true);

      const patient = patientResult.resource.entry.filter((e) => e.resource.resourceType === 'Patient')[0];

      if (!patient) {
        throw Error('patient_notfound');
      }

      const response = {
        ok: true,
        resources: patient
      };

      return response;
    } catch (error) {

      throw(error);
    }
  }
}

module.exports = GetPatientCommand;