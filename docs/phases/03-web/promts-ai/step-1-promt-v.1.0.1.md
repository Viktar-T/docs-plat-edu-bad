Create a responsive interactive Floor Plan Page (Page-2) using React, TypeScript, and Tailwind CSS.

**Assets:**
- Use `src/assets/firstFloor-2D-1.8.PNG` as the background image for the lab floor.

**Markers:**
- Overlay equipment markers as clickable icons at precise locations.
- Each marker’s position is specified as a percentage of the image width (x) and height (y) for responsiveness.
- Each marker uses a transparent PNG icon and is centered on its position.

| ID      | Icon Path                                            | X (%) | Y (%) | Description                       |
|---------|------------------------------------------------------|-------|-------|-----------------------------------|
| PV      | src/assets/1.1.1-icon-PV-Hulajnogi.png               | 35    | 88    | PV station (bottom center-left)   |
| CONV    | src/assets/1.1.2-icon-PV-Hulajnogi-converter.png      | 65    | 82    | PV Converter (bottom center-right)|
| WIND    | src/assets/2.1.1-icon-Wind-Big-Vertical.png           | 88    | 70    | Vertical Wind Turbine (right)     |
| INVST   | src/assets/2.1.3-icon-Wind-Big-Vertical-inverter-storage.png | 75 | 40    | Wind Inverter/Storage (right-mid) |

- Adjust the X/Y % values to match the actual positions in the image as closely as possible.
- Each marker is a React component, with:
    - The icon image
    - An accessible tooltip on hover/focus with equipment name/description
    - On click, navigate to `/equipment/:id`

**Layers:**
- Layer 1: Background image fills the container.
- Layer 2: SVG overlay (optional, z-index 10) for drawing lines/arrows between markers. SVG covers the same area as the image.
- Layer 3: Markers (z-index 20), clickable, with hover/focus states.

**Instructions:**
- Make all layout and marker sizes responsive.
- Center markers on their X/Y coordinates.
- Add a short title and description above the map.
- Ensure all code is accessible and uses semantic HTML.
- Markers and connection lines should be rendered by mapping over TypeScript arrays.

**Extra:**
- For demo purposes, draw a sample SVG line (blue, 3px width) between the PV station and PV Converter markers.
- Add Tailwind hover/active effects to the markers.
