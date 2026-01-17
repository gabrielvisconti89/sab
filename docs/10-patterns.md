# Padroes Aprovados

Este documento registra solucoes implementadas e aprovadas pelo usuario para referencia futura.

## Como Usar

Antes de implementar algo novo, consulte este arquivo para verificar se ja existe um padrao aprovado.

A cada nova implementacao aprovada, registre:
- Descricao do problema
- Solucao implementada
- Arquivos envolvidos
- Codigo de exemplo
- Data de aprovacao

---

## Padroes Registrados

### Formularios

**Data:** 2026-01-08
**Problema:** Inconsistencia visual entre formularios do projeto (alguns usam ion-input, outros HTML nativo)
**Solucao:** Padronizar todos os formularios usando HTML nativo com Tailwind CSS

**Referencia:** Modal "Novo Projeto" em `src/app/home/home.page.html`

#### Container do Formulario
```html
<div class="p-6 rounded-3xl glass-morphism space-y-4">
  <!-- campos aqui -->
</div>
```

**Nota:** Use `space-y-4` (1rem) entre campos. A label tem `mb-2` (0.5rem), criando proporção onde labels ficam 2x mais perto do seu input do que do campo anterior.

#### Label
```html
<label class="block text-xs font-medium text-gray-300 mb-2 ml-1">
  Nome do campo
</label>
```

#### Input Text
```html
<input
  type="text"
  [(ngModel)]="model.field"
  placeholder="Placeholder..."
  class="block w-full bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/50 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
/>
```

#### Input Number
```html
<input
  type="number"
  [(ngModel)]="model.field"
  placeholder="0"
  class="block w-full bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/50 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
/>
```

#### Textarea
```html
<textarea
  [(ngModel)]="model.field"
  placeholder="Placeholder..."
  rows="4"
  class="block w-full bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/50 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-white/30 resize-none transition-all"
></textarea>
```

#### Select (Button + Action Sheet)
```html
<button
  type="button"
  (click)="openSelector()"
  class="w-full bg-black/20 border border-white/10 rounded-xl text-white px-4 py-3 text-base text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
>
  <span>{{ selectedLabel || 'Selecione...' }}</span>
  <ion-icon name="chevron-expand-outline" class="text-white/50"></ion-icon>
</button>
```

#### Toggle/Switch
```html
<div class="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-xl">
  <div class="mr-4">
    <span class="text-white font-medium">Label do toggle</span>
    <p class="text-xs text-white/50 mt-0.5">Descricao opcional</p>
  </div>
  <label class="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" [(ngModel)]="model.field" class="sr-only peer" />
    <div class="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
  </label>
</div>
```

**Nota:** Use `mr-4` no div do texto para criar espaco entre texto e switch.

#### Botao Principal (Submit)
```html
<button
  (click)="submit()"
  [disabled]="!isValid"
  class="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition-all border border-white/10 shadow-lg shadow-blue-500/20"
>
  Criar
</button>
```

#### Botao Secundario (Cancelar)
```html
<button
  (click)="cancel()"
  class="flex-1 py-3 rounded-2xl bg-slate-700/50 text-white/70 font-medium hover:bg-slate-700 transition-colors"
>
  Cancelar
</button>
```

#### Grid 2 Colunas
```html
<div class="grid grid-cols-2 gap-4">
  <div>
    <label class="block text-xs font-medium text-gray-300 mb-2 ml-1">Campo 1</label>
    <input type="text" class="..." />
  </div>
  <div>
    <label class="block text-xs font-medium text-gray-300 mb-2 ml-1">Campo 2</label>
    <input type="text" class="..." />
  </div>
</div>
```

#### Botoes de Acao (Cancelar + Salvar)
```html
<div class="flex gap-3 mt-6">
  <button
    (click)="cancel()"
    class="flex-1 py-3 rounded-2xl bg-slate-700/50 text-white/70 font-medium hover:bg-slate-700 transition-colors"
  >
    Cancelar
  </button>
  <button
    (click)="save()"
    [disabled]="!isValid"
    class="flex-1 py-3 rounded-2xl bg-blue-500 text-white font-medium disabled:opacity-50 hover:bg-blue-600 transition-colors"
  >
    Salvar
  </button>
</div>
```

---

### Chips de Navegacao por Secao

