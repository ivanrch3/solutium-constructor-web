import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  normalizeBentoCompositeElements,
  resolveBentoButtonColors,
  resolveBentoFontWeight,
  resolveBentoFontWeightToken
} from '../src/utils/bentoComposite.ts';

const contentSource = fs.readFileSync(new URL('../src/components/constructor/modules/BentoCompositeContent.tsx', import.meta.url), 'utf8');
const editorSource = fs.readFileSync(new URL('../src/components/constructor/modules/BentoCompositeEditor.tsx', import.meta.url), 'utf8');
const cellEditorSource = fs.readFileSync(new URL('../src/components/constructor/BentoCellEditor.tsx', import.meta.url), 'utf8');

test('all canonical typography weights map to the project FONT_WEIGHTS values', () => {
  assert.deepEqual(['light', 'normal', 'semibold', 'extrabold', 'black'].map((token) => resolveBentoFontWeight(token)), [300, 400, 600, 800, 900]);
  assert.equal(resolveBentoFontWeightToken('800'), 'extrabold');
  assert.equal(resolveBentoFontWeightToken('Black'), 'black');
});
test('legacy numeric composite weights normalize to canonical tokens', () => {
  const [title, description] = normalizeBentoCompositeElements([
    { id: 't', type: 'title', enabled: true, font_weight: '800' },
    { id: 'd', type: 'description', enabled: true, font_weight: 400 }
  ]);
  assert.equal(title.font_weight, 'extrabold');
  assert.equal(description.font_weight, 'normal');
});

test('composite renderer uses inline canonical weight and explicit colors in both surfaces', () => {
  assert.match(contentSource, /resolveBentoFontWeight/);
  assert.match(contentSource, /backgroundColor: buttonColors\.background/);
  assert.match(contentSource, /color: buttonColors\.text/);
  assert.match(contentSource, /fontFamily/);
});

test('text and button color contracts preserve explicit values and theme fallback', () => {
  assert.equal(resolveBentoButtonColors({ background_color: '#123456', text_color: '#FFFFFF' }, false).background, '#123456');
  assert.equal(resolveBentoButtonColors({ background_color: '#123456', text_color: '#FFFFFF' }, false).text, '#FFFFFF');
  assert.equal(resolveBentoButtonColors({}, false).background, 'var(--color-primary, #2563EB)');
  assert.equal(resolveBentoButtonColors({ color: '#ABCDEF' }, true).text, '#ABCDEF');
});

test('button editor exposes independent background and text colors', () => {
  assert.match(editorSource, /background_color/);
  assert.match(editorSource, /text_color/);
  assert.match(editorSource, /Color del bot/);
});

test('composite section memory is type-based and main tab falls back to the last active tab', () => {
  assert.match(editorSource, /activeSection\?: string \| null/);
  assert.match(editorSource, /element\.type === activeSection/);
  assert.match(cellEditorSource, /activeCompositeEditorSection/);
  assert.match(cellEditorSource, /lastBentoTab/);
  assert.doesNotMatch(editorSource, /onSettingChange/);
});
