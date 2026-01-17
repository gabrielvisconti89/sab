# Stack Frontend

## Ionic Framework

**Versao:** Stable mais recente via Ionic CLI
**Capacitor:** Versao inclusa no template
**Plataformas:** iOS, Android

## Angular

**Versao:** Inclusa no Ionic CLI
**Strict mode:** ON
**Standalone components:** ON
**SSR/SSG:** OFF

## Dependencias Obrigatorias

- @ionic/angular (incluso)
- @ionic/storage-angular (storage local)
- @capacitor/core (incluso)
- @capacitor/filesystem (exportacao)
- @capacitor/share (compartilhar exports)
- tailwindcss (estilizacao)
- @angular/cdk (drag-drop)

## Dependencias Opcionais (v2)

- @capacitor/push-notifications
- ngx-translate

## Configuracoes de Build

**Bundle analyzer:** OFF
**Source maps (prod):** OFF
**PWA:** OFF (v1 foca em apps nativos)
**Lazy loading:** ON (por feature)

## Estrutura de Pastas

```
/app/src/app/
├── pages/
│   ├── home/
│   └── project/
│       └── tabs/
│           ├── ux-research/
│           ├── requirements/
│           ├── design-system/
│           ├── data-architecture/
│           ├── frontend-stack/
│           ├── backend-stack/
│           ├── integrations/
│           ├── environments/
│           └── glossary/
├── components/
│   ├── project-card/
│   ├── table-card/
│   ├── column-item/
│   ├── column-editor/
│   └── export-modal/
├── services/
│   ├── storage.service.ts
│   ├── project.service.ts
│   ├── table.service.ts
│   ├── column.service.ts
│   ├── relationship.service.ts
│   ├── sql-generator.service.ts
│   └── migration-generator.service.ts
├── models/
│   ├── project.model.ts
│   ├── table.model.ts
│   ├── column.model.ts
│   └── relationship.model.ts
└── shared/
    ├── pipes/
    └── directives/
```
