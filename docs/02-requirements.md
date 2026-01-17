# Requisitos de Software

## Requisitos Funcionais

### Autenticacao
- v1: Local-only (sem autenticacao)
- v2: Planejado com sync em nuvem

### CRUD Principal

**Projetos:**
- Criar, Listar, Visualizar, Editar, Excluir
- Exportar documentacao e SQL
- Importar JSON de backup

**Tabelas:**
- Criar, Listar, Visualizar, Editar, Excluir
- Exportar SQL individual

**Colunas:**
- Criar, Listar, Visualizar, Editar, Excluir
- Reordenar via drag & drop

**Relacionamentos:**
- Criar, Listar, Visualizar, Editar, Excluir
- Visualizar no diagrama ER

### Busca e Filtros
- Busca por entidade (projetos, tabelas)
- Ordenacao (alfabetica, data)

### Outros Funcionais
- Modo offline: Obrigatorio
- Comentarios/notas em tabelas e colunas
- Projetos favoritos

## Requisitos Nao-Funcionais

### Performance
- Tempo de resposta: < 200ms
- Carregamento inicial: < 2s
- Tamanho do app: 30 MB

### Seguranca
- Dados locais (sem criptografia necessaria)
- Backup manual em JSON

## Priorizacao MoSCoW

### Must Have (MVP)
- CRUD de projetos, tabelas, colunas
- Configuracao de tipos de dados
- Geracao de SQL CREATE TABLE
- Exportacao de migrations Laravel
- Geracao de claude.md
- Modo offline
- Storage local (SQLite)

### Should Have
- Relacionamentos e foreign keys
- Diagrama ER visual
- Aba Perguntas de UX
- Aba Requisitos de Software
- Exportacao de documentacao markdown

### Could Have
- Aba Estilo de Design
- Aba Stack Frontend/Backend
- Aba Integracoes/Ambientes/Glossario
- Projetos favoritos
- Duplicar projeto
- Onboarding tutorial

### Won't Have (v1)
- Autenticacao
- Sync em nuvem
- Multi-idioma
- Colaboracao multi-usuario
