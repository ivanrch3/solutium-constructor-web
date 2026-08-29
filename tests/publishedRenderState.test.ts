import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canMountPublishedViewer,
  shouldShowConstructorBranding,
  type PublishedRenderState
} from '../src/utils/publishedRenderState.ts';

test('external published render stays hidden while fetch is pending, even after handshake', async () => {
  let state: PublishedRenderState = 'loading';
  let fetchResolved = false;
  const pendingFetch = new Promise<void>((resolve) => {
    setTimeout(() => {
      fetchResolved = true;
      state = 'ready';
      resolve();
    }, 550);
  });

  await new Promise((resolve) => setTimeout(resolve, 500));
  assert.equal(fetchResolved, false);
  assert.equal(canMountPublishedViewer(true, state), false);
  assert.equal(shouldShowConstructorBranding(true), false);

  await pendingFetch;
  assert.equal(fetchResolved, true);
  assert.equal(canMountPublishedViewer(true, state), true);
});

test('only a completed external published render can mount Viewer', () => {
  assert.equal(canMountPublishedViewer(true, 'idle'), false);
  assert.equal(canMountPublishedViewer(true, 'loading'), false);
  assert.equal(canMountPublishedViewer(true, 'error'), false);
  assert.equal(canMountPublishedViewer(true, 'ready'), true);
});

test('non-external modes preserve their existing viewer gate and branding', () => {
  for (const state of ['idle', 'loading', 'ready', 'error'] as PublishedRenderState[]) {
    assert.equal(canMountPublishedViewer(false, state), true);
  }
  assert.equal(shouldShowConstructorBranding(false), true);
});
