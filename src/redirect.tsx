import * as React from "react";

import { appConfig } from "./config"

interface Props {
  params: string;
}

export const RedirectComponent: React.FC<Props> = (props) => {
  const [accessToken, setAccessToken] = React.useState('');
  const [patient, setPatient] = React.useState('eh2xYHuzl9nkSFVvV3osUHg3');
  const [encounter, setEncounter] = React.useState('e0ggGu.zl1Vy3W24lGS2BXg3');

  const onEpicConnect = async (event: any): Promise<any> => {
    let searchParams = new URLSearchParams(props.params);
    let authorization_code = searchParams.get('code');
    let state = Buffer.from(searchParams.get('state'), 'base64').toString();
    console.log('code: ' + authorization_code);
    console.log('state: ' + state)
    let stateVar = JSON.parse(state);

    let tokenUrl = stateVar.token_endpoint;
    let params = {
      grant_type: 'authorization_code',
      code: authorization_code,
      redirect_uri: appConfig.RedirectUri,//'http://74.105.141.196:8080/redirect',
      client_id: 'be1aa87b-71b8-41de-ac0d-3ed78c558899',
    }
    const response1 = await fetch(tokenUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(params)
    });
    const body = await response1.json();
    console.log(body)
    setAccessToken(body.access_token)
    if (body.patient != null) {
      setPatient(body.patient);
    }
    if (body.patient != null) {
      setEncounter(body.encounter);
    }
  };

  const onSubmit = async (event: any): Promise<any> => {
    let body = {
      resourceType: 'DocumentReference',
      docStatus: 'final',
      type: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '11488-4',
            display: `Consultation Note`
          }
        ],
        text: 'Consultation Note'
      },
      subject: {
        reference: 'Patient/' + patient,
      },
      content: [
        {
          attachment: {
            contentType: 'text/plain',
            data: Buffer.from('This is a test clinician note').toString('base64'),
          }
        }
      ],
      context: {
        encounter: [{
          reference: 'Encounter/' + encounter,
        }]
      }
    };

    console.log(body)

    const response = await fetch('https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/R4/DocumentReference', {
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    console.log('response ' + JSON.stringify(response));
  }

  return (
    <>
      <button onClick={onEpicConnect}>Get acess token from AppOrchard</button>
      <button onClick={onSubmit}>Submit</button>
    </>
  );};
