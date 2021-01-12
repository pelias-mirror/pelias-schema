const elastictest = require('elastictest');
const config = require('pelias-config').generate();
const getTotalHits = require('./_hits_total_helper');

module.exports.tests = {};

/**
 * this test ensures that 'admin_abbreviation' fields
 * are indexed in a way that indexing multiple tokens in the
 * same field does not affect scoring even when the tokens
 * are duplicates or prefixes of each other.
*/
module.exports.tests.scoring = function (test, common) {
  test('scoring', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, common.create);
    suite.action(done => setTimeout(done, 500)); // wait for es to bring some shards up

    // index document 1 with country_a='NZL'
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1',
        body: {
          parent: {
            country_a: ['NZL']
          }
        }
      }, done);
    });

    // index document 2 with country_a='NZL' & 'NZ'
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '2',
        body: {
          parent: {
            country_a: ['NZL', 'NZ']
          }
        }
      }, done);
    });

    // search for 'NZL' on 'parent.country_a' and compare scores
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: {
          query: {
            match: {
              'parent.country_a': {
                'query': 'nzl'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'NZL' on 'parent.country_a.ngram' and compare scores
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: {
          query: {
            match: {
              'parent.country_a.ngram': {
                'query': 'nzl'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'NZ' on 'parent.country_a.ngram' and compare scores
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: {
          query: {
            match: {
              'parent.country_a.ngram': {
                'query': 'nz'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    suite.run(t.end);
  });
};

/**
 * this test ensures that 'admin_abbreviation' fields
 * include a synonym mapping for country code abbreviations
 * which maps between alpha2 and alpha3 variants.
*/
module.exports.tests.synonyms = function (test, common) {
  test('synonyms', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, common.create);
    suite.action(done => setTimeout(done, 500)); // wait for es to bring some shards up

    // index document 1 with country_a='NZL'
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1',
        body: {
          parent: {
            country_a: ['NZL']
          }
        }
      }, done);
    });

    // index document 2 with country_a='NZ'
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '2',
        body: {
          parent: {
            country_a: ['NZ']
          }
        }
      }, done);
    });

    // search for 'NZL' on 'parent.country_a'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: {
          query: {
            match: {
              'parent.country_a': {
                'query': 'nzl'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'NZ' on 'parent.country_a'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: {
          query: {
            match: {
              'parent.country_a': {
                'query': 'nz'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'NZL' on 'parent.country_a.ngram'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: {
          query: {
            match: {
              'parent.country_a.ngram': {
                'query': 'nzl'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'NZ' on 'parent.country_a.ngram'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: {
          query: {
            match: {
              'parent.country_a.ngram': {
                'query': 'nz'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    suite.run(t.end);
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('multi token synonyms: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};