# QC-MPI-Microservice
Qewd-Courier (QC) oriented Master Patient Index (MPI) MicroService (MS) - for use within Qewd-Courier

## fhir_service.config.json

The fhir_service config contains the following properties:

```
{
  "auth": {
    "host": "https://<AuthEndpoint>",
    "path": "/AuthService/oauth/token",
    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "client_id": "ClientId",
    "client_secret": "ClientSecret",
    "expires": 3600,
    "assertion": {
      "iss": "Helm",
      "aud": "YHCR",
      "ods": "ODS",
      "scope": "fhir.read",
      "src": "ODS"
    }
  },
  "api": {
    "host": "https://<FhirEndpoint>/FHIRService"
  },
  rejectUnauthorized: true
}
```

The rejectUnauthorized property allows the service to connect to servers using self-signed certificates (e.g. test/staging servers without valid SSL certificates). If the property is set to true, or omitted completely, the service will reject connections to servers that do not have valid certificates. It should be set to false only for testing environments.

grant_type can be one of two options: client_credentials or urn:ietf:params:oauth:grant-type:jwt-bearer

When the grant_type is set to urn:ietf:params:oauth:grant-type:jwt-bearer, a private key file named privateKey.key must be placed in the configuration folder.

The private key is used to sign a jwt assertion to exchange for a token.

The following assertion properties can be configured:

```
iss is the application that created the assertion.
aud is the destination (in this case an ensemble test server)
ods should be the ods code of your organization.
src is an identifier to track where the request has come from – this is probably best set to the ods code for now.
sub is the actual userid of the assertion.
roles is a space separated list of roles assigned to the user.
scope is a space separated list of privileges assigned to the user.
 - fhir.read (to read fhir resources).
 - fhir.create, fhir.update and fhir.patch to create and update fhir resources.
```

## templates/fhirservice_to_pulsetile.json

This file can be used to alter the mappings of fhir_client demographics to PulseTile format.