**Data:** 2026-01-09
**Problema:** Inconsistencia visual nos chips de navegacao entre paginas. Na pagina Add Persona, os chips eram menores (text-sm e icone text-base) comparados com a pagina UX Research (tamanho padrao e icone text-lg).
**Solucao:** Padronizar os chips de navegacao horizontal em todas as paginas que usam esse componente.

**Arquivos envolvidos:**
- `app/src/app/pages/project/tabs/ux-research/ux-research.page.html`
- `app/src/app/pages/project/tabs/ux-research/add-persona/add-persona.page.html`

**Estrutura Padrao:**

#### Container com Scroll Horizontal
```html
<div class="overflow-x-auto mt-2 mb-4 -mx-4 px-4 hide-scrollbar">
  <div class="flex gap-3 min-w-max">
    <!-- chips aqui -->
  </div>
</div>
```

#### Chip/Botao de Navegacao
```html
<button
  *ngFor="let section of sections"
  (click)="selectSection(section)"
  [class]="activeSection === section.id
    ? 'flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white font-medium whitespace-nowrap'
    : 'flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700/50 text-white/70 whitespace-nowrap hover:bg-slate-700'"
>
  <ion-icon [name]="section.icon" class="text-lg"></ion-icon>
  {{ section.label }}
</button>
```

**Especificacoes:**
| Propriedade | Valor |
|-------------|-------|
| Padding | `px-4 py-2` |
| Border Radius | `rounded-full` |
| Gap entre icone e texto | `gap-2` |
| Tamanho do icone | `text-lg` (18px) |
| Tamanho do texto | default (16px) - NAO usar text-sm |
| Background ativo | `bg-blue-500` |
| Background inativo | `bg-slate-700/50` |
| Hover inativo | `hover:bg-slate-700` |
| Texto ativo | `text-white font-medium` |
| Texto inativo | `text-white/70` |

---

### Espacamento de Labels em Formularios

**Data:** 2026-01-10
**Problema:** Labels dos campos de formulario ficavam visualmente mais proximas do input de cima do que do seu proprio input.
**Solucao:** Usar `space-y-4` (1rem) no container do formulario. A label com `mb-2` (0.5rem) fica 2x mais perto do seu input do que do campo anterior.

**Arquivos envolvidos:**
- `app/src/app/shared/components/form-field/form-field.component.html` - Componente reutilizavel
- `app/src/app/shared/components/form-field/form-field.component.scss` - Estilos do componente
- `app/src/app/pages/project/tabs/ux-research/add-persona/add-persona.page.html` - Formulario de persona

**Espacamentos padrao:**
| Propriedade | Valor | Funcao |
|-------------|-------|--------|
| `space-y-4` no container | 1rem entre blocos | Gap entre campos |
| `mb-2` na label | 0.5rem abaixo | Aproxima label do seu input |

**Importante - Componentes Angular:**
Componentes customizados Angular (`<app-form-field>`, etc.) DEVEM ter `:host { display: block; }` no SCSS para que `space-y-*` funcione corretamente. Elementos customizados sao `display: inline` por padrao, o que impede margens verticais de funcionar.

```scss
// form-field.component.scss
:host {
  display: block;
}
```

**Resultado visual:**
- Label a 1rem do campo anterior (via space-y-4)
- Label a 0.5rem do seu proprio input (via mb-2)
- Proporcao 2:1 garante associacao visual correta

---

### Empty State Pattern

**Data:** 2026-01-17
**Problema:** Inconsistencia visual nos estados vazios das telas. Algumas telas tinham apenas icone e texto, outras tinham CTA mas sem contexto educativo.
**Solucao:** Padronizar todos os empty states com 3 elementos obrigatorios: icone, mensagem e card educativo.

**Arquivos envolvidos:**
- `app/src/app/pages/project/tabs/ux-research/ux-research.page.html` (modelo de referencia - Persona)
- Todas as paginas com listas ou conteudo vazio

**Estrutura Padrao:**

