import * as React from "react";

import { appConfig } from "./config"

interface Props {
  params: any;
}

export const LaunchComponent: React.FC<Props> = (props) => {

  const onEpicConnect = async (event: any): Promise<any> => {
    // launched through EPIC, 'iss' and 'launch' passed in from from props.param
    let searchParams = new URLSearchParams(props.params);
    for (let p of searchParams) {
      console.log(p);
    }
    // "iss", "https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/R4"
    // "launch": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ1cm46ZXBpYzphcHBvcmNoYXJkOmN1cnByZCIsImNsaWVudF9pZCI6ImJlMWFhODdiLTcxYjgtNDFkZS1hYzBkLTNlZDc…"

    // Retrieves the Conformance Statement or SMART Configuration
    let configUrl = searchParams.get('iss') + '/.well-known/smart-configuration';
    console.log('fetch SMART configuration from ' + configUrl)
    const response1 = await fetch(configUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const smartConfig = await response1.json();
    console.log('response ' + JSON.stringify(smartConfig));
    //  {
    //    "authorization_endpoint":"/oauth2/authorize",
    //    "token_endpoint":"/oauth2/token",
    //    "token_endpoint_auth_methods_supported":[
    //      "client_secret_post",
    //      "client_secret_basic",
    //      "private_key_jwt"],
    //    "scopes_supported":[
    //      "epic.scanning.dmsusername",
    //      "fhirUser",
    //      "launch",
    //      "openid",
    //      "profile"],
    //    "response_types_supported":[
    //      "code"],
    //    "capabilities":[
    //      "launch-ehr",
    //      "launch-standalone",
    //      "client-public",
    //      "client-confidential-symmetric",
    //      "context-banner",
    //      "context-style",
    //      "context-ehr-patient",
    //      "context-ehr-encounter",
    //      "context-standalone-patient",
    //      "permission-offline",
    //      "permission-patient",
    //      "permission-user",
    //      "sso-openid-connect"]
    // }

    // reqeust authorization code
    let state = {
      token_endpoint: smartConfig.token_endpoint,
    }
    let params = {
      scope: 'launch',
      response_type: 'code',
      redirect_uri: appConfig.RedirectUri, //'http://74.105.141.196:8080/redirect',
      client_id: 'be1aa87b-71b8-41de-ac0d-3ed78c558899',
      launch: searchParams.get('launch'),
      state: Buffer.from(JSON.stringify(state)).toString('base64'),
      aud: searchParams.get('iss')
      // aud: 'urn:epic:apporchard.curprod'
    }
    window.location.href = smartConfig.authorization_endpoint + '?' + new URLSearchParams(params);

    // let response2 = await fetch(smartConfig.authorization_endpoint + '?' + new URLSearchParams(params));
    // console.log(response2.body);
  };

  return (
    <>
      <button onClick={onEpicConnect}>Get authroization code from AppOrchard</button>
    </>
  );
};
