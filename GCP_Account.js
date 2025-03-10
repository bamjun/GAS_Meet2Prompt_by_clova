const test_gcp_account_ = '';

// OAuth2 라이브러리를 사용해 서비스 계정 액세스 토큰을 생성하는 함수
function getServiceAccountToken(_private_key, _service_account_email) {
  var service = OAuth2.createService('MyServiceAccount')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(_private_key)
    .setIssuer(_service_account_email)
    .setPropertyStore(PropertiesService.getScriptProperties())
    // 필요한 범위를 설정합니다. 예: Cloud Platform 전체 권한
    .setScope('https://www.googleapis.com/auth/cloud-platform');
  
  if (service.hasAccess()) {
    return service.getAccessToken();
  } else {
    Logger.log("서비스 계정 인증 오류: " + service.getLastError());
    throw new Error("서비스 계정 액세스 토큰을 가져오지 못했습니다.");
  }
}



function getServiceAccountTokenaa(serviceAccountKey) {
  serviceAccountKey = SERVICE_ACCOUNT_JSON_KEY;
  try {
    const jwt = createJwt(serviceAccountKey);
    const token = fetchAccessToken(jwt); 
    Logger.log("토큰 획득 성공:" + token);
    return token;
  } catch (error) {
    Logger.log("토큰 획득 오류:" + error);
    throw error;
  }
}

function createJwt(serviceAccountKey) {
  const now = Math.floor(Date.now() / 1000);

  const scopes = [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/devstorage.read_write'
  ];


  const claimSet = {
    'iat': now,
    'exp': now + 3600,
    'iss': serviceAccountKey.client_email,
    'aud': 'https://oauth2.googleapis.com/token',
    'scope': scopes.join(' ')
  };

  const encodedHeader = Utilities.base64EncodeWebSafe(JSON.stringify({ 'alg': 'RS256', 'typ': 'JWT' }));
  const encodedPayload = Utilities.base64EncodeWebSafe(JSON.stringify(claimSet));
  const signatureInput = encodedHeader + '.' + encodedPayload;

  const signatureBytes = Utilities.computeRsaSha256Signature(signatureInput, serviceAccountKey.private_key);
  const encodedSignature = Utilities.base64EncodeWebSafe(signatureBytes);

  const jwt = signatureInput + '.' + encodedSignature;

  Logger.log("JWT 생성 완료:" + jwt); 
  return jwt;
}

function fetchAccessToken(jwt) {
  const payload = {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  };

  const options = {
    'method': 'post',
    'contentType': 'application/x-www-form-urlencoded',
    'payload': Object.keys(payload).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key])).join('&')
  };

  const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', options);
  Logger.log("응답 내용: " + response.getContentText());  // 디버깅용 로그 추가
  
  const data = JSON.parse(response.getContentText());

  if (!data.access_token) {
    Logger.log("엑세스 토큰 획득 실패: " + response.getContentText());
    throw new Error("엑세스 토큰을 가져오는 데 실패했습니다.");
  }

  return data.access_token;
}


// -0000000000000000000


function getServiceAccountToken1629() {
  var privateKey = PRIVATE_KEY;
  var clientEmail = SERVICE_ACCOUNT_EMAIL;
  var now = Math.floor(Date.now() / 1000);
  
  // JWT 생성
  var payload = {
    "iss": clientEmail,
    "sub": clientEmail,
    "aud": "https://oauth2.googleapis.com/token",
    "iat": now,
    "exp": now + 3600,
    "scope": "https://www.googleapis.com/auth/cloud-platform"
  };
  
  var header = {
    "alg": "RS256",
    "typ": "JWT"
  };
  
  // JWT 서명 생성 및 토큰 요청
  var jwt = Utilities.base64EncodeWebSafe(JSON.stringify(header)) + '.' +
            Utilities.base64EncodeWebSafe(JSON.stringify(payload)) + '.' +
            Utilities.base64EncodeWebSafe(Utilities.computeRsaSha256Signature(JSON.stringify(payload), privateKey));
  
  var options = {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    }
  };
  
  var response = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", options);
  var token = JSON.parse(response.getContentText()).access_token;
  return token;
}


// gffffffffffffffffff
function createJwt1655(serviceAccountKey) {
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    'iat': now,
    'exp': now + 3600,
    'iss': serviceAccountKey.client_email,
    'aud': 'https://oauth2.googleapis.com/token',
    'scope': 'https://www.googleapis.com/auth/cloud-platform'
  };

  const header = { 'alg': 'RS256', 'typ': 'JWT' };
  const encodedHeader = Utilities.base64EncodeWebSafe(JSON.stringify(header));
  const encodedPayload = Utilities.base64EncodeWebSafe(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // RSA 서명 생성
  const signatureBytes = Utilities.computeRsaSha256Signature(signatureInput, serviceAccountKey.private_key);
  const encodedSignature = Utilities.base64EncodeWebSafe(signatureBytes);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}


