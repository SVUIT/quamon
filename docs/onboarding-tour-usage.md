# Onboarding Tour Usage Guide

## Overview

This document explains how to use and extend the Onboarding Tour component in Quamon, following the Siemens Element Tour component API and best practices from https://element.siemens.io/components/layout-navigation/tour/.

## Tour Structure

The tour follows the Siemens Element Tour pattern with these key elements:

1. **Step number** - Shows current step (e.g., "Bước 1 / 9")
2. **Title** - Clear, concise heading for each step (TranslatableString)
3. **Description** - Brief explanation of the feature (TranslatableString)
4. **Actions** - Navigation buttons (Previous, Next, Skip, Complete)
5. **Element highlighting** - Visual focus on the target UI element
6. **Progress bar** - Visual indicator of tour completion
7. **Close button** - Option to dismiss the tour

## API Reference (Siemens Element Pattern)

### TourStep Interface

Our implementation maps to the Siemens Element `TourStep` interface:

```typescript
interface TourStep {
  // Unique id for the step (exposed in DOM as data-step-id)
  id: string;
  
  // Title to be displayed on the modal (TranslatableString)
  title: string;
  
  // Body text of the modal (TranslatableString)
  content: string;
  
  // The element the step should be attached to on the page
  // Maps to: attachTo?: { element: (string | HTMLElement | () => (string | HTMLElement)) }
  elementId?: string;  // Direct element ID targeting
  target?: string;     // CSS selector fallback
  
  // Tour popover position
  position?: "top" | "bottom" | "left" | "right" | "center";
  
  // Whether to scroll the element into view
  scrollTo?: boolean;
  
  // Custom handler to perform scrolling
  scrollToHandler?: (element: HTMLElement) => void;
}
```

### Tour Service Methods

Our custom React component provides equivalent functionality to Siemens Element's `SiTourService`:

| Siemens Element Method | Our Implementation | Description |
|------------------------|-------------------|-------------|
| `addSteps(steps: TourStep[])` | `tourSteps` array | Add steps to the tour |
| `clearSteps()` | N/A (static array) | Clear all steps |
| `complete()` | `handleComplete()` | Finish the tour |
| `onTourCancel` | `handleSkip()` | Event triggered when tour is cancelled |
| `onTourComplete` | `handleComplete()` | Event triggered when tour is completed |
| `setOptions(options)` | Component props/state | Sets options for the whole tour |
| `start()` | `setIsActive(true)` | Start the tour |

## Current Tour Steps

### Step 1: Welcome
- **Target**: Center screen (no specific element)
- **Purpose**: Introduce users to Quamon
- **Content**: Overview of main features

### Step 2: Grade Table
- **Element ID**: `tour-grades-header`
- **Location**: `src/pages/Home.tsx` line 618
- **Purpose**: Show where grades are managed
- **Usage**:
  ```tsx
  <h1 id="tour-grades-header" style={{ textAlign: "center", marginBottom: "10px" }}>
    Bảng điểm
  </h1>
  ```

### Step 3: Import PDF/Excel
- **Element ID**: `tour-pdf-import`
- **Location**: `src/pages/Home.tsx` line 668
- **Purpose**: Demonstrate quick data import
- **Usage**:
  ```tsx
  <label
    id="tour-pdf-import"
    htmlFor="pdf-upload"
    className="action-btn pdf-import-btn"
  >
    Nhập điểm từ PDF
  </label>
  ```

### Step 4: Export Data
- **Element ID**: `tour-export`
- **Location**: `src/pages/Home.tsx` line 873
- **Purpose**: Show how to export grades to Excel
- **Usage**:
  ```tsx
  <button
    id="tour-export"
    onClick={() => exportToExcel(semesters)}
    className="action-btn export-excel-btn"
  >
    Xuất Excel
  </button>
  ```

### Step 5: Score Colors
- **CSS Selector**: `.grade-cell`
- **Purpose**: Explain the color coding system
- **Note**: Uses CSS selector as grade cells are dynamically generated

