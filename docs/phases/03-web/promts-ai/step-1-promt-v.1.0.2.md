Build an interactive Floor Plan Page (Page-2) for the educational and research platform. Use the provided background and equipment icons.

**Requirements:**

1. **Background:**
   - Use the image src/assets/firstFloor-2D-1.8.PNG as the floor plan background.
   - The floor plan should be centered, responsive, and scale with the page width while maintaining aspect ratio.

2. **Markers:**
   - Overlay four interactive equipment markers (icons) on specific locations over the floor plan.
   - Each marker must be a clickable React component, with a tooltip showing the equipment name and description. On click, navigate to `/equipment/:id`.
   - Each marker uses a PNG icon with transparent background (provided in src/assets).

   | Marker | Icon Path                                               | Location Description                       | CSS/Position Details                                | Size   |
   |--------|---------------------------------------------------------|--------------------------------------------|-----------------------------------------------------|--------|
   | 1      | src/assets/1.1.1-icon-PV-Hulajnogi.png                 | 5% from bottom, 10% left from center       | absolute, bottom: 5%, left: calc(50% - 10%)         | 10%    |
   | 2      | src/assets/1.1.2-icon-PV-Hulajnogi-converter.png        | 20% from bottom, 10% right from center     | absolute, bottom: 20%, left: calc(50% + 10%)        | 10%    |
   | 3      | src/assets/2.1.1-icon-Wind-Big-Vertical.png             | 25% from bottom, 10% from right border     | absolute, bottom: 25%, right: 10%                   | 10%    |
   | 4      | src/assets/2.1.3-icon-Wind-Big-Vertical-inverter-storage.png | 60% from bottom, 25% from right border | absolute, bottom: 60%, right: 25%                   | 10%    |

   - Each marker should have a high z-index, so it appears above the floor plan and any SVG lines.
   - Add hover/focus styling (scale, shadow, color border).
   - Make the markers accessible for keyboard users.

3. **Layering:**
   - The base layer is the floor plan image.
   - Above the image, add an SVG layer (z-index: 10) to support future connection lines between markers (leave as a placeholder for now).
   - Markers are placed above the SVG layer (z-index: 20).

4. **Responsiveness:**
   - Markers should always be positioned relative to the visible floor plan image, not the page.
   - On window resize, positions and sizes should update automatically.
   - All code should use Tailwind CSS for styling and layout.

5. **General UI:**
   - Use semantic HTML5 and ARIA labels for accessibility.
   - Add a short page header/title and an instructional description above the map.
   - Ensure all images have alt text for accessibility.

6. **Code Organization:**
   - Use React functional components with TypeScript.
   - Use a TypeScript array/object to store marker data (id, name, icon, position, size, etc.) and map over it to render markers.

7. **Extras (if time allows):**
   - Add a placeholder SVG line (e.g., a blue line) between two markers as an example, using SVG coordinates calculated from the markers’ positions.
   - Use smooth transitions for marker hover/focus.

**End goal:** The Floor Plan Page should look modern, responsive, and visually clear, with four interactive equipment icons layered accurately over the background map, ready for future live data and connection lines.

