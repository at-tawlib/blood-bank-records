# Blood Bank Record Management App

This is an offline, desktop-based web application for managing blood bank records. Built with HTML, CSS, and JavaScript, the app allows users to view, edit, and manage records efficiently with a fixed sidebar and toast notifications for feedback.

This application is built using **Electron** and uses **Electron Forge** to manage the development and packaging workflow.

## Features
- **Built with Electron and Electron Forge**: This application leverages **Electron** to provide a seamless desktop experience and **Electron Forge** for streamlined development, building, and packaging workflows across platforms.
-   **Sidebar Navigation**: Quickly access worksheets by day with a visual indicator for the active day.
-   **Display and Edit Records**: View records by day and edit inline within the table.
-   **Toast Notifications**: Shows success and failure messages for actions like updates.
-   **Offline Compatibility**: Designed to work without internet access, using locally stored assets.

## Table of Contents

1.  [Installation](#installation)
2.  [Usage](#usage)
3.  [Features and Functionality](#features-and-functionality)
5.  [Troubleshooting](#troubleshooting)
6.  [Contributing](#contributing)
7.  [License](#license)

----------

## Installation & Running the App
#### Prerequisites

Ensure you have **Node.js** installed. This app uses **Electron Forge** for building and packaging, which handles setup automatically.

1.  **Clone the Repository**:
	```bash
	git clone https://github.com/at-tawlib/blood-bank-records
	cd blood-bank-app
	```
2.  **Install Dependencies**:
	```bash
	npm install
	```
3.  **Run the Application in Development mode**:   
	```bash
	npm run start
	```
4. **For hot-reloading during development, use:**:
	This command uses **electronmon** to automatically reload the app on code changes.
	```bash
	npm run start:watch
	```
	
## Building and Packaging

Electron Forge provides built-in commands to package and make distributable versions of the app:
    
-   **Package**: Creates a distributable package for the app based on your operating system.

	```bash
	npm run package
	```
	
- **Make**: Builds platform-specific installers (e.g., `.deb`, `.rpm`, `.squirrel`, `.zip`).
     ```bash
	npm run make
	```
These commands generate output in the `out` directory, creating installers for Windows (Squirrel), Linux (Deb/RPM), and macOS (ZIP).
	
#### Additional Electron Setup Notes

-   **SQLite Database**: The app uses **better-sqlite3** for local data storage, rebuilt for Electron using `electron-rebuild` in the `postinstall` script.
-   **Auto-Update Handling**: `electron-squirrel-startup` is included to support automatic updates on Windows.
### Scripts Summary

| Script | Description |
|--|--|
| `npm run start` | Starts the app in development mode. |
| `npm run start:watch` | Starts with hot-reloading for development. |
| `npm run package` | Creates a distributable package for the current platform. |
| `npm run make` | Builds platform-specific installers. |
| `npm run publish` | Publishes the app using configured settings in Electron Forge.  |

----------

## Usage

1.  **Sidebar Navigation**:
    
    -   Use the sidebar to select which day’s worksheet you want to view. The active day is highlighted for clarity.
    -   Click **New Worksheet** to start a new record form.
2.  **Viewing and Editing Records**:
    
    -   Each day’s records are displayed in a paginated table. Use the inline edit feature to make changes directly.
3.  **Toast Notifications**:
    -   Notifications appear in the top-right corner to confirm the success or failure of actions.
    -   Success and error toasts will disappear after 3 seconds.
4.  **Date Selection**:
    -   A custom date picker allows you to select dates in the format `Monday, 21st October, 2024`.

----------

## Features and Functionality

### 1. Sidebar with Active State

The sidebar includes options for each day of the week and **New Worksheet**. When a day is selected, it appears highlighted, indicating it’s the active day.

### 2. Inline Table Editing

Each record has an edit button to open an editable row in the table, where you can update details and save changes. The active day in the sidebar remains highlighted when navigating back to the same worksheet.

### 3. Toast Notifications

A toast notification system shows messages for success or error actions, like updating records. The notifications appear at the top-right of the screen and disappear automatically.

----------

## Troubleshooting

### Common Issues

1.  **Font Awesome Icons Not Showing**
    
    -   Ensure the Font Awesome files are included correctly in `assets/font-awesome/`.
2.  **Active Sidebar State Not Updating**
    
    -   Verify that `currentDay` in the script correctly updates when a new day is clicked.
4.  **Page Reloading Unexpectedly After Update**
    
    -   Ensure `window.api.updateRecord(record)` uses async handling and does not cause a reload.

----------

## Contributing

Contributions are welcome! Please submit a pull request or open an issue if you find a bug or have a feature request.

----------

## License

This project is open-source and available under the MIT License.


> Written with [StackEdit](https://stackedit.io/).