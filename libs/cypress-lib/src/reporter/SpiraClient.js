/* eslint-disable */
const http = require('http');
const https = require('https');

module.exports = SpiraClient;

function SpiraClient(protocol, host, port, vdir, login, apiKey) {
  const self = this;
  this._protocol = protocol;
  this._host = host;
  this._port = port;
  this._vdir = vdir;
  this._login = login;
  this._apiKey = apiKey;

  // Set the default ports if none specified
  if (!this._port) {
    if (this._protocol == 'http') {
      this._port = 80;
    }
    if (this._protocol == 'https') {
      this._port = 443;
    }
  }

  this._SPIRA_PLUG_IN_NAME = 'Cypress';
  this._SPIRA_URL_SUFFIX = '/Services/v6_0/RestService.svc/';
  console.log('Created SpiraTest API Client.');
}

SpiraClient.prototype.recordTestRun = function (projectId, testCaseId, releaseId, testSetId, startDate, endDate, executionStatusId, testName, assertCount, message, stackTrace, steps, success_callback, failure_callback, context) {
  let path;
  if (this._vdir && this._vdir != '') {
    path = `/${this._vdir}${this._SPIRA_URL_SUFFIX}projects/{project_id}/test-runs/record`;
  } else {
    path = `${this._SPIRA_URL_SUFFIX}projects/{project_id}/test-runs/record`;
  }
  path = path.replace('{project_id}', projectId);

  const remoteTestRun = {
    TestCaseId: testCaseId,
    ReleaseId: releaseId,
    TestSetId: testSetId,
    StartDate: new Date(startDate),
    EndDate: new Date(endDate),
    ExecutionStatusId: executionStatusId,
    RunnerName: this._SPIRA_PLUG_IN_NAME,
    RunnerTestName: testName,
    RunnerAssertCount: assertCount,
    RunnerMessage: message,
    RunnerStackTrace: stackTrace,
    TestRunFormatId: 1 /* Plain Text */,
    TestRunSteps: steps,
  };

  // Make the REST Call to send the data to Spira
  const postData = JSON.stringify(remoteTestRun);
  // console.log('POST DATA: ' + postData);

  const options = {
    hostname: this._host,
    port: this._port,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      username: this._login,
      'api-key': this._apiKey,
    },
  };

  console.log(`Sending test results to SpiraTest: ${this._protocol}://${options.hostname}:${options.port}${options.path}`);

  // Handle HTTP or HTTPS
  let protocolRequest = http.request;
  if (this._protocol == 'https') {
    protocolRequest = https.request;
  }

  const req = protocolRequest(options, (res) => {
    let body = '';
    // console.log(`STATUS: ${res.statusCode}`);
    // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      if (res.statusCode == 200) {
        body += chunk;
      } else {
        console.log(`BODY: ${chunk}`);
      }
    });
    res.on('end', () => {
      if (res.statusCode == 200) {
        if (success_callback) {
          // console.log(body);
          const testRunId = JSON.parse(body).TestRunId;
          console.log(`Successfully sent test results to SpiraTest as Test Run TR:${testRunId}`);
          success_callback(testRunId, context);
        }
      } else {
        console.log(`There was an error sending the test results to SpiraTest - ${res.statusMessage} (${res.statusCode})`);
        if (failure_callback) {
          failure_callback(res);
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    if (failure_callback) {
      failure_callback(e);
    }
  });

  // write data to request body
  req.write(postData);
  req.end();
  // console.log('Request Sent');
};

SpiraClient.prototype.documentUpload = function (projectId, filename, binaryData, artifactTypeId, artifactId, success_callback, failure_callback) {
  // projects/{project_id}/documents/file
  let path;
  if (this._vdir && this._vdir != '') {
    path = `/${this._vdir}${this._SPIRA_URL_SUFFIX}projects/{project_id}/documents/file`;
  } else {
    path = `${this._SPIRA_URL_SUFFIX}projects/{project_id}/documents/file`;
  }
  path = path.replace('{project_id}', projectId);

  const remoteDocumentFile = {
    FilenameOrUrl: filename,
    BinaryData: binaryData,
    AttachedArtifacts: [{
      ArtifactTypeId: artifactTypeId,
      ArtifactId: artifactId,
    }],
  };

  // Make the REST Call to send the data to Spira
  const postData = JSON.stringify(remoteDocumentFile);
  // console.log('POST DATA: ' + postData);

  const options = {
    hostname: this._host,
    port: this._port,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      username: this._login,
      'api-key': this._apiKey,
    },
  };

  console.log(`Uploading file ${filename} to SpiraTest: ${this._protocol}://${options.hostname}:${options.port}${options.path}`);

  // Handle HTTP or HTTPS
  let protocolRequest = http.request;
  if (this._protocol == 'https') {
    protocolRequest = https.request;
  }

  const req = protocolRequest(options, (res) => {
    // console.log(`STATUS: ${res.statusCode}`);
    // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      if (res.statusCode != 200) {
        console.log(`BODY: ${chunk}`);
      }
    });
    res.on('end', () => {
      if (res.statusCode == 200) {
        console.log('Successfully uploaded file to SpiraTest.');
        if (success_callback) {
          success_callback();
        }
      } else {
        console.log(`There was an error uploaded file to SpiraTest - ${res.statusMessage} (${res.statusCode})`);
        if (failure_callback) {
          failure_callback(res);
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    if (failure_callback) {
      failure_callback(e);
    }
  });

  // write data to request body
  req.write(postData);
  req.end();
  // console.log('Request Sent');
};
