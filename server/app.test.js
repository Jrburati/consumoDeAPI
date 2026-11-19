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
          return json({
            Response: 'True',
            apikey: apiKey,
            Search: [{
              Title: query, Year: '2026', imdbID: 'tt1', Poster: 'https://example.test/poster.jpg', Type: 'movie', secret: apiKey,
            }],
          });
        };
        const response = await get('/api/movies/search?' + new URLSearchParams({ query }));
        assert.equal(response.status, 200);
        const body = await response.text();
        assert.ok(!body.includes(apiKey));
        assert.deepEqual(JSON.parse(body), {
          Response: 'True',
          Search: [{ Title: query, Year: '2026', imdbID: 'tt1', Poster: 'https://example.test/poster.jpg', Type: 'movie' }],
        });
      }
      upstream = async () => json({
        Response: 'True',
        Search: [{ Title: 'Movie', Poster: `https://example.test/${apiKey}.jpg`, Type: apiKey }, { Title: 'Missing poster' }],
      });
      const search = await get('/api/movies/search?query=Movie');
      assert.equal(search.status, 200);
      assert.deepEqual((await search.json()).Search, [
        { Title: 'Movie', Year: '', imdbID: '', Poster: 'https://example.test/[redacted].jpg', Type: '[redacted]' },
        { Title: 'Missing poster', Year: '', imdbID: '', Poster: '', Type: '' },
      ]);
      upstream = async () => json({ Response: 'True', Title: apiKey, Year: '1998', Poster: apiKey, imdbRating: '8', secret: apiKey });
      const response = await get('/api/movies/title?title=Favorite');
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        Response: 'True', Title: '[redacted]', Year: '1998', Poster: '[redacted]', imdbRating: '8',
      });
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

