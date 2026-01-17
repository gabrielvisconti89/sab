# Software Architecture Builder

## Resumo do Projeto

Aplicativo mobile para criacao visual de arquitetura de software e geracao automatica de schemas de banco de dados. Permite documentar projetos desde UX ate arquitetura de dados, gerando SQL e migrations Laravel.

## Documentacao

- [01 - UX Research](./docs/01-ux-research.md)
- [02 - Requisitos de Software](./docs/02-requirements.md)
- [03 - Design System](./docs/03-design-system.md)
- [04 - Arquitetura de Dados](./docs/04-data-architecture.md)
- [05 - Stack Frontend](./docs/05-frontend-stack.md)
- [06 - Stack Backend](./docs/06-backend-stack.md)
- [07 - Integracoes](./docs/07-integrations.md)
- [08 - Ambientes](./docs/08-environments.md)
- [09 - Glossario](./docs/09-glossary.md)
- [10 - Padroes Aprovados](./docs/10-patterns.md)

## Estrutura de Projetos

Dentro desta pasta existem duas subpastas irmas de codigo-fonte:

- `/api` - Projeto backend em Laravel 12 (preparado para v2 com sync em nuvem)
- `/app` - Projeto frontend mobile em Ionic CLI (versao stable) + Angular + Tailwind CSS

Ambas as pastas sao irmas no mesmo nivel hierarquico e devem ser tratadas como projetos independentes.

## Instrucoes para o Claude

### Fluxo de Desenvolvimento Obrigatorio: Front-end First

O desenvolvimento deve seguir obrigatoriamente a ordem: Front-end primeiro, Back-end depois.

**Fase 1 - Front-end Estatico Completo:**
1. Criar todas as telas com layout completo
2. Implementar todos os componentes visuais
3. Aplicar estilizacao com Tailwind CSS
4. Configurar navegacao entre telas
5. Implementar estados visuais (loading, empty, error, success)
6. Usar dados mockados para popular interfaces
7. Garantir responsividade
8. Implementar animacoes

**Fase 2 - Previa e Validacao:**
1. Apresentar previa funcional ao usuario
2. Listar telas implementadas
3. Destacar decisoes de UI/UX
4. Perguntar se deseja incluir, remover ou modificar algo
5. Aguardar aprovacao

**Fase 3 - Back-end:**
So iniciar quando front-end estiver aprovado OU usuario der consentimento explicito.

### Validacao Visual Obrigatoria com Playwright MCP

**REGRA IMPERATIVA:** A cada mudanca visual no codigo, o Claude DEVE usar o MCP Playwright para validar.

**Ferramentas MCP Playwright disponiveis:**
- `browser_navigate` - Navegar para URL
- `browser_screenshot` - Capturar screenshot da pagina
- `browser_click` - Clicar em elemento
- `browser_type` - Digitar texto
- `browser_snapshot` - Capturar snapshot de acessibilidade

**Fluxo obrigatorio para mudancas visuais:**
1. Usar `browser_navigate` para ir ate a pagina afetada (`http://localhost:8100/...`)
2. Usar `browser_screenshot` para capturar estado "ANTES"
3. Implementar as mudancas no codigo
4. Aguardar hot-reload (5-10 segundos)
5. Usar `browser_screenshot` para capturar estado "DEPOIS"
6. Apresentar ambos screenshots ao usuario para validacao

**Regras:**
- NUNCA confiar apenas em testes unitarios para mudancas visuais
- SEMPRE capturar screenshot apos qualquer alteracao de CSS, HTML ou layout
- Screenshots devem ser salvos em `./app/screenshots/` com nomenclatura descritiva
- Se o MCP Playwright nao estiver disponivel, ALERTAR o usuario antes de prosseguir

### Uso de Checklists

O Claude deve manter checklists atualizadas para cada modulo, seguindo o modelo:
- Progresso visual (X/Y itens)
- Status atual
- Itens com checkbox
- Proximos passos
- Bloqueios

Atualizar checklist apos cada implementacao e mostrar ao usuario.

### Diretriz de UI/UX

Utilizar componentes nativos do Ionic, ajustando para responsividade e boas praticas de UX.

### Empty State Pattern - Obrigatorio

**REGRA IMPERATIVA:** Toda tela com lista ou conteudo vazio DEVE seguir o padrao de Empty State documentado em `/docs/10-patterns.md`.

**Elementos obrigatorios:**
1. **Icone** - `text-6xl text-white/30 mb-4`
2. **Mensagem** - `text-white/50` com texto "Nenhum(a) [item] cadastrado(a)"
3. **Card Educativo** - Card com titulo, descricao e 3 vantagens

**Ao criar nova tela:**
- Implementar empty state seguindo o padrao antes de popular com dados
- Consultar `/docs/10-patterns.md` para estrutura HTML exata

**Ao modificar tela existente:**
- Verificar se empty state segue o padrao
- Adaptar se necessario antes de outras alteracoes

### Diretriz de Estilizacao - Tailwind CSS Obrigatorio

Toda estilizacao deve usar Tailwind CSS. CSS customizado so quando nao existir classe Tailwind - consultar MCP antes e documentar excecao.

### Registro de Padroes

A cada solicitacao implementada e aprovada, registrar no `/docs/10-patterns.md`:
- Descricao do problema
- Solucao implementada
- Arquivos envolvidos
- Codigo de exemplo
- Data de aprovacao

Consultar padroes antes de implementar algo novo.

### Verificacao de Documentacao via MCP

Consultar documentacao oficial via MCP a cada planejamento ou implementacao.

### Consulta Obrigatoria aos MCPs - Antes e Depois

**REGRA IMPERATIVA:** O Claude DEVE consultar os MCPs relevantes ANTES e DEPOIS de cada atividade de desenvolvimento.

**Fluxo obrigatorio:**

1. **ANTES de implementar:**
   - Consultar MCP Ionic para verificar sintaxe correta de componentes
   - Consultar MCP Ionic para verificar padroes de layout recomendados
   - Consultar documentacao oficial via MCP

2. **DURANTE a implementacao:**
   - Seguir exatamente os padroes retornados pelo MCP
   - Usar componentes nativos quando disponiveis

3. **DEPOIS de implementar:**
   - Usar Playwright MCP para validar visualmente (screenshot)
   - Comparar resultado com o esperado
   - Se diferente, corrigir antes de apresentar ao usuario

**MCPs disponiveis:**
- `awesome-ionic-mcp` - Componentes Ionic, Capacitor, CLI
- `playwright` - Validacao visual, screenshots, navegacao
- `magic` - Componentes UI React (21st.dev)

## MCPs Obrigatorios

**Frontend:** Ionic, Angular, Tailwind CSS, Capacitor
**Backend:** Laravel, PHP
**Banco de Dados:** MySQL, SQLite

## Comandos de Desenvolvimento

### Frontend (Ionic)

**Antes de iniciar `ionic serve`:** Sempre verificar se o servidor ja esta rodando em `localhost:8100` (pode estar em outro terminal). Usar `curl -s http://localhost:8100 | head -5` para verificar.

```bash
cd app
npm install
ionic serve
```

### Build para dispositivos
```bash
ionic cap add ios
ionic cap add android
ionic cap run ios
ionic cap run android
```

## Tecnologias

- **Frontend:** Ionic CLI (stable) + Angular + Tailwind CSS
- **Backend:** Laravel 12 (preparado para v2)
- **Database interno:** SQLite
- **Database output:** MySQL, PostgreSQL, SQLite
