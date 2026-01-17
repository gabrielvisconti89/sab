# Ambientes

## Desenvolvimento

### Frontend (Ionic)

**URL:** http://localhost:8100
**Comando:** `ionic serve`
**Hot reload:** Sim

### Testes em Dispositivo

**iOS:**
```bash
ionic cap run ios
```

**Android:**
```bash
ionic cap run android
```

## Producao

### iOS

**Distribuicao:** App Store (planejado)
**Beta:** TestFlight

### Android

**Distribuicao:** Google Play Store (planejado)
**Beta:** Firebase App Distribution

## Variaveis de Ambiente

### Desenvolvimento

```env
# App
APP_ENV=development
APP_DEBUG=true

# Storage
STORAGE_DRIVER=sqlite

# Features
FEATURE_OFFLINE_MODE=true
FEATURE_EXPORT_SQL=true
FEATURE_EXPORT_MIGRATIONS=true
```

### Producao

```env
# App
APP_ENV=production
APP_DEBUG=false

# Storage
STORAGE_DRIVER=sqlite

# Features
FEATURE_OFFLINE_MODE=true
FEATURE_EXPORT_SQL=true
FEATURE_EXPORT_MIGRATIONS=true
```
