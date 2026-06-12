## Context

Competitors want a clean, "flat" visual copy of all their tournament guesses and points. The current interface paginates saved guesses to improve load times, so a complete local view is not always available on the frontend. The solution is to fetch all guesses on-demand and generate a PDF document directly on the client.

## Goals / Non-Goals

**Goals:**
- Provide a button in the "Meu Espaço" dashboard to download a single, flat PDF document containing all of the competitor's guesses (both active future guesses and historical finished guesses with their score points).
- The PDF style must match the premium theme of the app (dark mode typography accents, emerald indicators for positive points, clean minimal grids).
- Use dynamic imports for the PDF libraries to avoid increasing the initial page load bundle size.

**Non-Goals:**
- Generating the PDF on the server.
- Allowing user custom styling options for the PDF document.

## Decisions

### 1. Client-Side Generation with `jspdf` and `jspdf-autotable`
- **Decision**: Add `jspdf` and `jspdf-autotable` as dependencies in `apps/web/package.json` and load them asynchronously on click.
- **Rationale**: Since the user explicitly requested a client-side approach and the UI already has a lightweight theme, compiling the PDF in the client offloads processing from the server and avoids setting up complex renderers in Next.js Server Components.
- **Alternative Considered**: Server-side rendering using `@react-pdf/renderer` inside a Next.js API route. Rejected because the client-side approach is simpler to bundle, deploy, and scales without adding server load.

### 2. Branding and Aesthetic System
- **Colors**: Use the app's dark-zinc (`#09090b` for primary text/headers) and emerald (`#10b981` for points / positive highlight).
- **Typography**: Clean Helvetica/Sans-serif font structure.
- **Layout**: Clean tabular design with subtle borders and alternating light-gray row backgrounds to keep the layout feeling premium.

### 3. Fetching Complete Data
- **Mechanism**: The button click will trigger a Server Action or fetch call to obtain all guesses for the user, bypassing the pagination limit of 5.
- **Rationale**: Since the main dashboard list is paginated at the database level, the client needs a complete list of guesses to build the flat PDF.

## Risks / Trade-offs

- **[Risk] Large Package Bundle** → **[Mitigation]**: Load `jspdf` and `jspdf-autotable` using dynamic ES module imports inside the click handler:
  ```typescript
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  ```
- **[Risk] Slow Fetching for Large Datasets** → **[Mitigation]**: Show a loading spinner inside the button while the data is being fetched and the PDF generated.
