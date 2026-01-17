# UX Research

## Persona Principal

**Nome ficticio:** Rafael Dev
**Idade/Faixa etaria:** Adulto (25-45 anos)
**Perfil tecnico:** Intermediario a Avancado
**Profissao/Contexto:** Desenvolvedor full-stack, tech lead, ou freelancer que trabalha com multiplos projetos simultaneamente
**Contexto de uso:** Usa o app no inicio de novos projetos, durante reunioes de planejamento, ou quando precisa documentar sistemas existentes.
**Frustracoes atuais:** Perde tempo criando migrations manualmente, esquece de documentar decisoes arquiteturais, nao tem um lugar centralizado para especificacoes.
**Objetivos:** Ter documentacao sempre atualizada, gerar codigo de banco automaticamente, manter consistencia entre projetos.

## Persona Secundaria

**Nome ficticio:** Marina PM
**Idade/Faixa etaria:** Adulto (28-40 anos)
**Perfil tecnico:** Basico a Intermediario
**Profissao/Contexto:** Product Manager ou Project Manager que precisa entender e validar especificacoes tecnicas
**Contexto de uso:** Revisao de requisitos, alinhamento com stakeholders, documentacao para handoff
**Frustracoes atuais:** Documentacao tecnica e confusa, nao consegue visualizar a arquitetura
**Objetivos:** Ter visao clara do que sera construido, validar requisitos de forma visual

## Problema Central

**Problema em uma frase:** Desenvolvedores perdem tempo significativo documentando arquitetura e criando scripts de banco manualmente, resultando em documentacao desatualizada ou inexistente.

**Solucao proposta:** Um aplicativo mobile que guia o desenvolvedor por todas as etapas de especificacao de um projeto, gerando automaticamente documentacao estruturada e scripts SQL/migrations.

## Jornada do Usuario

1. Abertura do app - Ve lista de projetos existentes
2. Criar novo projeto - Preenche nome e descricao
3. Preencher UX Research - Define personas, problema, jornada
4. Definir requisitos - Seleciona funcionalidades via toggles
5. Configurar design system - Escolhe cores, tipografia
6. Modelar banco de dados - Cria tabelas, colunas, relacionamentos
7. Gerar exportacao - Exporta SQL, migrations, docs
8. Usar documentacao gerada - Abre no VS Code com Claude

## Telas Principais

- Home (Lista de Projetos)
- Projeto (Container de Abas)
- Perguntas de UX
- Requisitos de Software
- Estilo de Design
- Arquitetura de Dados
- Diagrama ER
- Stack Frontend/Backend
- Integracoes
- Ambientes
- Glossario
- Modal de Exportacao

## Contexto de Uso

**Frequencia de uso:** Semanal a Mensal
**Dispositivo prioritario:** Mobile First
**Plataformas alvo:** iOS, Android
**Uso offline necessario:** Sim
**Requisitos de acessibilidade:** Fonte ajustavel, alto contraste (dark mode)

## Onboarding

**Tipo:** Tour guiado com tooltips progressivos
**Quantidade de passos:** 5 (criar projeto, navegar abas, criar tabela, adicionar coluna, exportar)
**Skip permitido:** Sim
