import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DesignData,
  ColorPalette,
  DarkModeConfig,
  TypographyConfig,
  TypographyScale,
  ComponentsConfig,
  IconographyConfig,
  SpacingConfig,
  AnimationsConfig,
  VoiceToneConfig,
  DesignReference,
  Project,
} from '../../../../models';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-design-system',
  templateUrl: './design-system.page.html',
  styleUrls: ['./design-system.page.scss'],
  standalone: false,
})
export class DesignSystemPage implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  isLoading = true;

  // Active section
  activeSection: 'colors' | 'typography' | 'components' | 'icons' | 'animations' | 'voice' = 'colors';

  // Data
  colors: ColorPalette = this.getDefaultColors();
  darkMode: DarkModeConfig = this.getDefaultDarkMode();
  typography: TypographyConfig = this.getDefaultTypography();
  components: ComponentsConfig = this.getDefaultComponents();
  iconography: IconographyConfig = this.getDefaultIconography();
  spacing: SpacingConfig = this.getDefaultSpacing();
  animations: AnimationsConfig = this.getDefaultAnimations();
  voiceTone: VoiceToneConfig = this.getDefaultVoiceTone();

  // Preview state
  previewDarkMode = false;

  // Options
  fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat',
    'Lato', 'Source Sans Pro', 'SF Pro', 'Nunito', 'Raleway'
  ];
  monoFontOptions = ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Monaco', 'Consolas'];
  buttonStyles = ['filled', 'outlined', 'ghost', 'gradient'];
  inputStyles = ['filled', 'outlined', 'underlined'];
  labelStyles = ['floating', 'stacked', 'inline'];
  iconLibraries = ['Ionicons', 'Material Icons', 'Feather Icons', 'Heroicons', 'Phosphor'];
  iconStyles = ['outline', 'filled', 'sharp'];
  animationLevels = ['minimal', 'normal', 'enhanced'];
  easingOptions = ['ease-in-out', 'ease-in', 'ease-out', 'linear', 'cubic-bezier'];
  loadingStyles = ['spinner', 'skeleton', 'dots', 'pulse'];
  toastPositions = ['top', 'bottom', 'top-right', 'top-left', 'bottom-right', 'bottom-left'];
  tabStyles = ['segment', 'buttons', 'underlined'];
  listSeparators = ['line', 'space', 'none'];

  sections = [
    { id: 'colors', label: 'Cores', icon: 'color-palette-outline' },
    { id: 'typography', label: 'Tipografia', icon: 'text-outline' },
    { id: 'components', label: 'Componentes', icon: 'cube-outline' },
    { id: 'icons', label: 'Ícones', icon: 'shapes-outline' },
    { id: 'animations', label: 'Animações', icon: 'sparkles-outline' },
    { id: 'voice', label: 'Voz e Tom', icon: 'chatbubble-outline' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.extractProjectId();
  }

  private extractProjectId() {
    const urlParts = this.router.url.split('/');
    const projectIndex = urlParts.indexOf('project');
    if (projectIndex !== -1 && urlParts[projectIndex + 1]) {
      const idFromUrl = parseInt(urlParts[projectIndex + 1], 10);
      if (!isNaN(idFromUrl)) {
        this.projectId = idFromUrl;
        this.loadData();
        return;
      }
    }
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const id = currentRoute.snapshot.params['id'];
      if (id) {
        this.projectId = +id;
        this.loadData();
        return;
      }
      currentRoute = currentRoute.parent;
    }
    console.error('Project ID not found in route');
    this.isLoading = false;
  }

  async loadData() {
    this.isLoading = true;
    try {
      this.project = await this.projectService.getProject(this.projectId);
      if (this.project?.designData) {
        const data = this.project.designData;
        this.colors = data.colors ?? this.getDefaultColors();
        this.darkMode = data.darkMode ?? this.getDefaultDarkMode();
        this.typography = data.typography ?? this.getDefaultTypography();
        this.components = data.components ?? this.getDefaultComponents();
        this.iconography = data.iconography ?? this.getDefaultIconography();
        this.spacing = data.spacing ?? this.getDefaultSpacing();
        this.animations = data.animations ?? this.getDefaultAnimations();
        this.voiceTone = data.voiceTone ?? this.getDefaultVoiceTone();
      } else {
        this.loadDefaultData();
      }
    } catch (error) {
      console.error('Failed to load design data:', error);
      this.loadDefaultData();
    } finally {
      this.isLoading = false;
    }
  }

  private async saveData() {
    const designData: DesignData = {
      colors: this.colors,
      darkMode: this.darkMode,
      typography: this.typography,
      components: this.components,
      iconography: this.iconography,
      spacing: this.spacing,
      animations: this.animations,
      voiceTone: this.voiceTone,
      references: [],
    };

    try {
      await this.projectService.updateDesignData(this.projectId, designData);
    } catch (error) {
      console.error('Failed to save design data:', error);
    }
  }

  loadDefaultData() {
    // Colors are already set in defaults
    this.colors = {
      primary: '#6366F1',
      primaryLight: '#818CF8',
      primaryDark: '#4F46E5',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    };

    this.darkMode = {
      enabled: true,
      defaultTheme: 'system',
      backgroundDark: '#111827',
      surfaceDark: '#1F2937',
      textPrimaryDark: '#F9FAFB',
      textSecondaryDark: '#9CA3AF',
    };

    this.typography = {
      primaryFont: 'Inter',
      secondaryFont: 'Poppins',
      monospaceFont: 'JetBrains Mono',
      scale: [
        { name: 'H1', size: 32, weight: 700, lineHeight: 1.2 },
        { name: 'H2', size: 24, weight: 600, lineHeight: 1.3 },
        { name: 'H3', size: 20, weight: 600, lineHeight: 1.4 },
        { name: 'Body', size: 16, weight: 400, lineHeight: 1.5 },
        { name: 'Small', size: 14, weight: 400, lineHeight: 1.5 },
        { name: 'Caption', size: 12, weight: 500, lineHeight: 1.4 },
      ],
    };

    this.components = {
      buttons: { style: 'filled', borderRadius: 8, sizes: ['sm', 'md', 'lg'], withIcons: true },
      cards: { elevation: 2, borderRadius: 12, hasBorder: true },
      inputs: { style: 'outlined', borderRadius: 8, labelStyle: 'floating' },
      modals: { borderRadius: 16, overlayOpacity: 0.5 },
      toasts: { position: 'bottom', duration: 3000 },
      tabs: { style: 'segment' },
      lists: { separator: 'line' },
    };

    this.iconography = {
      library: 'Ionicons',
      style: 'outline',
      defaultSize: 24,
    };

    this.animations = {
      level: 'normal',
      defaultDuration: 200,
      easing: 'ease-in-out',
      loadingStyle: 'spinner',
    };

    this.voiceTone = {
      formality: 3,
      technicality: 4,
      personality: ['Profissional', 'Amigável', 'Claro'],
      treatment: 'voce',
      examples: [
        'Projeto criado com sucesso!',
        'Ops! Algo deu errado. Tente novamente.',
        'Tem certeza que deseja excluir?',
      ],
    };
  }

  selectSection(section: any) {
    this.activeSection = section.id;
  }

  getDefaultColors(): ColorPalette {
    return {
      primary: '#6366F1',
      primaryLight: '#818CF8',
      primaryDark: '#4F46E5',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    };
  }

  getDefaultDarkMode(): DarkModeConfig {
    return {
      enabled: true,
      defaultTheme: 'system',
      backgroundDark: '#111827',
      surfaceDark: '#1F2937',
      textPrimaryDark: '#F9FAFB',
      textSecondaryDark: '#9CA3AF',
    };
  }

  getDefaultTypography(): TypographyConfig {
    return {
      primaryFont: 'Inter',
      scale: [],
    };
  }

  getDefaultComponents(): ComponentsConfig {
    return {
      buttons: { style: 'filled', borderRadius: 8, sizes: ['sm', 'md', 'lg'], withIcons: true },
      cards: { elevation: 2, borderRadius: 12, hasBorder: true },
      inputs: { style: 'outlined', borderRadius: 8, labelStyle: 'floating' },
      modals: { borderRadius: 16, overlayOpacity: 0.5 },
      toasts: { position: 'bottom', duration: 3000 },
      tabs: { style: 'segment' },
      lists: { separator: 'line' },
    };
  }

  getDefaultIconography(): IconographyConfig {
    return {
      library: 'Ionicons',
      style: 'outline',
      defaultSize: 24,
    };
  }

  getDefaultSpacing(): SpacingConfig {
    return {
      baseUnit: 4,
      scale: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    };
  }

  getDefaultAnimations(): AnimationsConfig {
    return {
      level: 'normal',
      defaultDuration: 200,
      easing: 'ease-in-out',
      loadingStyle: 'spinner',
    };
  }

  getDefaultVoiceTone(): VoiceToneConfig {
    return {
      formality: 3,
      technicality: 3,
      personality: [],
      treatment: 'voce',
      examples: [],
    };
  }

  // Color helpers
  colorFields: Array<{ key: keyof ColorPalette; label: string }> = [
    { key: 'primary', label: 'Primária' },
    { key: 'primaryLight', label: 'Primária Clara' },
    { key: 'primaryDark', label: 'Primária Escura' },
    { key: 'secondary', label: 'Secundária' },
    { key: 'accent', label: 'Destaque' },
    { key: 'background', label: 'Fundo' },
    { key: 'surface', label: 'Superfície' },
    { key: 'textPrimary', label: 'Texto Primário' },
    { key: 'textSecondary', label: 'Texto Secundário' },
    { key: 'success', label: 'Sucesso' },
    { key: 'warning', label: 'Alerta' },
    { key: 'error', label: 'Erro' },
    { key: 'info', label: 'Informação' },
  ];

  darkModeColorFields: Array<{ key: keyof DarkModeConfig; label: string }> = [
    { key: 'backgroundDark', label: 'Fundo' },
    { key: 'surfaceDark', label: 'Superfície' },
    { key: 'textPrimaryDark', label: 'Texto Primário' },
    { key: 'textSecondaryDark', label: 'Texto Secundário' },
  ];

  personalityOptions = ['Profissional', 'Amigável', 'Técnico', 'Casual', 'Claro', 'Objetivo', 'Empático'];

  async togglePersonality(trait: string) {
    const index = this.voiceTone.personality.indexOf(trait);
    if (index === -1) {
      this.voiceTone.personality.push(trait);
    } else {
      this.voiceTone.personality.splice(index, 1);
    }
    await this.saveData();
  }

  async addExample() {
    this.voiceTone.examples.push('');
    await this.saveData();
  }

  async removeExample(index: number) {
    this.voiceTone.examples.splice(index, 1);
    await this.saveData();
  }

  trackByIndex(index: number): number {
    return index;
  }

  async onFieldChange() {
    await this.saveData();
  }
}
