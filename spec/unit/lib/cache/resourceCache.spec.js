/*

 ----------------------------------------------------------------------------
 | ripple-fhir-service: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
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
const { ResourceCache } = require('@lib/cache');

describe('lib/cache/resourceCache', () => {
  let ctx;

  let qewdSession;
  let resourceCache;

  function seeds() {
    qewdSession.data.$(['Fhir', 'MedicationStatement']).setDocument({
      'by_uuid': {
        '550b6681-9160-4543-9d1e-46f220a6cd79': {
          data: {
            foo: 'bar'
          },
          'practitioner': 'bb64855d-e99d-403c-9e8a-b4c8ce30c345',
          'organization': 'd4003300-c671-4a14-974b-02bceeddd8e5'
        }
      }
    });

    qewdSession.data.$(['Fhir', 'MedicationStatement']).setDocument({
      'by_query': {
        'testquery=true': {
          data: {
            foo: 'bar'
          },
          'practitioner': 'bb64855d-e99d-403c-9e8a-b4c8ce30c345'
        }
      }
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    resourceCache = new ResourceCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = ResourceCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(ResourceCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.byUuid).toEqual(jasmine.any(Object));
    });
  });

  describe('byUuid', () => {
    let resourceName;
    let uuid;

    beforeEach(() => {
      resourceName = 'MedicationStatement';
      uuid = '550b6681-9160-4543-9d1e-46f220a6cd79';
    });

    describe('#exists', () => {
      it('should return false', () => {
        const expected = false;

        const actual = resourceCache.byUuid.exists(resourceName, uuid);

        expect(actual).toEqual(expected);
      });

      it('should return true', () => {
        const expected = true;

        seeds();
        const actual = resourceCache.byUuid.exists(resourceName, uuid);

        expect(actual).toEqual(expected);
      });
    });

    describe('#set', () => {
      it('should set resource data', () => {
        const expected = {
          quux: 'quuz'
        };

        const resource = {
          quux: 'quuz'
        };
        resourceCache.byUuid.set(resourceName, uuid, resource);

        const actual = qewdSession.data.$(['Fhir', resourceName, 'by_uuid', uuid, 'data']).getDocument();
        expect(actual).toEqual(expected);
      });

      it('should ignore settings resource data', () => {
        const expected = {
          foo: 'bar'
        };

        seeds();

        const resource = {
          quux: 'quuz'
        };
        resourceCache.byUuid.set(resourceName, uuid, resource);

        const actual = qewdSession.data.$(['Fhir', resourceName, 'by_uuid', uuid, 'data']).getDocument();
        expect(actual).toEqual(expected);
      });
    });

    describe('#getRelatedUuid', () => {
      it('should get id of related resource', () => {
        const expected = 'd4003300-c671-4a14-974b-02bceeddd8e5';

        seeds();

        const actual = resourceCache.byUuid.getRelatedUuid(resourceName, uuid, 'organization');
      
        expect(actual).toEqual(expected);
      });
    });

    describe('#existsRelatedUuid', () => {
      it('should return true when related resource exists', () => {
        const expected = true;

        seeds();

        const actual = resourceCache.byUuid.existsRelatedUuid(resourceName, uuid, 'organization');
      
        expect(actual).toEqual(expected);
      });

      it('should return false when related resource does not exists', () => {
        const expected = false;

        qewdSession.data.$(['Fhir', 'MedicationStatement']).setDocument({
          'by_uuid': {
            '550b6681-9160-4543-9d1e-46f220a6cd79': {
              data: {
                foo: 'bar'
              },
              'practitioner': 'bb64855d-e99d-403c-9e8a-b4c8ce30c345'
            }
          }
        });

        const actual = resourceCache.byUuid.existsRelatedUuid(resourceName, uuid, 'organization');
      
        expect(actual).toEqual(expected);
      });
    });

    describe('#setRelatedUuid', () => {
      it('should set resource related uuid', () => {
        const expected = 'a87da744-d4f5-42e1-accf-47a3af77dcfc';

        resourceCache.byUuid.setRelatedUuid(resourceName, uuid, 'test', 'a87da744-d4f5-42e1-accf-47a3af77dcfc');

        const actual = resourceCache.byUuid.getRelatedUuid(resourceName, uuid, 'test');

        expect(actual).toEqual(expected);
      });
    });

    describe('#get', () => {
      it('should get resource data', () => {
        const expected = {
          foo: 'bar'
        };

        seeds();
        const actual = resourceCache.byUuid.get(resourceName, uuid);

        expect(actual).toEqual(expected);
      });
    });

    describe('#setPractitionerUuid', () => {
      it('should set practitioner uuid', () => {
        const expected = {
          'practitioner': 'bb64855d-e99d-403c-9e8a-b4c8ce30c345'
        };

        const practitionerUuid = 'bb64855d-e99d-403c-9e8a-b4c8ce30c345';
        resourceCache.byUuid.setPractitionerUuid(resourceName, uuid, practitionerUuid);

        const actual = qewdSession.data.$(['Fhir', resourceName, 'by_uuid', uuid]).getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#getPractitionerUuid', () => {
      it('should get practitioner uuid', () => {
        const expected = 'bb64855d-e99d-403c-9e8a-b4c8ce30c345';

        seeds();

        const actual = resourceCache.byUuid.getPractitionerUuid(resourceName, uuid);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('#byQuery', () => {
    let resourceName;
    let query;

    beforeEach(() => {
      resourceName = 'MedicationStatement';
      query = 'testquery=true';
    });

    describe('#exists', () => {
      it('should return false', () => {

        const falseyQuery = 'testquery=false';
        
        const expected = false;

        const actual = resourceCache.byQuery.exists(resourceName, falseyQuery);

        expect(actual).toEqual(expected);
      });

      it('should return true', () => {
        const expected = true;

        seeds();
        const actual = resourceCache.byQuery.exists(resourceName, query);

        expect(actual).toEqual(expected);
      });
    });

    describe('#set', () => {
      it('should set resource data', () => {
        const expected = {
          quux: 'quuz'
        };

        const resource = {
          quux: 'quuz'
        };
        resourceCache.byQuery.set(resourceName, query, resource);

        const actual = qewdSession.data.$(['Fhir', resourceName, 'by_query', query, 'data']).getDocument();
        expect(actual).toEqual(expected);
      });

      it('should ignore settings resource data', () => {
        const expected = {
          foo: 'bar'
        };

        seeds();

        const resource = {
          quux: 'quuz'
        };
        resourceCache.byQuery.set(resourceName, query, resource);

        const actual = qewdSession.data.$(['Fhir', resourceName, 'by_query', query, 'data']).getDocument();
        expect(actual).toEqual(expected);
      });
    });

    describe('#get', () => {
      it('should get resource data', () => {
        const expected = {
          foo: 'bar'
        };

        seeds();
        const actual = resourceCache.byQuery.get(resourceName, query);

        expect(actual).toEqual(expected);
      });
    });
  });
});
