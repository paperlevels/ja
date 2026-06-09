# shadcn/ui

This project uses shadcn/ui for UI components.

## Adding Components

```bash
npx shadcn@latest add <component-name>
```

## Available Components

- `button`
- `card`
- `input`
- `textarea`
- `tabs`
- `dialog`
- `badge`
- `table`
- `label`
- `sonner` (toast notifications)
- `dropdown-menu`

## Styling

Components are styled with Tailwind CSS v4. The theme colors are customized in `src/styles/global.css` using CSS custom properties under the `@theme` block.

Key colors:
- Primary: `hsl(240 5.9% 10%)`
- Background: `hsl(0 0% 100%)`
- Card: `hsl(0 0% 100%)`
- Text: `hsl(240 10% 3.9%)`
