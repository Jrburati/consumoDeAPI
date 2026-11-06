import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import app from './app.js';

test('OMDb proxy validation, responses, cancellation and secret isolation', async t => {
  const originalKey = process.env.OMDB_API_KEY;
  const apiKey = 'test-server-secret';
  process.env.OMDB_API_KEY = apiKey;
  const nativeFetch = globalThis.fetch;
  let upstream;
  t.mock.method(globalThis, 'fetch', (url, options) => {
    if (String(url).startsWith('https://www.omdbapi.com/')) return upstream(new URL(url), options);
    return nativeFetch(url, options);
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = route => nativeFetch(base + route);
  const json = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });

  try {
    await t.test('rejects missing, blank, repeated and oversized parameters before upstream calls', async () => {
      upstream = () => { throw new Error('Must not contact OMDb'); };
      for (const route of ['/search', '/search?query=%20', '/search?query=a&query=b', `/search?query=${'a'.repeat(201)}`, '/title', '/title?title=%20']) {
        assert.equal((await get('/api/movies' + route)).status, 400);
      }
    });

    await t.test('encodes special characters and never forwards upstream secrets or extra fields', async () => {
      for (const query of ['Batman', 'The Matrix', 'Amélie', 'Love & Other Drugs', 'Love+Death']) {
        upstream = async url => {
          assert.equal(url.searchParams.get('s'), query);
          assert.equal(url.searchParams.get('apikey'), apiKey);
          return json({ Response: 'True', apikey: apiKey, Search: [{ Title: query, Year: '2026', imdbID: 'tt1', secret: apiKey }] });
        };
        const response = await get('/api/movies/search?' + new URLSearchParams({ query }));
        assert.equal(response.status, 200);
        const body = await response.text();
        assert.ok(!body.includes(apiKey));
        assert.equal(JSON.parse(body).Search[0].Title, query);
      }
      upstream = async () => json({ Response: 'True', Title: apiKey, Poster: apiKey, imdbRating: '8', secret: apiKey });
      const response = await get('/api/movies/title?title=Favorite');
      assert.equal(response.status, 200);
      assert.ok(!(await response.text()).includes(apiKey));
    });

    await t.test('preserves no-results response and uses 404 for missing favorite title', async () => {
      upstream = async () => json({ Response: 'False', Error: 'Movie not found!' });
      const response = await get('/api/movies/search?query=missing');
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { Response: 'False', Error: 'Movie not found!' });
      assert.equal((await get('/api/movies/title?title=missing')).status, 404);
    });

    await t.test('maps logical, HTTP, invalid JSON, network and timeout failures without leaking secrets', async () => {
      const cases = [
        [() => json({ Response: 'False', Error: 'Too many results.' }), 422],
        [() => json({ Response: 'False', Error: 'Request limit reached!' }), 503],
        [() => json({ Response: 'False', Error: apiKey }), 502],
        [() => new Response(apiKey, { status: 401 }), 502],
        [() => new Response(apiKey, { status: 429 }), 503],
        [() => new Response(apiKey), 502],
        [() => json({ Response: 'True', Search: null }), 502],
        [() => { throw new Error(apiKey); }, 502],
        [() => { throw new DOMException(apiKey, 'TimeoutError'); }, 504],
      ];
      for (const [respond, status] of cases) {
        upstream = async () => respond();
        const response = await get('/api/movies/search?query=Batman');
        assert.equal(response.status, status);
        assert.ok(!(await response.text()).includes(apiKey));
      }
      delete process.env.OMDB_API_KEY;
      assert.equal((await get('/api/movies/search?query=Batman')).status, 503);
      process.env.OMDB_API_KEY = apiKey;
    });

    await t.test('client cancellation aborts the upstream OMDb request', async () => {
      let started;
      let canceled;
      const ready = new Promise(resolve => { started = resolve; });
      const aborted = new Promise(resolve => { canceled = resolve; });
      upstream = (url, { signal }) => new Promise((resolve, reject) => {
        assert.ok(signal instanceof AbortSignal);
        signal.addEventListener('abort', () => { canceled(); reject(signal.reason); }, { once: true });
        started();
      });
      const controller = new AbortController();
      const request = nativeFetch(base + '/api/movies/search?query=Batman', { signal: controller.signal });
      await ready;
      controller.abort();
      await assert.rejects(request, { name: 'AbortError' });
      await Promise.race([aborted, new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Upstream was not canceled')), 2000);
        timer.unref();
      })]);
    });
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    if (originalKey === undefined) delete process.env.OMDB_API_KEY;
    else process.env.OMDB_API_KEY = originalKey;
  }
});
