import assert from 'node:assert/strict';
import { composeFooterCopyright, createDefaultFooterV2Config, getFooterConfigKey, hasFooterV2Config, isValidFooterV2Config, migrateLegacyFooterToV2, normalizeFooterV2Config, resolveFooterBrandLogo } from '../src/components/constructor/modules/footerConfig';
import { buildPublishedModuleSettings } from '../src/utils/publishedModuleSettings';

const config = createDefaultFooterV2Config({ name: 'Acme', email: 'hola@acme.test', whatsapp: '+506 8888 8888' });
assert.equal(getFooterConfigKey('footer_1'), 'footer_1_el_footer_config');
assert.equal(hasFooterV2Config({ 'footer_1_el_footer_config': config }, 'footer_1'), true);
assert.equal(hasFooterV2Config({}, 'footer_1'), false);
assert.equal(config.version, 2);
assert.equal(config.columns.length, 4);
assert.deepEqual(config.columns.map((column) => column.type), ['brand', 'menu', 'contact', 'social']);
assert.equal(config.bottomBar.enabled, true);
assert.equal(config.bottomBar.yearMode, 'current');
assert.equal(new Set(config.columns.map((column) => column.id)).size, 4);
assert.equal(composeFooterCopyright({ ...config.bottomBar, copyright: 'Solutium', yearMode: 'current' }, 2026), '2026 Solutium');
assert.equal(composeFooterCopyright({ ...config.bottomBar, copyright: 'Solutium', yearMode: 'fixed', fixedYear: 2024 }, 2026), '2024 Solutium');
assert.equal(composeFooterCopyright({ ...config.bottomBar, copyright: '', yearMode: 'current' }, 2026), '2026');
const editedCopyright = { ...config.bottomBar, copyright: 'Solutium' };
assert.equal(editedCopyright.yearMode, config.bottomBar.yearMode);
assert.equal(editedCopyright.fixedYear, config.bottomBar.fixedYear);
assert.equal(Object.prototype.hasOwnProperty.call(config.bottomBar, 'title'), false);
const projectBrand = config.columns[0] as Extract<typeof config.columns[number], { type: 'brand' }>;
assert.equal(resolveFooterBrandLogo(projectBrand, 'https://cdn.test/legacy.svg', 'https://cdn.test/project.svg', null, null), 'https://cdn.test/legacy.svg');
assert.equal(resolveFooterBrandLogo(projectBrand, null, 'https://cdn.test/project.svg', null, null), 'https://cdn.test/project.svg');
assert.equal(resolveFooterBrandLogo(projectBrand, null, null, 'https://cdn.test/white.svg', null), 'https://cdn.test/white.svg');
assert.equal(resolveFooterBrandLogo(projectBrand, null, null, null, 'https://cdn.test/project-fallback.svg'), 'https://cdn.test/project-fallback.svg');
assert.equal(resolveFooterBrandLogo({ ...projectBrand, logoSource: 'custom', customLogoUrl: 'https://cdn.test/custom.svg' }, 'https://cdn.test/legacy.svg', 'https://cdn.test/project.svg', null, null), 'https://cdn.test/custom.svg');
assert.equal(resolveFooterBrandLogo({ ...projectBrand, logoSource: 'custom', customLogoUrl: '' }, 'https://cdn.test/legacy.svg', 'https://cdn.test/project.svg', null, 'https://cdn.test/project-fallback.svg'), '');
assert.equal(resolveFooterBrandLogo({ ...projectBrand, showLogo: false }, 'https://cdn.test/legacy.svg', 'https://cdn.test/project.svg', null, null), '');
assert.equal(resolveFooterBrandLogo(projectBrand, null, null, null, null), '');

const partial = normalizeFooterV2Config({ version: 2, columns: [{ id: 'stable', type: 'hours', days: [{ label: 'Lunes', closed: true }] }, { type: 'invalid' }, { type: 'text', content: 'Texto' }, { type: 'social', links: [] }, { type: 'menu', links: [] }] });
assert.ok(partial);
assert.equal(partial?.columns.length, 4);
assert.equal(partial?.columns[0].id, 'stable');
assert.equal(partial?.columns[0].type, 'hours');
assert.equal((partial?.columns[0] as any).days[0].closed, true);
assert.ok((partial?.columns[0] as any).days[0].id);
assert.equal(normalizeFooterV2Config({ version: 1, columns: [] }), null);
assert.equal(normalizeFooterV2Config({ version: 2, columns: [] }), null);
assert.equal(isValidFooterV2Config(config), true);

const legacySettings = {
  footer_1_el_footer_newsletter_show_newsletter: false,
  footer_1_el_footer_brand_show_logo: true,
  footer_1_el_footer_brand_logo_img: '',
  footer_1_el_footer_brand_bio: 'Descripción conservada',
  footer_1_el_footer_nav_columns: [{ title: 'Productos', links: [{ label: 'Precios', url: '/precios' }] }],
  footer_1_el_footer_contact_show_contact: true,
  footer_1_el_footer_contact_phone: '+506 8888 8888',
  footer_1_el_footer_contact_email: 'hola@acme.test',
  footer_1_el_footer_contact_address: 'San José',
  footer_1_el_footer_social_social_links: [{ platform: 'instagram', url: 'https://instagram.com/acme' }],
  footer_1_el_footer_bottom_copyright: 'Copyright propio',
  footer_1_el_footer_bottom_legal_links: [{ label: 'Privacidad', url: '/privacidad' }]
};
const migration = migrateLegacyFooterToV2(legacySettings, 'footer_1', { name: 'Acme' });
assert.ok('config' in migration);
if ('config' in migration) {
  assert.deepEqual(migration.config.columns.map((column) => column.type), ['brand', 'menu', 'contact', 'social']);
  assert.equal((migration.config.columns[1] as any).links[0].url, '/precios');
  assert.equal(migration.config.bottomBar.legalLinks[0].id.startsWith('footer_link_'), true);
  assert.equal(legacySettings.footer_1_el_footer_brand_bio, 'Descripción conservada');
}

const blockedNewsletter = migrateLegacyFooterToV2({ ...legacySettings, footer_1_el_footer_newsletter_show_newsletter: true }, 'footer_1');
assert.ok('error' in blockedNewsletter);

const tooManyMenus = migrateLegacyFooterToV2({ ...legacySettings, footer_1_el_footer_nav_columns: [{ title: 'A' }, { title: 'B' }] }, 'footer_1');
assert.ok('error' in tooManyMenus);

const published = buildPublishedModuleSettings({ footer_1_el_footer_config: config, unrelated: true }, 'footer_1');
assert.equal((published.el_footer_config as any).version, 2);
assert.equal((published.el_footer_config as any).columns.length, 4);
assert.equal((published.el_footer_config as any).columns[0].id, config.columns[0].id);
assert.equal((published.el_footer_config as any).bottomBar.yearMode, 'current');
assert.equal(Object.keys(published).includes('bottomBar'), false);

console.log('footerConfig tests passed');
