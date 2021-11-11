import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { Button, Container, FloatingLabel, Form, Stack } from "react-bootstrap";

import { appConfig } from "./config"

interface Props {
  params: string;
}

export const RedirectComponent: React.FC<Props> = (props) => {

  const [accessToken, setAccessToken] = React.useState('');
  const [patient, setPatient] = React.useState('eh2xYHuzl9nkSFVvV3osUHg3');
  const [encounter, setEncounter] = React.useState('e0ggGu.zl1Vy3W24lGS2BXg3');
  const [entries, setEntries] = React.useState([
    'placeholder 0',
    'placeholder 1',
    'placeholder 2',
    'placeholder 3',
    'placeholder 4',
    'placeholder 5',
    'placeholder 6',
    'placeholder 7',
    'placeholder 8',
    'placeholder 9'
  ])
  const [note, setNote] = React.useState('');

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
    console.log('response Location Header: ' + response.headers.get('Location'));
  }

  const onSearch = async (event: any): Promise<any> => {
    let params = {
      patient: patient,
      type: '11488-4',
      _count: '10'
    };
    const response = await fetch('https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/R4/DocumentReference?' + new URLSearchParams(params), {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    });
    console.log('search response Content-Type: ' + response.headers.get('Content-Type'));
    let body = await response.text();
    console.log('search response: ' + body);

    let doc = await new DOMParser().parseFromString(body, 'application/xml');
    console.log('data ' + doc);
    setEntries(Array.from(doc.getElementsByTagName('entry')).map(element => {
      let item = element.getElementsByTagName('fullUrl').item(0);
      if (item != null) {
        return item.getAttribute('value');
      }
      else {
        return null;
      }
      }));
  }

  const onGet = async (url: any): Promise<any> => {
    console.log(entries);

    let DocRefReadResponse = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    });

    let body = await DocRefReadResponse.text();
    let doc = new DOMParser().parseFromString(body, "application/xml");
    let res = doc.evaluate("//*/ns:content/ns:attachment/ns:url/@value", doc, function(prefix) {
        if (prefix === 'ns') {
          return 'http://hl7.org/fhir';
        } else {
          return null
        } 
      }, XPathResult.ANY_TYPE, null);
    let contentUrl = res.iterateNext()['value'];
    console.log('content ' + contentUrl);

    let binaryReadResponse = await fetch('https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/R4/' + contentUrl, {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    });

    let body2 = await binaryReadResponse.text();
    console.log(body2);
    setNote(body2);
  }

  const onEntryClicked = async (event: any): Promise<any> => {
    console.log(event);
    onGet(event);
  }

  const generateListItem = (max) => {
    const array = [];
    for (let i = 0; i < max; i ++) {
      array.push(<ListGroup.Item id={'entry' + i} action onClick={()=> onEntryClicked(entries[i])}>{entries[i]}</ListGroup.Item>)
    }

    return array;
  }

  return (
    <>
      <Stack gap={3}>
        <div id='buttons'>
          <Container fluid>
            <Button onClick={onEpicConnect}>Get acess token from AppOrchard</Button>{' '}
            <Button onClick={onSubmit}>Submit</Button>{' '}
            <Button onClick={onSearch}>Search</Button>{' '}
            <Button onClick={onGet}>Get</Button>
          </Container>
        </div>
        <div id='detail' style={{display: 'flex', justifyContent: 'center', width: '80%'}}>
          <Container fluid>
            <Stack direction="horizontal" gap={3}>
              <div id = "search" style={{width: '40%'}}>
                <ListGroup>
                  {generateListItem(10)}
                </ListGroup>
              </div>
              <div id = "get" style={{width: '40%', height: '100%'}}>
                <FloatingLabel controlId="floatingTextarea2" label="details" style={{ height: '100%' }}>
                  <Form.Control as="textarea" value={note} style={{ height: '100%' }}/>
                </FloatingLabel>
              </div>
            </Stack>
          </Container>
        </div>
      </Stack>
    </>
  );
};
