# Solução: Reservas não aparecendo no financeiro e relatórios

## Problema Identificado

As reservas não estavam aparecendo corretamente no financeiro e nos relatórios devido a problemas no esquema do banco de dados e inconsistências na exibição de dados.

## Causas Raiz

### 1. Problema no Esquema do Banco de Dados
- A tabela `payments` exigia que `reservation_id` fosse NOT NULL
- Isso impedia a criação de receitas avulsas (não vinculadas a uma reserva)
- Quando o código tentava criar uma receita sem reserva, ocorria um erro no banco de dados

### 2. Campo Faltante
- O código tentava definir um campo `status` nos pagamentos
- A tabela `payments` não tinha esse campo
- Causava erro ao tentar salvar pagamentos

### 3. Inconsistência de Datas
- Os pagamentos eram exibidos usando `created_at` (data de criação no sistema)
- Mas os usuários inseriam uma data específica no campo `payment_date`
- Isso causava confusão e relatórios incorretos

## Solução Implementada

### 1. Migração do Banco de Dados
Criado arquivo: `supabase/migrations/20260201000001_fix_payments_table.sql`

```sql
-- Adiciona campo status com valores permitidos
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'received' 
CHECK (status IN ('received', 'pending', 'cancelled'));

-- Torna reservation_id opcional para permitir receitas avulsas
ALTER TABLE public.payments 
ALTER COLUMN reservation_id DROP NOT NULL;

-- Atualiza pagamentos existentes
UPDATE public.payments 
SET status = 'received' 
WHERE status IS NULL;
```

### 2. Atualização do Tipo Payment
Arquivo: `src/lib/types.ts`

**Antes:**
```typescript
export interface Payment {
  reservation_id: string;  // Sempre obrigatório
  // status não existia
}
```

**Depois:**
```typescript
export interface Payment {
  reservation_id: string | null;  // Agora opcional
  status: string;  // Novo campo adicionado
}
```

### 3. Correção na Página Financeira
Arquivo: `src/app/admin/financial/page.tsx`

**Mudanças principais:**
- ✅ Corrigido campo `date` → `payment_date` ao criar pagamento
- ✅ Adicionado diálogo para registrar receitas avulsas ou vinculadas
- ✅ Exibição de datas usando `payment_date` em vez de `created_at`
- ✅ Seletor de reserva opcional ao registrar receita

**Novo Diálogo de Receita:**
```typescript
// Agora permite criar receita sem reserva
{
  reservation_id: incomeData.reservation_id || null,  // Pode ser null
  amount: parseFloat(incomeData.amount),
  status: 'received',
  payment_date: incomeData.date,  // Corrigido de 'date' para 'payment_date'
  notes: incomeData.notes
}
```

### 4. Correção na Página de Relatórios
Arquivo: `src/app/admin/reports/page.tsx`

**Mudanças principais:**
- ✅ Filtrar pagamentos por `payment_date` em vez de `created_at`
- ✅ Exibir `payment_date` nas tabelas
- ✅ Usar `payment_date` na geração de CSV

## Como Funciona Agora

### Fluxo de Receitas

```
┌─────────────────────────────────────┐
│  Usuário clica "Registrar Receita"  │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│     Seleciona tipo de receita:      │
│  1. Vinculada a uma reserva         │
│  2. Receita avulsa (sem reserva)    │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│   Preenche valor e data             │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│ Sistema salva com:                  │
│ - reservation_id: UUID ou null      │
│ - payment_date: data escolhida      │
│ - status: 'received'                │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│ Aparece corretamente em:            │
│ ✅ Financeiro                        │
│ ✅ Relatórios                        │
│ ✅ Exportação CSV                    │
└─────────────────────────────────────┘
```

### Exemplo de Uso

**Cenário 1: Receita de Reserva**
```
Hóspede: João Silva
Check-in: 15/02/2026
Valor: R$ 1.500,00
→ Cria pagamento vinculado à reserva
→ Aparece como "Reserva #ABC12345"
```

**Cenário 2: Receita Avulsa**
```
Descrição: Venda de bebidas extras
Data: 20/02/2026
Valor: R$ 150,00
→ Cria pagamento sem reserva
→ Aparece como "Receita Avulsa"
```

## Benefícios

✅ **Flexibilidade**: Permite registrar receitas com ou sem reserva  
✅ **Precisão**: Datas são exibidas corretamente (data do pagamento, não data de registro)  
✅ **Rastreamento**: Novo campo `status` permite melhor controle dos pagamentos  
✅ **Relatórios**: Dados aparecem corretamente em todos os relatórios  
✅ **Integridade**: Constraint no campo `status` previne valores inválidos  

## Próximos Passos

1. **Aplicar a migração** seguindo o guia em `MIGRATION_GUIDE.md`
2. **Regenerar tipos do Supabase** após aplicar a migração
3. **Testar** a criação de receitas vinculadas e avulsas
4. **Verificar** os relatórios com dados de teste

## Arquivos Modificados

1. ✅ `supabase/migrations/20260201000001_fix_payments_table.sql` - Nova migração
2. ✅ `src/lib/types.ts` - Interface Payment atualizada
3. ✅ `src/app/admin/financial/page.tsx` - Criação e exibição de pagamentos corrigida
4. ✅ `src/app/admin/reports/page.tsx` - Filtragem e exibição corrigida
5. ✅ `MIGRATION_GUIDE.md` - Guia de migração criado

## Validação

- ✅ Compilação TypeScript sem erros
- ✅ Build bem-sucedido
- ✅ Code review aprovado
- ✅ Scan de segurança (CodeQL): 0 vulnerabilidades