### Step 6: Expected Score
- **CSS Selector**: `.expected-score-input`
- **Purpose**: Show how to use the expected score feature
- **Note**: Uses CSS selector as inputs are dynamically generated

### Step 7: Add Subject
- **CSS Selector**: `[onclick*="add_subject"]`
- **Purpose**: Guide users to add subjects
- **Note**: Targets the "Thêm môn" tab button

### Step 8: Graduation Check
- **CSS Selector**: `[onclick*="graduation_check"]`
- **Purpose**: Show graduation tracking feature
- **Note**: Targets the "Kiểm tra tốt nghiệp" tab button

### Step 9: Completion
- **Target**: Center screen (no specific element)
- **Purpose**: Conclude the tour and encourage usage

## Adding New Tour Steps

### 1. Add Element ID to Target Component

First, add a unique ID to the element you want to highlight:

```tsx
// In your component (e.g., src/pages/Home.tsx)
<button
  id="tour-your-feature"  // Add this ID
  onClick={handleYourFeature}
>
  Your Feature
</button>
```

### 2. Add Tour Step Definition

Add a new step to the `tourSteps` array in `src/components/OnboardingTour/OnboardingTour.tsx`:

```typescript
const tourSteps: TourStep[] = [
  // ... existing steps
  {
    id: "your-feature",
    title: "Your Feature Title",  // TranslatableString equivalent
    content: "Clear explanation of what this feature does and how it benefits the user.",  // TranslatableString equivalent
    elementId: "tour-your-feature",  // Maps to attachTo.element
    position: "bottom",  // Tour popover position
    scrollTo: true,  // Whether to scroll element into view
  },
  // ... remaining steps
];
```

### 3. Advanced: Async Operations (beforeShowPromise)

For steps that require async operations (e.g., opening dialogs), you can add promise support:

```typescript
{
  id: "async-feature",
  title: "Async Feature",
  content: "Feature that requires async setup.",
  elementId: "tour-async-feature",
  beforeShowPromise: async () => {
    // Perform async operation before showing step
    await openDialog();
  },
  beforeNextPromise: async () => {
    // Clean up before moving to next step
    await closeDialog();
  },
}
```

### 4. Alternative: CSS Selector Targeting

If you can't add an ID (e.g., dynamically generated elements), use CSS selectors:

```typescript
{
  id: "dynamic-feature",
  title: "Dynamic Feature",
  content: "Explanation of dynamically generated feature.",
  target: ".your-css-selector",  // CSS selector fallback
  position: "right",
}
```

## Tour Step Properties

Each tour step supports these properties (mapped from Siemens Element TourStep):

```typescript
interface TourStep {
  // Required properties
  id: string;              // Unique id for the step (exposed in DOM as data-step-id)
  title: string;           // Title to be displayed on the modal (TranslatableString)
  content: string;         // Body text of the modal (TranslatableString)
  
  // Element attachment (maps to attachTo.element)
  elementId?: string;      // Direct element ID targeting (preferred)
  target?: string;         // CSS selector fallback
  
  // Positioning
  position?: "top" | "bottom" | "left" | "right" | "center";
  
  // Scrolling options
  scrollTo?: boolean;       // Whether to scroll the element into view
  scrollToHandler?: (element: HTMLElement) => void;  // Custom scroll handler
  
  // Async operations (advanced)
  beforeShowPromise?: () => Promise<any>;  // Promise that resolves before step shows
  beforeNextPromise?: () => Promise<any>;  // Promise that resolves before next step
}
```

## Tour Options (TourOptions Interface)

Global tour configuration options (maps to Siemens Element TourOptions):

```typescript
interface TourOptions {
  // Default options applied to all tour steps
  defaultStepOptions?: {
    scrollTo?: boolean;
    scrollToHandler?: (element: HTMLElement) => void;
    beforeShowPromise?: () => Promise<any>;
    beforeNextPromise?: () => Promise<any>;
  };
}
```

## Best Practices (from Siemens Element)

