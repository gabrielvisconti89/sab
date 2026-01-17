# Stack Backend

## Nota sobre Backend v1

O Software Architecture Builder v1 e um aplicativo local-only. Nao ha backend Laravel em execucao para o proprio app.

O Laravel 12 mencionado na estrutura e parte do **output gerado** pelo app - quando o usuario exporta um projeto, o app gera migrations e estrutura Laravel.

## Backend para v2 (Sync em Nuvem)

Quando implementado, o backend usara:

**PHP:** 8.3+
**Laravel:** 12
**Starter kit:** Nenhum (API pura)
**API authentication:** Sanctum

### Pacotes Planejados

- laravel/sanctum (autenticacao API)
- spatie/laravel-permission (roles)
- spatie/laravel-backup (backups)

## Geracao de Codigo Laravel

O app gera os seguintes artefatos Laravel:

### Migrations

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('table_name', function (Blueprint $table) {
            $table->id();
            // ... columns
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('table_name');
    }
};
```

### Models (Planejado)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TableName extends Model
{
    protected $fillable = [
        // ... columns
    ];

    protected $casts = [
        // ... casts
    ];
}
```
