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

  18 March 2019

*/

'use strict';

const { 
  getPractitionerRef, 
  parseTelecom, 
  parseAddress,
  getOrganisationRef,
  parseName
} = require('@lib/shared/utils');

describe('ripple-cdr-lib/lib/shared/utils', () => {
  describe('#getPractitionerRef', () => {
    it('should return null if not Patient resource', () => {
      const notPatient = {
        resourceType: 'NotPatient',
      };

      const actual = getPractitionerRef(notPatient);

      expect(actual).toEqual(null);
    });

    it('should return null if no general practitioner', () => {
      const noPractitioner = {
        resourceType: 'Patient'
      };

      const actual = getPractitionerRef(noPractitioner);

      expect(actual).toEqual(null);
    });

    it('should return null if no practitioner reference', () => {
      const noPractitioner = {
        resourceType: 'Patient',
        generalPractitioner: [{ reference: 'NoPractitioner/c2414636-5e8a-4371-9ebd-9ee6ef46b00f' }]
      };

      const actual = getPractitionerRef(noPractitioner);

      expect(actual).toEqual(null);
    });

    it('should return practitioner reference', () => {
      const withPractitioner = {
        resourceType: 'Patient',
        generalPractitioner: [{ reference: 'Practitioner/c2414636-5e8a-4371-9ebd-9ee6ef46b00f' }]
      };

      const expected = 'Practitioner/c2414636-5e8a-4371-9ebd-9ee6ef46b00f';

      const actual = getPractitionerRef(withPractitioner);

      expect(actual).toEqual(expected);
    });
  });

  describe('#parseTelecom', () => {
    it('should return blank telecom when none provided', () => {
      const expected = null;

      const actual = parseTelecom();

      expect(actual).toEqual(expected);
    });

    it('should return blank telecom when no phone present', () => {
      const expected = null;

      const actual = parseTelecom([{ system: 'notphone', value: 'yyyy' }]);

      expect(actual).toEqual(expected);
    });

    it('should return blank telecom when only old phone present', () => {
      const expected = null;

      const actual = parseTelecom([{ system: 'phone', use: 'old', value: 'yyyy' }]);

      expect(actual).toEqual(expected);
    });

    it('should return blank telecom when phones have end present', () => {
      const expected = null;

      const actual = parseTelecom([{ system: 'phone', use: 'old', value: 'yyyy', period: { end: 'now' } }]);

      expect(actual).toEqual(expected);
    });

    it('should return blank telecom if not home or mobile use', () => {
      const expected = null;

      const actual = parseTelecom([{ system: 'phone', use: 'nothome', value: 'yyyy' }]);

      expect(actual).toEqual(expected);
    });

    it('should return blank telecom if no value present', () => {
      const expected = null;

      const actual = parseTelecom([
        { system: 'phone', use: 'home', value: 'Not Recorded' }, 
        { system: 'phone', use: 'mobile' }
      ]);

      expect(actual).toEqual(expected);
    });

    it('should return telecom', () => {
      const expected = '1234567890';

      const actual = parseTelecom([
        { system: 'phone', use: 'home', value: '1234567890' }
      ]);

      expect(actual).toEqual(expected);
    });
  });

  describe('#parseAddress', () => {
    it('should return null if no data passed', () => {
      const expected = null;

      const actual = parseAddress(null, 'home');

      expect(actual).toEqual(expected);
    });

    it('should return null if no address', () => {
      const expected = null;

      const actual = parseAddress([]);

      expect(actual).toEqual(expected);
    });

    it('should return null if address is not home address', () => {
      const expected = null;

      const actual = parseAddress([{ use: 'nothome' }], 'home');

      expect(actual).toEqual(expected);
    });

    it('should return null if address has end', () => {
      const expected = null;

      const actual = parseAddress([{ use: 'home', period: { end: 'now' } }], 'home');

      expect(actual).toEqual(expected);
    });

    it('should return null if address has no text', () => {
      const expected = null;

      const actual = parseAddress([{ use: 'home' }], 'home');

      expect(actual).toEqual(expected);
    });

    it('should return address', () => {
      const expected = 'address';

      const actual = parseAddress([{ use: 'home', text: 'address' }], 'home');

      expect(actual).toEqual(expected);
    });
  });

  describe('getOrganisationRef', () => {
    it('should return null if no data passed', () => {
      const expected = null;

      const actual = getOrganisationRef();

      expect(actual).toEqual(expected);
    });

    it('should return null if resource is not PracitionerRole', () => {
      const expected = null;

      const actual = getOrganisationRef({
        resourceType: 'NotPractitionerRole'
      });

      expect(actual).toEqual(expected);
    });

    it('should return null if no organization', () => {
      const expected = null;

      const actual = getOrganisationRef({
        resourceType: 'PractitionerRole'
      });

      expect(actual).toEqual(expected);
    });

    it('should return organization', () => {
      const expected = 'Organization/2dbf38ee-7c51-4cb4-a6ac-967e470c4dd2';

      const actual = getOrganisationRef({
        resourceType: 'PractitionerRole',
        organization: {
          reference: 'Organization/2dbf38ee-7c51-4cb4-a6ac-967e470c4dd2'
        }
      });

      expect(actual).toEqual(expected);
    });
  });

  describe('#parseName', () => {
    it('should return null if no data passed', () => {
      const expected = null;

      const actual = parseName();

      expect(actual).toEqual(expected);
    });

    it('should return null if no names', () => {
      const expected = null;

      const actual = parseName([]);

      expect(actual).toEqual(expected);
    });

    it('should return null if no official name', () => {
      const expected = null;

      const actual = parseName([{ use: 'notofficial' }]);

      expect(actual).toEqual(expected);
    });

    it('should return null if no active official name', () => {
      const expected = null;

      const actual = parseName([{ use: 'official', period: { end: 'now' } }]);

      expect(actual).toEqual(expected);
    });

    it('should return name from text', () => {
      const expected = 'patient name';

      const actual = parseName([{ use: 'official', text: 'patient name' }]);

      expect(actual).toEqual(expected);
    });

    it('should return name from components', () => {
      const expected = 'patient name';

      const actual = parseName([{ use: 'official', family: 'name', given: ['patient'] }]);

      expect(actual).toEqual(expected);
    });
  });
});