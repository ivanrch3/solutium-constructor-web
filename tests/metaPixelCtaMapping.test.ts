import assert from 'node:assert/strict';
import test from 'node:test';
import {
  collectMetaPixelCtas,
  resolveMetaPixelCtaEvent,
  suggestMetaPixelEventForCta
} from '../src/utils/metaPixelCta';

const classify = (text: string, href: string) => suggestMetaPixelEventForCta({ text, href });

test('CTA classifier prioritizes acquisition intent and handles contact channels', () => {
  assert.equal(classify('Crear cuenta', '/registro'), 'Lead');
  assert.equal(classify('Crear cuenta por WhatsApp', 'https://wa.me/50655555555'), 'Lead');
  assert.equal(classify('WhatsApp de consultas', 'https://wa.me/50655555555'), 'Contact');
  assert.equal(classify('Escríbenos', 'mailto:hola@example.com'), 'Contact');
  assert.equal(classify('Llámanos', 'tel:+50655555555'), 'Contact');
  assert.equal(classify('Ver planes', '#planes'), 'None');
  assert.equal(classify('Conocer más', '/servicios'), 'None');
});

test('manual overrides and restoring automatic are stable across text changes', () => {
  const cta = { id: 'hero-123.primaryCta', text: 'Crear cuenta', href: '/registro', sectionId: 'hero-123', moduleType: 'hero', elementId: 'primaryCta' } as const;
  assert.deepEqual(resolveMetaPixelCtaEvent(cta), { suggested: 'Lead', applied: 'Lead', manual: false });
  assert.deepEqual(resolveMetaPixelCtaEvent({ ...cta, text: 'Empezar ahora' }, { [cta.id]: 'Contact' }), { suggested: 'Lead', applied: 'Contact', manual: true });
  assert.equal(resolveMetaPixelCtaEvent(cta, { [cta.id]: 'None' }).applied, 'None');
  assert.equal(resolveMetaPixelCtaEvent(cta, {}).manual, false);
});

test('extractor is deterministic and does not duplicate stable CTA ids', () => {
  const content = {
    sections: [{
      id: 'hero-123', type: 'hero', name: 'Inicio · Hero',
      settings: {
        hero_el_hero_ctas_primary_text: 'Crear el tuyo gratis', hero_el_hero_ctas_primary_url: '/registro',
        hero_el_hero_ctas_secondary_text: 'Ver planes', hero_el_hero_ctas_secondary_url: '#planes', unrelated: 'value'
      },
      content: { actions: [{ text: 'Crear el tuyo gratis', href: '/registro' }] }
    }]
  };
  const ctas = collectMetaPixelCtas(content);
  assert.equal(new Set(ctas.map((cta) => cta.id)).size, ctas.length);
  assert.equal(ctas.filter((cta) => cta.id === 'hero-123.hero_el_hero_ctas.primary').length, 1);
  assert.equal(collectMetaPixelCtas(content).map((cta) => cta.id).join('|'), ctas.map((cta) => cta.id).join('|'));
});

test('legacy sites without mapping remain automatic', () => {
  const cta = { id: 'footer-789.whatsapp', text: 'Escríbenos', href: 'https://wa.me/50655555555', sectionId: 'footer-789', moduleType: 'footer', elementId: 'whatsapp' };
  assert.equal(resolveMetaPixelCtaEvent(cta, undefined).applied, 'Contact');
});