### When to Use Tours
- To introduce new users to the application and its primary features
- To guide users through a new workflow
- To highlight significant updates or changes in the interface
- To provide in-app training or onboarding for users

### Best Practices
- **Keep tours between 3 and 15 steps** (current: 9 steps)
- **Each step should have a clear and concise description**
- **Focus on how the feature or function can benefit the user**
- **Organize the tour steps in a logical sequence that mirrors the user's workflow**
- **Avoid overwhelming users with too much information at once**

### Tour Beginning and End
- **First step**: Brief overview of what to expect, with option to skip
- **Last step**: Conclude the tour, summarize key points, offer restart option

### Placement
- Tour popover automatically positions based on screen position
- Arrow placement ensures optimal positioning
- Elements are scrolled into view with smooth animation

## Element Highlighting

The tour uses visual highlighting to draw attention to target elements:

```typescript
// Highlight styles applied to target elements
element.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)";
element.style.zIndex = "9999";
element.style.position = "relative";
element.scrollIntoView({ behavior: "smooth", block: "center" });
```

This creates a purple glow effect around the target element and ensures it's visible on screen.

## Tour State Management

The tour uses localStorage to track completion:

```typescript
// Check if tour has been completed
const hasCompletedTour = localStorage.getItem("quamon_tour_completed");

// Mark tour as complete
localStorage.setItem("quamon_tour_completed", "true");

// Reset tour for replay
localStorage.removeItem("quamon_tour_completed");
```

## Accessing the Tour

Users can access the tour via:
1. **Automatic**: First-time users see tour automatically
2. **Manual**: Click "Hướng dẫn" tab in Navbar to replay
3. **Restart**: "Làm lại Tour" button after completion

## File Locations

- **Tour Component**: `src/components/OnboardingTour/OnboardingTour.tsx`
- **Tour Integration**: `src/pages/Home.tsx` (lines 1094-1104)
- **Element IDs**: Added throughout `src/pages/Home.tsx` for tour targeting

## Testing the Tour

To test the tour during development:

1. Clear localStorage to reset tour state:
   ```javascript
   localStorage.removeItem("quamon_tour_completed");
   ```
2. Refresh the page
3. Navigate to "Hướng dẫn" tab
4. Tour should start automatically

## Customization

### Changing Tour Colors

Update the highlight color in `OnboardingTour.tsx`:

```typescript
// Current purple theme
element.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)";

// Example: Blue theme
element.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)";
```

### Adjusting Tour Card Styling

Modify the tour card styles in the JSX:

```typescript
style={{
  backgroundColor: "var(--card-bg, #ffffff)",
  borderRadius: "16px",
  padding: "32px",
  maxWidth: "500px",
  // ... other styles
}}
```

## Troubleshooting

### Element Not Highlighting
- Verify the element ID matches exactly
- Check that the element exists when the tour step is active
- Ensure the element is not hidden or covered by other elements
- Try using CSS selector as fallback

### Tour Not Starting
- Check localStorage for `quamon_tour_completed`
- Clear localStorage to reset
- Verify the tour component is properly imported in Home.tsx

### Target Element Not in View
- The tour automatically scrolls elements into view
- If scrolling fails, check element positioning and z-index
- Consider using a different position (top/bottom/left/right)

## Future Enhancements

Potential improvements following Siemens Element patterns:

1. **Multiple Tours**: Create separate tours for different features
   - Getting Started Tour (current)
   - Advanced Features Tour
   - New Features Tour

2. **Tour Categories**: Organize tours in a help menu
   - "Getting started"
   - "Advanced features"
   - "New features"

3. **Keyboard Navigation**: Add arrow key support for step navigation

4. **Tour Persistence**: Remember tour progress across sessions

5. **Context-Aware Tours**: Show different tours based on user state

## References

- Siemens Element Tour Documentation: https://element.siemens.io/components/layout-navigation/tour/
- Siemens Element Tour API: https://github.com/siemens/element/blob/main/projects/element-ng/tour/si-tour.service.ts

---

**Last Updated:** 2025-12-28  
**Maintained by:** Development team
