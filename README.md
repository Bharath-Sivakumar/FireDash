# FireDash

FireDash is a lightweight browser new-tab dashboard for Firefox and Chrome. It replaces the default new tab page with a personalized homepage that shows the time, weather, configurable RSS news feeds, and your browser bookmarks.

## Features

- Search the web directly from the new-tab page
- Local time and multiple world clocks
- Current weather for a chosen city
- RSS news feeds with customizable sources
- Quick access to browser bookmarks
- Light, dark, and system theme toggle
- Customizable dashboard settings from the "Customize" panel

## Screenshots

The dashboard includes:

- a top bar with search and theme controls
- a news panel on the left
- a weather and time sidebar on the right
- a quick links panel for bookmarks

## Project structure

- `manifest.json` - browser extension manifest
- `newtab.html` - dashboard layout
- `styles.css` - visual styling and dark/light theme
- `script.js` - widget rendering, theme logic, and configuration handling

## Installation

1. Open your browser's extension settings.
2. Enable Developer Mode.
3. Choose Load unpacked / Load extension.
4. Select this project folder.
5. Open a new tab to view FireDash.

## Customization

Use the Customize button in the top-right corner to edit:

- News feed URLs
- Weather city
- World clocks

The settings are saved in browser local storage for the extension.

## Data sources

- Weather data: Open-Meteo
- News data: RSS feeds via RSS2JSON
- Bookmarks: browser bookmarks API

## Notes

This project is intentionally simple and privacy-friendly. It does not collect user data, and the browser extension only requests bookmark access to display quick links.

## License

This project is licensed under the GPLv3 License. See [LICENSE](LICENSE) for details.
