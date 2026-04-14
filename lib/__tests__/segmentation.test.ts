import { describe, expect, it } from 'vitest';
import { classifyGuests } from '../segmentation';

describe('classifyGuests', () => {
  it('devuelve lista vacía cuando no hay guests', () => {
    expect(classifyGuests(new Map())).toEqual([]);
  });
});
