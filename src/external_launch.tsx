import * as React from "react";

interface Props {
  params: any;
}

export const ExternalLaunchComponent: React.FC<Props> = (props) => {

  React.useEffect(() => {
    onEpicConnect();
  },[]);

  const onEpicConnect = async (): Promise<any> => {
    let authUrl = appConfig.OAuthBaseUri + '/authorize';//'https://apporchard.epic.com/interconnect-aocurprd-oauth/oauth2/authorize'

    // reqeust authorization code
    let state = {
      token_endpoint: appConfig.OAuthBaseUri + '/token',//https://apporchard.epic.com/interconnect-aocurprd-oauth/oauth2/token',
    }
    let params = {
      response_type: 'code',
      redirect_uri: appConfig.RedirectUri,//'http://74.105.141.196:8080/redirect',
      client_id: appConfig.ClientId,//'be1aa87b-71b8-41de-ac0d-3ed78c558899',
      state: Buffer.from(JSON.stringify(state)).toString('base64'),
      scope: 'launch/patient',
      aud: appConfig.FhirBaseUri//'https://apporchard.epic.com/interconnect-aocurprd-oauth/api/FHIR/R4'
    }
    // const response1 = await fetch(authUrl + '?' + new URLSearchParams(params));
    window.location.href = authUrl + '?' + new URLSearchParams(params);
  };

  return (
    <>
      {/* <button onClick={onEpicConnect}>Get authroization code from AppOrchard</button> */}
    </>
  );
};