test('PokéAPI proxy returns only catalog and card data', async t => {
  const nativeFetch = globalThis.fetch;
  const privateDetail = 'private upstream diagnostic';
  let upstream;
  t.mock.method(globalThis, 'fetch', (url, options) => {
    const target = new URL(url);
    assert.equal(target.origin, 'https://pokeapi.co');
    assert.equal(options.redirect, 'error');
    return upstream(target, options.signal);
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/pokemon`;
  const get = (route, options) => nativeFetch(base + route, options);

  async function expectError(route, status, code) {
    const response = await get(route);
    assert.equal(response.status, status);
    assert.match(response.headers.get('content-type'), /^application\/json/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.text();
    assert.ok(!body.includes(privateDetail));
    assert.ok(!body.includes('pokeapi.co'));
    const data = JSON.parse(body);
    assert.deepEqual(Object.keys(data).sort(), ['code', 'error']);
    assert.equal(data.code, code);
  }

  try {
    await t.test('returns all names in order and builds pagination on the fixed upstream host', async () => {
      const offsets = [];
      upstream = async url => {
        assert.equal(url.pathname, '/api/v2/pokemon/');
        assert.equal(url.searchParams.get('limit'), '2000');
        const offset = url.searchParams.get('offset');
        offsets.push(offset);
        return Response.json(offset === '0' ? {
          next: 'https://example.test/unused',
          results: [{ name: 'pikachu', url: privateDetail }, { name: 'mewtwo' }],
          privateDetail,
        } : { next: null, results: [{ name: 'lucario-mega' }] });
      };
      const response = await get('/catalog');
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), { names: ['pikachu', 'mewtwo', 'lucario-mega'] });
      assert.deepEqual(offsets, ['0', '2']);
    });

    await t.test('returns official artwork, fallback and the other card fields only', async () => {
      const sprites = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
      const artwork = `${sprites}other/official-artwork/25.png`;
      const fallbackArtwork = `${sprites}25.png`;
      upstream = async url => {
        assert.equal(url.pathname, '/api/v2/pokemon/pikachu/');
        assert.equal(url.search, '');
        return Response.json({
          sprites: { front_default: fallbackArtwork, other: { 'official-artwork': { front_default: artwork } } },
          types: [{ type: { name: 'electric', url: privateDetail } }], height: 4, weight: 60, privateDetail,
        });
      };
      const response = await get('/pikachu?ignored=value');
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { artwork, fallbackArtwork, types: ['electric'], height: 4, weight: 60 });

      upstream = async () => Response.json({
        sprites: { front_default: 'https://pokeapi.co/untrusted.png' }, types: [], height: 0, weight: 0,
      });
      assert.deepEqual(await (await get('/pikachu')).json(), { artwork: null, fallbackArtwork: null, types: [], height: 0, weight: 0 });
    });

    await t.test('rejects invalid names before contacting the upstream API', async () => {
      let calls = 0;
      upstream = async () => { calls++; return Response.json({}); };
      for (const route of ['/pika%20chu', '/pika%2Fchu', '/PIKACHU', '/pikachu%0A', '/%E0%A4%A', `/${'a'.repeat(101)}`]) {
        await expectError(route, 400, 'INVALID_NAME');
      }
      assert.equal(calls, 0);
    });

    await t.test('distinguishes upstream HTTP, network, invalid JSON and invalid response shapes', async () => {
      const cases = [
        ['/pikachu', () => new Response(privateDetail, { status: 404 }), 404, 'POKEMON_NOT_FOUND'],
        ['/catalog', () => new Response(privateDetail, { status: 404 }), 502, 'UPSTREAM_HTTP'],
        ['/catalog', () => new Response(privateDetail, { status: 500 }), 502, 'UPSTREAM_HTTP'],
        ['/catalog', () => new Response(privateDetail, { status: 429 }), 503, 'UPSTREAM_HTTP'],
        ['/catalog', () => new Response(privateDetail, { status: 504 }), 504, 'UPSTREAM_HTTP'],
        ['/catalog', () => { throw new TypeError(privateDetail); }, 502, 'UPSTREAM_NETWORK'],
        ['/catalog', () => new Response(privateDetail), 502, 'INVALID_UPSTREAM_RESPONSE'],
        ['/catalog', () => Response.json({ results: [], next: 'https://example.test/' }), 502, 'INVALID_UPSTREAM_RESPONSE'],
        ['/catalog', () => Response.json({ results: [{ name: privateDetail }], next: null }), 502, 'INVALID_UPSTREAM_RESPONSE'],
        ['/pikachu', () => Response.json({ sprites: {}, types: [{ type: null }], height: 4, weight: 60 }), 502, 'INVALID_UPSTREAM_RESPONSE'],
      ];
      for (const [route, respond, status, code] of cases) {
        upstream = async () => respond();
        await expectError(route, status, code);
      }
    });

    await t.test('aborts the upstream on timeout and reports a gateway timeout', async subtest => {
      const timeout = AbortSignal.timeout.bind(AbortSignal);
      subtest.mock.method(AbortSignal, 'timeout', delay => {
        assert.equal(delay, 8000);
        return timeout(25);
      });
      let reason;
      upstream = (_url, signal) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          reason = signal.reason;
          reject(reason);
        }, { once: true });
      });
      await expectError('/catalog', 504, 'UPSTREAM_TIMEOUT');
      assert.equal(reason?.name, 'TimeoutError');
    });

    await t.test('client disconnect aborts an in-flight Pokémon request', { timeout: 2000 }, async () => {
      const started = Promise.withResolvers();
      const canceled = Promise.withResolvers();
      upstream = (_url, signal) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          canceled.resolve(signal.reason);
          reject(signal.reason);
        }, { once: true });
        started.resolve();
      });
      const controller = new AbortController();
      const request = get('/pikachu', { signal: controller.signal });
      await started.promise;
      controller.abort();
      await assert.rejects(request, { name: 'AbortError' });
      assert.equal((await canceled.promise).name, 'AbortError');
    });
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
