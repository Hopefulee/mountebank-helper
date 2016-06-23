// TODO: Seperate this file (as it grows) into seperate test files based on their functionaility


const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
chai.should();

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const expect = chai.expect;


// import the mountebank helper library
const lrMB = require('../src/lr-mb');
const Imposter = lrMB.Imposter;

const testStubs = require('./testStubs');


// TODO: Also check for object properties on final response body


describe('Posting to MounteBank', function () {
  before(function startUpMounteBank() {
    lrMB.startMbServer();
  });
  it('Should return a resolved promise on a good request', function () {
    const sampleResponse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const testImposter = new lrMB.Imposter(3000, 'http');
    testImposter.addRoute(sampleResponse);
    return testImposter.postToMountebank().should.be.eventually.fulfilled.and.have.property('status').and.equal(201);
  });

  it('Should return a resolved promise with a correct response on a update request', function () {
    const testImposter = new lrMB.Imposter(3001, 'http');
    const sampleResponse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const newBody =  JSON.stringify({ 'updatedAttribute' : 'newValue' });
    const pathToUpdate =  { 'uri' : '/pets/123', 'verb' : 'PUT' };

    testImposter.addRoute(sampleResponse);
    return testImposter.postToMountebank()
    .then(function () {
      return testImposter.updateResponseBody(newBody, pathToUpdate);
    })
    .then(function (body) {
      return JSON.parse(body);
    })
    .should.be.eventually.fulfilled.and.have.property('port').and.equal(3001);
  });
  
  it('Should return the correctly updated response body on an update', function () {
    const sampleRespnse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const testImposter = new lrMB.Imposter(3002, 'http');
    testImposter.addRoute(sampleRespnse);
    return testImposter.postToMountebank()
    .then(function () {
      return testImposter.updateResponseBody(JSON.stringify({'updatedAttribute' : 'newValue'}), {'uri' : '/pets/123', 'verb' : 'PUT'})
    })
    .then(function (response) {
      return response.text()
    })
    .then(function (body) {
      return JSON.parse(JSON.parse(body).stubs[0].responses[0].is.body);
    })
    .should.eventually.have.key('updatedAttribute');
  });
});
