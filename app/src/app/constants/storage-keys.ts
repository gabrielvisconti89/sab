export const STORAGE_KEYS = {
  // Global keys
  PROJECTS_INDEX: 'sab_projects',
  APP_SETTINGS: 'sab_settings',
  LAST_OPENED_PROJECT: 'sab_last_project',

  // Project-scoped keys (functions return key string)
  project: (id: number) => `sab_project_${id}`,
  tables: (projectId: number) => `sab_project_${projectId}_tables`,
  relationships: (projectId: number) => `sab_project_${projectId}_relationships`,
} as const;
