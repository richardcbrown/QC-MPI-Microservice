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

const transform = require('qewd-transform-json').transform;
const pulseTileTransform = require('../templates/fhirservice_to_pulsetile');
const { logger } = require('../core');
const { ResourceName } = require('../shared/enums');
const { parseName, parseAddress, parseTelecom, parseEmail, parseResolved } = require('../shared/utils');
const debug = require('debug')('ripple-fhir-service:services:demographic');

class DemographicService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new DemographicService(ctx);
  }

  /**
   * Gets demographic data by NHS number
   *
   * @param  {int|string} nhsNumber
   * @return {Object}
   */
  getByPatientId(nhsNumber) {
    logger.info('services/demographicService|getByPatientId', { nhsNumber });

    const { patientCache, resourceCache, demographicCache } = this.ctx.cache;

    let patientUuid;
    let patient = null;

    if (patientCache.byNhsNumber.exists(nhsNumber)) {
      patientUuid = patientCache.byNhsNumber.getPatientUuid(nhsNumber);
      patient = patientCache.byPatientUuid.get(patientUuid);
    }

    if (!patient) {
      throw Error('Patient not found.');
    }

    let practitionerOrganisation = {};
    
    const practitionerOrgExists = resourceCache.byUuid.existsRelatedUuid(ResourceName.PATIENT, patientUuid, ResourceName.ORGANIZATION);

    if (practitionerOrgExists) {
      const practitionerOrganisationUuid = resourceCache.byUuid.getRelatedUuid(ResourceName.PATIENT, patientUuid, ResourceName.ORGANIZATION);
      practitionerOrganisation = resourceCache.byUuid.get(ResourceName.ORGANIZATION, practitionerOrganisationUuid);
    }

    const demographics = {};

    const gpDetails = {
      name: practitionerOrganisation && practitionerOrganisation.name || null,
      address: parseAddress(practitionerOrganisation.address, 'work') || null
    };

    function buildGpDetails(gpDetails) {
      let { name, address } = gpDetails;

      if (!name || !address) {
        return null;
      }

      name = name.trim();
      address = address.trim();

      if (!name || !address) {
        return null;
      }

      if (name && address) {
        return `${name}, ${address}`;
      }

      return name || address || null;
    }

    demographics.id = nhsNumber;
    demographics.nhsNumber = nhsNumber;
    demographics.gender = patient.gender || 'Not known';
    demographics.telephone = parseTelecom(patient.telecom) || 'Not known';
    demographics.email = parseEmail(patient.telecom) || 'Not known';
    demographics.name = parseName(patient.name) || 'Not known';
    demographics.dateOfBirth = new Date(patient.birthDate).getTime();
    demographics.gpName = gpDetails.name || 'Not known';
    //@TODO should address be parsed too?
    demographics.gpAddress = gpDetails.address || 'Not known';
    demographics.gpFullAddress = buildGpDetails(gpDetails) || 'Not known';
    demographics.address = parseAddress(patient.address, 'home') || 'Not known';
    demographics.resolved = parseResolved(patient);

    debug('demographics: %j', demographics);

    const resultObj = {
      demographics: transform(pulseTileTransform, demographics)
    };

    if (demographics.resolved && practitionerOrgExists) {
      //@TODO Talk regarding this functionality
      demographicCache.byNhsNumber.set(nhsNumber, resultObj);
    }
    
    return resultObj;
  }
}

module.exports = DemographicService;
