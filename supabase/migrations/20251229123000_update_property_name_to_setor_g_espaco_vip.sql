-- Migration: update existing seeded property name to 'setor g espaço vip'

BEGIN;

UPDATE public.property_settings
SET name = 'setor g espaço vip',
    description = 'setor g espaço vip - local e confortável.'
WHERE name = 'Casa com Piscina';

COMMIT;