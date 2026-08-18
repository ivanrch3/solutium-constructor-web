import assert from 'node:assert/strict';
import test from 'node:test';
import { formatReservasWebMoney } from '../src/utils/reservasWebMoney';

test('CRC uses symbol, dot thousands and zero decimals', () => {
  assert.equal(formatReservasWebMoney(100000, 'CRC'), '₡100.000');
  assert.equal(formatReservasWebMoney(25000, 'CRC'), '₡25.000');
  assert.equal(formatReservasWebMoney(1500000, 'CRC'), '₡1.500.000');
  assert.doesNotMatch(formatReservasWebMoney(100000, 'CRC'), /,00|CRC/);
});

test('non-CRC currencies preserve currency formatting', () => {
  assert.match(formatReservasWebMoney(100, 'USD'), /\$|US\$/);
});
