# Arquitetura de Dados

## Configuracoes do Banco

**Banco interno:** SQLite
**Charset:** UTF-8

## Tabelas do Sistema

### projects

Armazena os projetos criados pelo usuario.

| Coluna | Tipo | Nullable | Default | Index |
|--------|------|----------|---------|-------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PK |
| name | VARCHAR(255) | NO | - | IDX |
| description | TEXT | YES | NULL | - |
| database_type | ENUM | NO | 'mysql' | - |
| database_charset | VARCHAR(50) | NO | 'utf8mb4' | - |
| database_collation | VARCHAR(50) | NO | 'utf8mb4_unicode_ci' | - |
| table_prefix | VARCHAR(20) | YES | NULL | - |
| is_favorite | BOOLEAN | NO | FALSE | - |
| progress_percentage | TINYINT | NO | 0 | - |
| ux_data | JSON | YES | NULL | - |
| requirements_data | JSON | YES | NULL | - |
| design_data | JSON | YES | NULL | - |
| frontend_stack_data | JSON | YES | NULL | - |
| backend_stack_data | JSON | YES | NULL | - |
| integrations_data | JSON | YES | NULL | - |
| environments_data | JSON | YES | NULL | - |
| glossary_data | JSON | YES | NULL | - |
| created_at | TIMESTAMP | YES | NULL | - |
| updated_at | TIMESTAMP | YES | NULL | - |
| deleted_at | TIMESTAMP | YES | NULL | - |

### tables

Armazena as tabelas modeladas em cada projeto.

| Coluna | Tipo | Nullable | Default | Index | FK |
|--------|------|----------|---------|-------|-----|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PK | - |
| project_id | BIGINT UNSIGNED | NO | - | IDX | projects.id |
| name | VARCHAR(255) | NO | - | - | - |
| description | TEXT | YES | NULL | - | - |
| has_timestamps | BOOLEAN | NO | TRUE | - | - |
| has_soft_delete | BOOLEAN | NO | FALSE | - | - |
| order_index | INT UNSIGNED | NO | 0 | - | - |
| created_at | TIMESTAMP | YES | NULL | - | - |
| updated_at | TIMESTAMP | YES | NULL | - | - |
| deleted_at | TIMESTAMP | YES | NULL | - | - |

### columns

Armazena as colunas de cada tabela.

| Coluna | Tipo | Nullable | Default | Index | FK |
|--------|------|----------|---------|-------|-----|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PK | - |
| table_id | BIGINT UNSIGNED | NO | - | IDX | tables.id |
| name | VARCHAR(255) | NO | - | - | - |
| description | TEXT | YES | NULL | - | - |
| data_type | VARCHAR(50) | NO | - | - | - |
| data_length | INT UNSIGNED | YES | NULL | - | - |
| data_precision | INT UNSIGNED | YES | NULL | - | - |
| data_scale | INT UNSIGNED | YES | NULL | - | - |
| is_nullable | BOOLEAN | NO | FALSE | - | - |
| default_value | VARCHAR(255) | YES | NULL | - | - |
| is_primary_key | BOOLEAN | NO | FALSE | - | - |
| is_auto_increment | BOOLEAN | NO | FALSE | - | - |
| is_unique | BOOLEAN | NO | FALSE | - | - |
| is_indexed | BOOLEAN | NO | FALSE | - | - |
| is_unsigned | BOOLEAN | NO | FALSE | - | - |
| enum_values | JSON | YES | NULL | - | - |
| order_index | INT UNSIGNED | NO | 0 | - | - |
| created_at | TIMESTAMP | YES | NULL | - | - |
| updated_at | TIMESTAMP | YES | NULL | - | - |

### relationships

Armazena os relacionamentos entre tabelas.

| Coluna | Tipo | Nullable | Default | Index | FK |
|--------|------|----------|---------|-------|-----|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PK | - |
| project_id | BIGINT UNSIGNED | NO | - | IDX | projects.id |
| source_table_id | BIGINT UNSIGNED | NO | - | IDX | tables.id |
| target_table_id | BIGINT UNSIGNED | NO | - | IDX | tables.id |
| source_column_id | BIGINT UNSIGNED | NO | - | IDX | columns.id |
| target_column_id | BIGINT UNSIGNED | NO | - | IDX | columns.id |
| type | ENUM | NO | '1:N' | - | - |
| on_delete | ENUM | NO | 'CASCADE' | - | - |
| on_update | ENUM | NO | 'CASCADE' | - | - |
| pivot_table_name | VARCHAR(255) | YES | NULL | - | - |
| created_at | TIMESTAMP | YES | NULL | - | - |
| updated_at | TIMESTAMP | YES | NULL | - | - |

### app_settings

Armazena configuracoes do aplicativo.

| Coluna | Tipo | Nullable | Default | Index |
|--------|------|----------|---------|-------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PK |
| key | VARCHAR(100) | NO | - | UQ |
| value | TEXT | YES | NULL | - |
| created_at | TIMESTAMP | YES | NULL | - |
| updated_at | TIMESTAMP | YES | NULL | - |

## Relacionamentos

1. projects -> tables (1:N)
2. tables -> columns (1:N)
3. projects -> relationships (1:N)
4. tables -> relationships como source (1:N)
5. tables -> relationships como target (1:N)
