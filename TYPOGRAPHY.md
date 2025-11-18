# Guía de Tipografía - Neurastate

## Fuente Principal
**Inter** - Aplicada globalmente en todo el sitio

## Jerarquía de Títulos

### Hero H1
```tsx
className="text-5xl sm:text-6xl lg:text-7xl font-bold"
// 48px → 60px → 72px
```

### H1 Páginas
```tsx
className="text-5xl font-bold"
// 48px
```

### H2 Principales
```tsx
className="text-4xl font-bold"
// 36px
```

### H3 / H2 Secciones
```tsx
className="text-3xl font-bold"
// 30px
```

### H2 en Cards
```tsx
className="text-2xl font-bold"
// 24px
```

### H3 en Cards / Subtítulos
```tsx
className="text-xl font-bold"
// 20px
```

## Texto Cuerpo

### Lead / Intro
```tsx
className="text-xl md:text-2xl text-gray-600"
// 20px → 24px
```

### Párrafos Destacados
```tsx
className="text-xl text-muted-foreground"
// 20px
```

### Body Regular
```tsx
className="text-base text-muted-foreground"
// 16px
```

### Body Small
```tsx
className="text-sm text-muted-foreground"
// 14px
```

## Navegación

### Logo
```tsx
className="text-2xl font-bold"
// 24px
```

### Nav Links
```tsx
className="text-base font-medium"
// 16px
```

### Nav Activo
```tsx
className="text-base font-semibold"
// 16px
```

## Stats / Métricas

### Números Grandes (Hero)
```tsx
className="text-3xl font-bold"
// 30px en móvil, 36px en desktop
```

### Números Stats Cards
```tsx
className="text-4xl md:text-5xl font-bold"
// 36px → 48px
```

### Labels Stats
```tsx
className="text-sm text-muted-foreground"
// 14px
```

## Botones

### Large
```tsx
size="lg"
// text-base (16px)
```

### Default
```tsx
size="default"
// text-sm (14px)
```

### Small
```tsx
size="sm"
// text-xs (12px)
```

## Badges

```tsx
className="text-xs font-semibold"
// 12px
```

## Uso de Colores con Tipografía

### Títulos
- Principal: `text-gray-900` (light mode)
- Sobre fondo oscuro: `text-white`
- Degradados: `bg-gradient-to-r from-turquoise-400 to-ocean-300 bg-clip-text text-transparent`

### Cuerpo de Texto
- Principal: `text-gray-600`
- Secundario: `text-muted-foreground`
- Sobre fondo oscuro: `text-ocean-100` o `text-ocean-300`

### Links / Nav
- Default: `text-gray-700`
- Hover: `text-ocean-600` o `text-turquoise-600`
- Activo: `text-ocean-600 font-semibold`

## Mejores Prácticas

1. **Consistencia**: Usa siempre las clases definidas arriba
2. **Contraste**: Asegura suficiente contraste (WCAG AA mínimo)
3. **Jerarquía**: Mantén clara jerarquía visual
4. **Responsive**: Usa variantes sm/md/lg cuando sea necesario
5. **Antialiasing**: El `antialiased` está aplicado globalmente en body

## Ejemplos de Uso

### Sección Principal
```tsx
<section>
  <h2 className="text-4xl font-bold text-gray-900 mb-4">
    Título de Sección
  </h2>
  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
    Descripción o lead de la sección
  </p>
</section>
```

### Card con Stats
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-medium text-gray-600">
      Label
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-gray-900">$8.5M</div>
    <p className="text-sm text-muted-foreground">vs last month</p>
  </CardContent>
</Card>
```

### Property Card
```tsx
<Card>
  <CardContent>
    <h3 className="text-xl font-bold text-gray-900 mb-3">
      Property Title
    </h3>
    <p className="text-base text-gray-600">
      Description text
    </p>
  </CardContent>
</Card>
```
