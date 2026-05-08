import os

content = """# Gastro Map - Domino's Pizza Styling Skill

Este documento define las reglas de diseño y estándares visuales aplicados al proyecto **Gastro Map** para asegurar una interfaz coherente, profesional y alineada a la identidad de marca de Domino's Pizza.

## 1. Identidad Visual (Paleta de Colores)
Se ha configurado una paleta de colores personalizada basada en la identidad oficial de Domino's Pizza extraída de Brandfetch.

| Elemento | Color Hex | Clase Uniwind | Uso Sugerido |
| :--- | :--- | :--- | :--- |
| **Domino's Red** | `#E31837` | `bg-dominos-red` / `text-dominos-red` | Botones principales (FAB), Errores, Títulos |
| **Domino's Blue** | `#0055A5` | `bg-dominos-blue` / `text-dominos-blue` | Headers, Enlaces, Iconos de información |
| **Domino's White** | `#FFFFFF` | `bg-dominos-white` / `text-dominos-white` | Fondos de pantalla, Texto sobre botones |

## 2. Estándares de Implementación (Uniwind)
Para cumplir con la rúbrica de evaluación, el proyecto prohíbe estrictamente el uso de `StyleSheet`.

- **Motor de Estilos:** Uniwind (Tailwind CSS v4).
- **Configuración:** Inyección nativa a través de Metro Bundler.
- **Declaración de Clases:** Uso exclusivo de la propiedad `className`.

### Ejemplo de Estándar en Componentes
```tsx
// Correcto (Cumple Rúbrica)
<View className="flex-1 bg-dominos-white p-6">
  <Text className="text-2xl font-bold text-dominos-blue">Mis Platos</Text>
</View>

// Incorrecto (Invalida el módulo)
const styles = StyleSheet.create({ container: { flex: 1 } });