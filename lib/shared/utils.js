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
const { ResourceName } = require('./enums');

function getPractitionerRef(resource) {

  let practitionerReference = null;

  if (resource.resourceType === ResourceName.PATIENT) {

    if (resource.generalPractitioner) {
      
      resource.generalPractitioner.forEach((practitionerItem) => {
        
        if (!practitionerItem.reference) return;

        const reference = parseRef(practitionerItem.reference);

        if (reference.resourceName === ResourceName.PRACTITIONER) {
          practitionerReference = practitionerItem.reference;
        }
      });
    }
  }

  return practitionerReference;
}

function lazyLoadAdapter(target) {
  if (!target.initialise) {
    throw new Error('target must has initialise method defined.');
  }

  return new Proxy(target, {
    get: (obj, prop) => {
      if (typeof prop === 'symbol' || prop === 'inspect' || Reflect.has(obj, prop)) {
        return Reflect.get(obj, prop);
      }

      Reflect.set(obj, prop, obj.initialise(prop));

      return obj[prop];
    }
  });
}

function parseRef(reference, { separator = '/' } = {}) {
  const pieces = reference.split(separator);
  const resourceName = pieces[0];
  const uuid = pieces[1];

  return {
    resourceName,
    uuid
  };
}

/**
 * Checks if period for name/address is valid
 * @param {string} period 
 * @returns {boolean}
 */
function isActive(period) {
  if (!period) return true;

  let valid = true;

  const currentDate = new Date().getTime();

  if (period.start && new Date(period.start).getTime() > currentDate) {
    valid = false;
  }

  if (period.end && new Date(period.end).getTime() < currentDate) {
    valid = false;
  }

  return valid;
}

//@TODO Re check functionality for correct spaces
function parseName(name) {

  let primaryName = null;

  if (Array.isArray(name) && name.length) {
    primaryName = name.find((nameItem) => {
      return nameItem.use === 'official'
        && isActive(nameItem.period);
    });

    if (!primaryName) {
      primaryName = name.find((nameItem) => {
        return nameItem.use !== 'old' 
          && nameItem.use !== 'temp'
          && isActive(nameItem.period);
      });
    }
  }

  if (!primaryName) return null;

  let initName = primaryName && primaryName.text 
    ? primaryName.text
    : null;

  if (!initName) {
    if(primaryName.given) {
      initName = getName(primaryName.given);
    }

    if (primaryName.family) {
      initName = Array.isArray(primaryName.family)
        ? getName(primaryName.family)
        : `${initName} ${primaryName.family}`;
    }
  }

  return initName;
}

function getName(nameObj) {
  let name;

  Array.isArray(nameObj)
    ? nameObj.forEach(n => name = name ? `${name} ${n}` : `${n}`)
    : name = nameObj;

  return name;
}

function getOrganisationRef(resource) {
  
  let organisationRef = null;

  if (resource
    && resource.resourceType === ResourceName.PRACTITIONERROLE 
    && resource.organization) {

    organisationRef = resource.organization.reference;
  }

  return organisationRef;
}

//@TODO package this piece of code
function parseAddress(addressArray, addressUse) {

  if (!addressArray || !addressArray.length) {
    return null;
  }

  let mainAddress = addressArray.find((addr) => { 
    return addr.use === addressUse 
      && isActive(addr.period);
  });

  if (!mainAddress) {
    mainAddress = addressArray[0];
  }

  if (mainAddress) {

    if (mainAddress.text) {
      return mainAddress.text;
    }

    const { line, city, district, state, postalCode, country } = mainAddress;
  
    let addressComponents = [];

    if (line && line.length) {
      addressComponents = addressComponents.concat(line.map((l) => String(l).trim()));
    }

    if (city) {
      addressComponents.push(String(city).trim());
    }

    if (district) {
      addressComponents.push(String(district).trim());
    }

    if (state) {
      addressComponents.push(String(state).trim());
    }

    if (country) {
      addressComponents.push(String(country).trim());
    }

    if (postalCode) {
      addressComponents.push(String(postalCode).trim());
    }

    if (addressComponents.length) {
      return addressComponents.join(', ');
    }
  }

  return null;
}

function parseTelecom(telecomArray) {
  
  let blankTelecom = null;

  if (!telecomArray || !Array.isArray(telecomArray)) return blankTelecom;

  const filteredTelecoms = telecomArray.filter((tel) => {
    
    if(tel.system !== 'phone' || tel.use === 'old') return false;
    
    return isActive(tel.period);
  });

  if (!filteredTelecoms.length) return blankTelecom;

  let primaryTelecom = filteredTelecoms.find((tel) => tel.use === 'home' && tel.value && tel.value !== 'Not Recorded');

  if (!primaryTelecom) {
    primaryTelecom = filteredTelecoms.find((tel) => tel.use === 'mobile' && tel.value && tel.value !== 'Not Recorded');
  }

  if (!primaryTelecom) {
    primaryTelecom = filteredTelecoms.find((tel) => !tel.use && tel.value && tel.value !== 'Not Recorded');
  }

  if (!primaryTelecom) return blankTelecom;

  return primaryTelecom.value;
}

/**
 * Maps query parameters to FHIR search string
 *
 * @param  {string} resourceType
 * @param  {Object} queryParams
 * @param  {Object} searchConfig
 * @return {string}
 */
function mapQuery(resourceType, queryParams, searchConfig) {
  let searchMap = {};

  searchMap[resourceType] = queryParams;

  const queryMap = transform(searchConfig[resourceType], searchMap);

  const queryComponents = [];

  Object.getOwnPropertyNames(queryMap).forEach((component) => {
    queryComponents.push(queryMap[component]);
  });

  const query = queryComponents.join('&');

  if (!query) {
    throw Error(`Error mapping query ${ queryParams } for resourceType ${ resourceType }`);
  }

  return query;
}

module.exports = {
  getPractitionerRef,
  lazyLoadAdapter,
  parseRef,
  getOrganisationRef,
  parseName,
  parseAddress,
  parseTelecom,
  mapQuery
};
