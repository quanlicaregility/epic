import * as React from "react";

import { appConfig } from "./config"

interface Props {
  params: any;
}

export const LaunchComponent: React.FC<Props> = (props) => {

  React.useEffect(() => {
    // onEpicConnect();
  },[]);

  const onEpicConnect = async (): Promise<any> => {
    // launched through EPIC, 'iss' and 'launch' passed in from from props.param
    let searchParams = new URLSearchParams(props.params);
    for (let p of searchParams) {
      console.log(p);
    }
    
    // Retrieves the Conformance Statement or SMART Configuration
    let configUrl = searchParams.get('iss') + '/.well-known/smart-configuration';
    console.log('fetch SMART configuration from ' + configUrl)
    const smartConfigResp = await fetch(configUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const smartConfig = await smartConfigResp.json();
    console.log('response ' + JSON.stringify(smartConfig));

    // reqeust authorization code
    let state = {
      token_endpoint: smartConfig.token_endpoint,
    }
    let params = {
      scope: 'launch',
      response_type: 'code',
      redirect_uri: appConfig.RedirectUri,
      client_id: appConfig.ClientId,
      launch: searchParams.get('launch'),
      state: Buffer.from(JSON.stringify(state)).toString('base64'),
      aud: searchParams.get('iss')
    }
    window.location.href = smartConfig.authorization_endpoint + '?' + new URLSearchParams(params);

    // let authResp = await fetch(smartConfig.authorization_endpoint + '?' + new URLSearchParams(params));
    // let authRespBody = await authResp.text();
    // let doc = await new DOMParser().parseFromString(authRespBody, 'text/html');
    // console.log(doc.getElementById('redirectUrl').getAttribute('data-value'));
  };

  return (
    <>
      <button onClick={onEpicConnect}>Get authroization code from AppOrchard</button>
    </>
  );
};
