# Sistema de Consulta de Audiências TRT

## Visão Geral

Este módulo implementa um sistema completo para consulta e gerenciamento de audiências dos Tribunais Regionais do Trabalho (TRT).

## Funcionalidades

### 1. Consulta de Audiências por Advogado
- Busca de audiências filtrando pelo nome do advogado da parte
- Listagem completa de todas as audiências do advogado
- Atualização automática em tempo real (a cada 30 segundos)

### 2. Gerenciamento de Status
O sistema permite rastrear o status das audiências:
- **Agendada**: Audiência confirmada e aguardando realização
- **Cancelada**: Audiência cancelada
- **Redesignada**: Audiência reagendada para nova data
- **Realizada**: Audiência já concluída

### 3. Atribuição de Advogado Responsável
- Campo específico para indicar qual advogado comparecerá à audiência
- Permite organizar a agenda da equipe jurídica

### 4. Informações Completas
Cada audiência contém:
- Número do processo
- Advogado da parte (nome usado na busca)
- Data e hora da audiência
- Tipo de audiência (Inicial, Instrução, etc.)
- Tribunal (ex: TRT 2ª Região)
- Vara
- Local (endereço)
- Status atual
- Advogado responsável
- Observações adicionais

## Estrutura Técnica

### Backend

#### Banco de Dados
- Tabela: `audiencias_trt`
- Arquivo SQL: `/backend/sql/create_audiencias_trt_table.sql`
- Migração Supabase: `/supabase/migrations/20260127195400_create_audiencias_trt_table.sql`

#### API
- Rota: `/api/audiencias`
- Arquivo: `/backend/routes/audiencias.js`
- Métodos:
  - `GET /api/audiencias` - Lista audiências (com filtro opcional)
  - `GET /api/audiencias/:id` - Busca audiência específica
  - `POST /api/audiencias` - Cria nova audiência
  - `PUT /api/audiencias/:id` - Atualiza audiência
  - `DELETE /api/audiencias/:id` - Remove audiência

### Frontend

#### Página Principal
- Localização: `/src/pages/admin/AudienciasTRT.tsx`
- Rota: `/admin/audiencias-trt`
- Componentes:
  - Formulário de busca por advogado
  - Tabela listando todas as audiências
  - Dialog para criar/editar audiências
  - Badges de status coloridos
  - Botão de atualização manual

#### Hooks
- Arquivo: `/src/hooks/useAudiencias.tsx`
- Funcionalidades:
  - `useAudiencias(advogadoFilter?)` - Lista audiências com filtro
  - `useAudienciaById(id)` - Busca audiência específica
  - `useCreateAudiencia()` - Cria nova audiência
  - `useUpdateAudiencia()` - Atualiza audiência
  - `useDeleteAudiencia()` - Remove audiência

#### Tipos TypeScript
- Arquivo: `/src/lib/types.ts`
- Tipos definidos:
  - `HearingStatus` - Status possíveis da audiência
  - `AudienciaTRT` - Interface completa da audiência

## Como Usar

### 1. Acessar o Sistema
1. Faça login no sistema
2. No menu lateral, clique em "Audiências TRT"

### 2. Buscar Audiências
1. Digite o nome do advogado no campo de busca
2. Clique em "Buscar"
3. O sistema listará todas as audiências do advogado
4. Use o botão "Limpar" para remover o filtro

### 3. Criar Nova Audiência
1. Clique no botão "Nova Audiência"
2. Preencha os dados obrigatórios (*):
   - Número do processo
   - Advogado da parte
   - Data da audiência
   - Status
3. Preencha os dados opcionais (recomendado):
   - Hora da audiência
   - Tipo de audiência
   - Tribunal
   - Vara
   - Local
   - Advogado responsável
   - Observações
4. Clique em "Criar"

### 4. Editar Audiência
1. Na listagem, clique no ícone de lápis
2. Modifique os dados desejados
3. Clique em "Atualizar"

### 5. Atribuir Advogado Responsável
1. Edite a audiência
2. Preencha o campo "Advogado Responsável"
3. Salve as alterações

### 6. Atualizar Status
1. Edite a audiência
2. Selecione o novo status no dropdown
3. Adicione observações se necessário
4. Salve as alterações

### 7. Excluir Audiência
1. Na listagem, clique no ícone de lixeira
2. Confirme a exclusão

## Atualização em Tempo Real

O sistema automaticamente busca novas informações a cada 60 segundos, garantindo que os dados estejam sempre atualizados sem sobrecarregar o servidor. Você também pode forçar uma atualização imediata clicando no ícone de "Refresh" ao lado do botão de busca.

## Considerações de Segurança

- Todas as operações requerem autenticação
- Apenas usuários autenticados podem acessar as audiências
- Row Level Security (RLS) habilitado no Supabase
- Validação de dados no frontend e backend

## Possíveis Melhorias Futuras

1. Integração com APIs dos TRTs para importação automática
2. Notificações por e-mail/SMS de audiências próximas
3. Exportação de relatórios em PDF
4. Sincronização com calendário Google/Outlook
5. Dashboard com estatísticas de audiências
6. Filtros avançados (por tribunal, período, status, etc.)
7. Histórico de alterações nas audiências
