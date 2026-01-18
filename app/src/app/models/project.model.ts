export type DatabaseType = 'mysql' | 'postgresql' | 'sqlite' | 'mariadb';

export interface Project {
  id: number;
  name: string;
  description?: string;
  databaseType: DatabaseType;
  databaseCharset: string;
  databaseCollation: string;
  tablePrefix?: string;
  isFavorite: boolean;
  progressPercentage: number;
  uxData?: UxData;
  requirementsData?: RequirementsData;
  designData?: DesignData;
  frontendStackData?: FrontendStackData;
  backendStackData?: BackendStackData;
  integrationsData?: IntegrationsData;
  environmentsData?: EnvironmentsData;
  glossaryData?: GlossaryData;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UxData {
  personas: Persona[];
  problemCentral: ProblemCentral;
  journey: JourneyStep[];
  screens: Screen[];
  criticalActions: CriticalAction[];
  usageContext: UsageContext;
  onboarding: OnboardingConfig;
}

export interface Persona {
  id: number;
  name: string;
  ageRange: string;
  technicalProfile: string;
  profession: string;
  usageContext: string;
  frustrations: string;
  objectives: string;
  isPrimary: boolean;
}

export interface ProblemCentral {
  problemStatement: string;
  detailedDescription: string;
  proposedSolution: string;
  differential: string;
}

export interface JourneyStep {
  id: number;
  order: number;
  title: string;
  description: string;
  emotion: string;
  associatedScreenId?: number;
}

export interface Screen {
  id: number;
  name: string;
  type: 'list' | 'detail' | 'form' | 'dashboard' | 'modal' | 'settings';
  description: string;
  mainComponents: string[];
  priority: 'essential' | 'important' | 'desirable';
  wireframeUrl?: string;
}

export interface CriticalAction {
  id: number;
  action: string;
  description: string;
  relatedScreenId?: number;
  criticality: 'blocking' | 'high' | 'medium' | 'low';
}

export interface UsageContext {
  frequency: string;
  priorityDevice: string;
  targetPlatforms: string[];
  offlineRequired: boolean;
  accessibilityRequirements: string[];
}

export interface OnboardingConfig {
  needsTutorial: boolean;
  type?: string;
  stepsCount?: number;
  skipAllowed: boolean;
}

export interface RequirementsData {
  functional: FunctionalRequirements;
  nonFunctional: NonFunctionalRequirements;
  moscow: MoscowPrioritization;
}

export interface RequirementItem {
  label: string;
  value: boolean;
}

export interface MetricItem {
  label: string;
  value: string | number;
  unit?: string;
}

export interface FunctionalRequirements {
  authentication: Record<string, RequirementItem>;
  userManagement: Record<string, RequirementItem>;
  crudEntities: CrudEntity[];
  notifications: Record<string, RequirementItem>;
  searchFilters: Record<string, RequirementItem>;
  reports: Record<string, RequirementItem>;
  other: Record<string, RequirementItem>;
}

export interface CrudEntity {
  name: string;
  create: boolean;
  list: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
}

export interface BackupItem {
  label: string;
  value: string;
}

export interface NonFunctionalRequirements {
  performance: Record<string, MetricItem>;
  scalability: Record<string, MetricItem>;
  availability: Record<string, MetricItem>;
  security: Record<string, RequirementItem>;
  backup: Record<string, BackupItem>;
}

export interface MoscowPrioritization {
  mustHave: string[];
  shouldHave: string[];
  couldHave: string[];
  wontHave: string[];
}

export interface DesignData {
  colors: ColorPalette;
  darkMode: DarkModeConfig;
  typography: TypographyConfig;
  components: ComponentsConfig;
  iconography: IconographyConfig;
  spacing: SpacingConfig;
  animations: AnimationsConfig;
  voiceTone: VoiceToneConfig;
  references: DesignReference[];
}

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface DarkModeConfig {
  enabled: boolean;
  defaultTheme: 'light' | 'dark' | 'system';
  backgroundDark?: string;
  surfaceDark?: string;
  textPrimaryDark?: string;
  textSecondaryDark?: string;
}

export interface TypographyConfig {
  primaryFont: string;
  secondaryFont?: string;
  monospaceFont?: string;
  scale: TypographyScale[];
}

export interface TypographyScale {
  name: string;
  size: number;
  weight: number;
  lineHeight: number;
}

export interface ComponentsConfig {
  buttons: { style: string; borderRadius: number; sizes: string[]; withIcons: boolean };
  cards: { elevation: number; borderRadius: number; hasBorder: boolean };
  inputs: { style: string; borderRadius: number; labelStyle: string };
  modals: { borderRadius: number; overlayOpacity: number };
  toasts: { position: string; duration: number };
  tabs: { style: string };
  lists: { separator: string };
}

export interface IconographyConfig {
  library: string;
  style: string;
  defaultSize: number;
}

export interface SpacingConfig {
  baseUnit: number;
  scale: Record<string, number>;
}

export interface AnimationsConfig {
  level: string;
  defaultDuration: number;
  easing: string;
  loadingStyle: string;
}

export interface VoiceToneConfig {
  formality: number;
  technicality: number;
  personality: string[];
  treatment: string;
  examples: string[];
}

export interface DesignReference {
  id: number;
  imageUrl?: string;
  source: string;
  notes: string;
}

export interface FrontendStackData {
  ionic: { version: string };
  angular: { version: string; strictMode: boolean; standaloneComponents: boolean; ssr: boolean };
  capacitor: { version: string; platforms: string[] };
  dependencies: Dependency[];
  buildConfig: Record<string, boolean>;
}

export type BackendFrameworkType = 'none' | 'laravel' | 'nodejs';

export interface LaravelConfig {
  version: string;      // '11.x' | '12.x'
  apiAuth: string;      // 'Sanctum' | 'Passport' | 'Nenhuma'
}

export interface NodejsConfig {
  framework: string;    // 'Express' | 'NestJS'
  auth: string;         // 'JWT' | 'Session' | 'Nenhuma'
}

export interface BackendStackData {
  framework: BackendFrameworkType;
  laravel?: LaravelConfig;
  nodejs?: NodejsConfig;
  database?: { driver: string };
}

export interface Dependency {
  name: string;
  version?: string;
  isDev: boolean;
  enabled: boolean;
}

export interface IntegrationsData {
  externalApis: ExternalApi[];
  webhooksReceived: Webhook[];
  webhooksSent: Webhook[];
}

export interface ExternalApi {
  id: number;
  name: string;
  category: string;
  baseUrl: string;
  apiVersion: string;
  authType: string;
  documentationUrl?: string;
  envVariables: string[];
  endpoints: string;
  purpose: string;
}

export interface Webhook {
  id: number;
  source?: string;
  event: string;
  endpoint: string;
  action?: string;
  payload?: string;
  authType?: string;
  retryPolicy?: string;
}

export interface EnvironmentsData {
  local: EnvironmentConfig;
  development: EnvironmentConfig;
  staging: EnvironmentConfig;
  production: EnvironmentConfig;
}

export interface EnvironmentConfig {
  frontendUrl: string;
  apiUrl: string;
  adminUrl?: string;
  server: string;
  database: string;
  notes: string;
  envVariables: Record<string, string>;
}

export interface GlossaryData {
  terms: GlossaryTerm[];
}

export interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
  synonyms: string[];
  relatedEntity?: string;
  usageExample?: string;
}
