'use strict';

let nock   = require('nock');
let expect = require('chai').expect;
let got    = require('got');

function concat (stream, callback) {
  var strings = [];
  stream.on('data', function (data) {
    strings.push(data);
  });
  stream.on('end', function () {
    callback(strings.join(''));
  });
}

describe('got', function () {
  beforeEach(function() {
    nock.disableNetConnect();
    nock.cleanAll();
  });

  it('wraps a call to got() with opts', function () {
    let mock = nock('https://example.com', {reqheaders: {foo: 'bar'}})
    .get('/hello')
    .reply(200, {});

    return cli.got('https://example.com/hello', {headers: {foo: 'bar'}}).
    then(function() {
      mock.done();
    });
  });

  it('wraps a call to got.stream() with opts', function () {
    let mock = nock('https://example.com', {reqheaders: {foo: 'bar'}})
    .get('/hello')
    .reply(200, 'hello');

    let got_stream = cli.got.stream('https://example.com/hello', {headers: {foo: 'bar'}});
    concat(got_stream, function(data) {
      expect(data).to.equal('hello');
      mock.done();
    });
  });

  it('includes the got errors', function () {
    nock('https://example.com', {reqheaders: {foo: 'bar'}})
    .get('/hello')
    .reply(404, 'not found');

    let thrown = false;
    return cli.got('https://example.com/hello', {headers: {foo: 'bar'}}).
    catch(function(err) {
      expect(err instanceof cli.got.HTTPError).to.equal(true);
      thrown = true;
    }).then(function() {
      expect(thrown).to.equal(true); // should not pass
    });
  });

  const helpers = [
    'get',
    'post',
    'put',
    'patch',
    'head',
    'delete'
  ];

  /*jshint -W069 */
  helpers.forEach(function(helper) {
    it(`wraps a call to got.${helper}() with opts`, function () {
      let mock = nock('https://example.com', {reqheaders: {foo: 'bar'}})[helper]('/hello').reply(200, {});

      return cli.got[helper]('https://example.com/hello', {headers: {foo: 'bar'}}).
      then(function() {
        mock.done();
      });
    });

    it(`wraps a call to got.stream.${helper}() with opts`, function () {
      let mock = nock('https://example.com', {reqheaders: {foo: 'bar'}})[helper]('/hello')
      .reply(200, 'hello');
  
      let got_stream = cli.got.stream[helper]('https://example.com/hello', {headers: {foo: 'bar'}});
      concat(got_stream, function(data) {
        expect(data).to.equal('hello');
        mock.done();
      });
    });
  });
  /*jshint +W069 */

  it('defines all properties of the got module', function () {
    expect(Object.getOwnPropertyNames(got).sort()).to.eql(Object.getOwnPropertyNames(cli.got).sort());
    expect(Object.getOwnPropertyNames(got.stream).sort()).to.eql(Object.getOwnPropertyNames(cli.got.stream).sort());
  });

});