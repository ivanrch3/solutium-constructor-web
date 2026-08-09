import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSpecialEventModerationToken } from '../src/utils/specialEventModerationPath.ts';

test('uses the public moderation path supplied to the embedded Viewer', () => {
  assert.equal(
    resolveSpecialEventModerationToken('/', '?mode=render&published_path=%2Fmoderar%2Ftest-token_123'),
    'test-token_123'
  );
});

test('does not treat a normal public route as a moderation route', () => {
  assert.equal(resolveSpecialEventModerationToken('/', '?published_path=%2F'), '');
});
