// cleanupUnused.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = './src';
const componentsToCheck = [
  // From your error list
  'Fade', 'ApiIcon', 'WebhookIcon', 'StorageIcon',
  'Button', 'ApiIcon', 'DashboardIcon', 'CardHeader',
  'Badge', 'OrderBy', 'limit', 'FilterButton',
  'SortIcon', 'NotificationIcon', 'NavBar', 'selectedProjectId'
];

// Function to find all JavaScript/JSX files
function findJSFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJSFiles(filePath, filesList);
    } else if (/\.(js|jsx)$/.test(file)) {
      filesList.push(filePath);
    }
  });

  return filesList;
}

// Check if a component is used in any file
function isComponentUsed(component, files) {
  let usageCount = 0;
  let definitionCount = 0;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for import
    if (new RegExp(`import\\s+{[^}]*\\b${component}\\b[^}]*}\\s+from`).test(content)) {
      usageCount++;
    }

    // Check for usage in JSX
    if (new RegExp(`<${component}[\\s>]`).test(content)) {
      usageCount++;
    }

    // Check for definition
    if (new RegExp(`(const|function|class)\\s+${component}\\s*`).test(content)) {
      definitionCount++;
    }
  });

  // If component is imported/used more than defined, it's being used
  return usageCount > definitionCount;
}

// Find all JS/JSX files
const jsFiles = findJSFiles(rootDir);
console.log(`Found ${jsFiles.length} JavaScript/JSX files to analyze`);

// Check each component
let unusedComponents = [];
componentsToCheck.forEach(component => {
  if (!isComponentUsed(component, jsFiles)) {
    unusedComponents.push(component);
  }
});

// Print results
console.log('\nUnused Components:');
unusedComponents.forEach(component => {
  console.log(`- ${component}`);
});

console.log('\nThis is a preliminary analysis. Review each component before removing.');
console.log('To fix ESLint warnings without removing components, you can:');
console.log('1. Remove unused imports from files');
console.log('2. Export and use the components');
console.log('3. Add "// eslint-disable-next-line no-unused-vars" before definitions');