function getIdentityToken() {
  var serviceAccountKey = SERVICE_ACCOUNT_JSON_KEY;  // 서비스 계정 JSON 키 (Apps Script에 저장된 값)
  
  // JWT 생성
  // const jwt = createJwtForIdToken(serviceAccountKey);
  const jwt = createJwtgetIdentityToken(serviceAccountKey);

  // ID 토큰 요청
  const idToken = fetchIdToken(jwt);
  
  Logger.log("ID 토큰 생성 완료: " + idToken);
  return idToken;
}

function createJwtgetIdentityToken(serviceAccountKey) {
  const now = Math.floor(Date.now() / 1000);

  const claimSet = {
    'iat': now,
    'exp': now + 3600,
    'iss': serviceAccountKey.client_email,
    'aud': 'https://oauth2.googleapis.com/token',
    'scope': 'https://www.googleapis.com/auth/cloud-platform'
  };

  const header = { 'alg': 'RS256', 'typ': 'JWT' };
  const encodedHeader = Utilities.base64EncodeWebSafe(JSON.stringify(header));
  const encodedPayload = Utilities.base64EncodeWebSafe(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // 서명 생성
  const signatureBytes = Utilities.computeRsaSha256Signature(signatureInput, serviceAccountKey.private_key);
  const encodedSignature = Utilities.base64EncodeWebSafe(signatureBytes);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}


function createJwtForIdToken(serviceAccountKey) {
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    'iat': now,
    'exp': now + 3600,  // 만료 시간 1시간 설정
    'iss': serviceAccountKey.client_email,
    'aud': 'https://oauth2.googleapis.com/token',
    'target_audience': 'https://fastapi-upload-from-drive-to-gcs-885918267659.asia-northeast3.run.app'
  };

  const header = { 'alg': 'RS256', 'typ': 'JWT' };
  const encodedHeader = Utilities.base64EncodeWebSafe(JSON.stringify(header));
  const encodedPayload = Utilities.base64EncodeWebSafe(JSON.stringify(claimSet));
  const signatureInput = encodedHeader + '.' + encodedPayload;

  // 서명할 때 정확한 키를 사용해야 합니다.
  const signatureBytes = Utilities.computeRsaSha256Signature(signatureInput, serviceAccountKey.private_key);
  const encodedSignature = Utilities.base64EncodeWebSafe(signatureBytes);

  return signatureInput + '.' + encodedSignature;
}


function fetchIdToken(jwt) {
  const payload = {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  };

  const options = {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: Object.keys(payload)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
      .join('&')
  };

  const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', options);
  const data = JSON.parse(response.getContentText());

  if (!data.id_token) {
    Logger.log("ID 토큰 획득 실패: " + response.getContentText());
    throw new Error("ID 토큰을 가져오는 데 실패했습니다.");
  }

  return data.id_token;
}





////=0000000000000000000

function testOAuth2() {
  Logger.log(typeof OAuth2); // "object"가 출력되면 라이브러리가 로드된 것입니다.
  if (typeof OAuth2 === 'undefined') {
    Logger.log("OAuth2 라이브러리가 로드되지 않았습니다.");
  } else {
    Logger.log("OAuth2 라이브러리가 로드되었습니다.");
  }
}


function test_gcp_account_1() {
  try {
    var token = getServiceAccountToken(PRIVATE_KEY, SERVICE_ACCOUNT_EMAIL);
    Logger.log("서비스 계정 토큰: " + token);
  } catch (e) {
    Logger.log("토큰 생성 오류: " + e);
    throw e;
  }

  listCloudRunServices()

  getCloudRunServiceIamPolicy("fastapi-upload-from-drive-to-gcs")
}


/**
 * 지정된 프로젝트와 리전의 Cloud Run 서비스 목록을 조회하는 함수.
 */
function listCloudRunServices() {
  var project = "arched-catwalk-449515-e1"; // 프로젝트 ID
  var location = "asia-northeast3";         // 리전
  var token = getServiceAccountToken(PRIVATE_KEY, SERVICE_ACCOUNT_EMAIL);
  
  var url = "https://run.googleapis.com/v1/projects/" + project + "/locations/" + location + "/services";
  var options = {
    method: "get",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();
  Logger.log("Cloud Run 서비스 목록 응답 코드: " + responseCode);
  Logger.log("Cloud Run 서비스 목록 응답: " + response.getContentText());
}


/**
 * 지정된 Cloud Run 서비스의 IAM 정책(전체 권한)을 조회하는 함수.
 * @param {string} serviceName - Cloud Run 서비스 이름 (예: "fastapi-upload-from-drive-to-gcs")
 */
function getCloudRunServiceIamPolicy(serviceName) {
  var project = "arched-catwalk-449515-e1"; // 프로젝트 ID
  var location = "asia-northeast3";         // 리전
  var token = getServiceAccountToken(PRIVATE_KEY, SERVICE_ACCOUNT_EMAIL);
  
  // Cloud Run API의 getIamPolicy 메서드 URL (서비스 이름 뒤에 :getIamPolicy 붙임)
  var url = "https://run.googleapis.com/v1/projects/" + project + "/locations/" + location + "/services/" + serviceName + ":getIamPolicy";
  var options = {
    method: "get",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();
  Logger.log("IAM 정책 조회 응답 코드 (" + serviceName + "): " + responseCode);
  Logger.log("IAM 정책 (" + serviceName + "): " + response.getContentText());
}