#### Container do Empty State
```html
<div *ngIf="items.length === 0" class="text-center py-12">
  <!-- 1. Icone -->
  <ion-icon name="[icon]-outline" class="text-6xl text-white/30 mb-4"></ion-icon>

  <!-- 2. Mensagem -->
  <p class="text-white/50">Nenhum(a) [item] cadastrado(a)</p>

  <!-- 3. Card Educativo -->
  <div class="mt-6 mx-auto max-w-sm p-5 border border-white/10 rounded-xl text-left">
    <h4 class="text-base font-medium text-white/80 mb-2">O que é [conceito]?</h4>
    <p class="text-sm text-white/50 mb-3">
      [Descricao breve do conceito em 1-2 linhas]
    </p>
    <p class="text-sm text-white/60 font-medium mb-1">Vantagens:</p>
    <ul class="text-sm text-white/50 space-y-1 ml-3">
      <li>• [Vantagem 1]</li>
      <li>• [Vantagem 2]</li>
      <li>• [Vantagem 3]</li>
    </ul>
  </div>
</div>
```

**Especificacoes:**
| Elemento | Classe Tailwind | Descricao |
|----------|-----------------|-----------|
| Container | `text-center py-12` | Centraliza e adiciona espacamento vertical |
| Icone | `text-6xl text-white/30 mb-4` | Grande, opacidade baixa, margem inferior |
| Mensagem | `text-white/50` | Texto discreto |
| Card | `mt-6 mx-auto max-w-sm p-5 border border-white/10 rounded-xl text-left` | Card discreto centralizado |
| Titulo Card | `text-base font-medium text-white/80 mb-2` | Titulo visivel |
| Descricao Card | `text-sm text-white/50 mb-3` | Texto pequeno e discreto |
| Label Vantagens | `text-sm text-white/60 font-medium mb-1` | Destaque sutil |
| Lista Vantagens | `text-sm text-white/50 space-y-1 ml-3` | Lista com espacamento |

**Elementos Obrigatorios:**
1. **Icone** - Representativo do tipo de item vazio
2. **Mensagem** - "Nenhum(a) [item] cadastrado(a)" ou similar
3. **Card Educativo** - Explica o conceito e lista 3 vantagens

**Nota:** Nunca usar CTA/botao dentro do empty state. O botao de adicionar deve estar no header da secao ou como FAB.

---

### Espacamento de Modais com Formulario

**Data:** 2026-01-17
**Problema:** Nas modais com formulario, o botao de acao estava colado no card do formulario (gap de 24px via space-y-6) enquanto havia mais espaco sobrando embaixo (padding de 32px via pb-8). O espacamento visual estava desbalanceado.
**Solucao:** Inverter/equilibrar o espacamento aumentando o gap entre card e botao e reduzindo o padding inferior.

**Arquivos envolvidos:**
- `app/src/app/pages/project/tabs/ux-research/ux-research.page.html`
- `app/src/app/pages/project/tabs/glossary/glossary.page.html`
- `app/src/app/pages/project/tabs/requirements/requirements.page.html`
- `app/src/app/pages/project/tabs/integrations/integrations.page.html`
- `app/src/app/pages/project/tabs/data-architecture/data-architecture.page.html`
- `app/src/app/components/export-modal/export-modal.component.html`
- `app/src/app/pages/project/project.page.html`

**Estrutura Padrao:**

#### Container de Conteudo da Modal
```html
<main class="flex-1 px-4 pt-6 pb-6 space-y-8 overflow-y-auto no-scrollbar">
  <!-- Form Card -->
  <div class="p-6 rounded-3xl glass-morphism space-y-6">
    <!-- campos aqui -->
  </div>

  <!-- Botao de acao -->
  <app-btn-primary [disabled]="!isValid" (btnClick)="save()">
    Salvar
  </app-btn-primary>
</main>
```

**Especificacoes:**
| Propriedade | Valor Anterior | Valor Novo | Funcao |
|-------------|----------------|------------|--------|
| `space-y-*` | `space-y-6` (24px) | `space-y-8` (32px) | Gap entre card e botao |
| `pb-*` | `pb-8` (32px) | `pb-6` (24px) | Padding inferior |

**Resultado visual:**
- Botao com mais "respiro" em relacao ao formulario acima (32px)
- Espaco inferior equilibrado (24px)
- Visual mais harmonioso e menos "apertado"

---

## Template de Registro

```markdown
### [Nome do Padrao]

**Data:** YYYY-MM-DD
**Problema:** Descricao do problema ou necessidade
**Solucao:** Descricao da solucao implementada

**Arquivos envolvidos:**
- path/to/file1.ts
- path/to/file2.ts

**Codigo de exemplo:**
\`\`\`typescript
// codigo aqui
\`\`\`
```
