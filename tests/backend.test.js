process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.js';

test('backend health endpoint responds successfully', async () => {
  const { app } = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');

    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    const json = await response.json();

    assert.equal(response.status, 200);
    assert.equal(json.status, 'ok');
    assert.equal(json.database, 'postgres');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
