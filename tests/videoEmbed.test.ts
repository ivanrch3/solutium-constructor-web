import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildVideoEmbedUrl,
  getVideoAspectRatioCss,
  resolveVideoAspectRatio,
  resolveVideoExternalId,
  resolveVideoProviderFromUrl,
  resolveVideoSource,
} from '../src/utils/videoEmbed.ts';

const videoId = '7ZvV3394yQc';

test('normalizes supported YouTube URLs to embed URLs', () => {
  const urls = [
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://youtube.com/watch?v=${videoId}&t=30`,
    `https://youtu.be/${videoId}?feature=shared`,
    `https://www.youtube.com/embed/${videoId}`,
  ];

  for (const url of urls) {
    assert.equal(resolveVideoProviderFromUrl(url), 'youtube');
    assert.equal(resolveVideoExternalId(url, 'youtube'), videoId);
    assert.ok(buildVideoEmbedUrl(url)?.startsWith(`https://www.youtube.com/embed/${videoId}?`));
  }
});

test('normalizes YouTube Shorts and ignores query parameters', () => {
  for (const url of [
    `https://youtube.com/shorts/${videoId}?si=-8f5nUxMuDNBvmMS`,
    `https://www.youtube.com/shorts/${videoId}?t=10&feature=share`,
  ]) {
    const source = resolveVideoSource(url);

    assert.equal(source.videoId, videoId);
    assert.equal(source.embedUrl?.split('?')[0], `https://www.youtube.com/embed/${videoId}`);
    assert.equal(source.format, 'portrait');
    assert.equal(source.aspectRatio, '9/16');
    assert.ok(!source.embedUrl?.includes('/shorts/'));
  }
});

test('auto uses detected ratio and explicit ratios take precedence', () => {
  const short = resolveVideoSource(`https://youtube.com/shorts/${videoId}`);
  const normal = resolveVideoSource(`https://youtube.com/watch?v=${videoId}`);

  assert.equal(resolveVideoAspectRatio('auto', short.aspectRatio), '9/16');
  assert.equal(resolveVideoAspectRatio(undefined, normal.aspectRatio), '16/9');
  assert.equal(resolveVideoAspectRatio('16/9', short.aspectRatio), '16/9');
  assert.equal(resolveVideoAspectRatio('9/16', normal.aspectRatio), '9/16');
  assert.equal(resolveVideoAspectRatio('4/3', short.aspectRatio), '4/3');
});

test('poster and iframe use the same effective aspect ratio source', () => {
  const source = resolveVideoSource(`https://youtube.com/shorts/${videoId}`);

  assert.equal(resolveVideoAspectRatio('auto', source.aspectRatio), '9/16');
  assert.equal(resolveVideoAspectRatio('16/9', source.aspectRatio), '16/9');
});

test('maps effective ratios to one CSS aspect-ratio mechanism', () => {
  assert.equal(getVideoAspectRatioCss('16/9'), '16 / 9');
  assert.equal(getVideoAspectRatioCss('4/3'), '4 / 3');
  assert.equal(getVideoAspectRatioCss('9/16'), '9 / 16');
});

test('preserves Vimeo and direct URL behavior', () => {
  const vimeo = 'https://vimeo.com/123456789';
  const direct = 'https://cdn.example.com/video.mp4';

  assert.equal(resolveVideoProviderFromUrl(vimeo), 'vimeo');
  assert.equal(resolveVideoExternalId(vimeo, 'vimeo'), '123456789');
  assert.equal(buildVideoEmbedUrl(vimeo, { autoplay: true, loop: true }), 'https://player.vimeo.com/video/123456789?autoplay=1&loop=1&muted=1');
  assert.equal(buildVideoEmbedUrl(direct), direct);
});

test('invalid YouTube URLs fall back safely', () => {
  const invalid = 'https://youtube.com/shorts/not-a-video-id';

  assert.equal(resolveVideoExternalId(invalid, 'youtube'), undefined);
  assert.equal(buildVideoEmbedUrl(invalid), invalid);
  assert.equal(resolveVideoSource(invalid).aspectRatio, '16/9');
});
