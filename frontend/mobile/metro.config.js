const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  try {
    return context.resolveRequest
      ? context.resolveRequest(context, moduleName, platform)
      : context.standardResolution(context, moduleName, platform);
  } catch (error) {
    if (moduleName.startsWith('.')) {
      const targetPath = path.resolve(path.dirname(context.originModulePath), moduleName);
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
        const candidateFiles = [
          path.join(targetPath, `index.${platform}.tsx`),
          path.join(targetPath, `index.${platform}.ts`),
          path.join(targetPath, `index.${platform}.js`),
          path.join(targetPath, 'index.tsx'),
          path.join(targetPath, 'index.ts'),
          path.join(targetPath, 'index.js'),
        ];
        for (const candidate of candidateFiles) {
          if (fs.existsSync(candidate)) {
            return {
              filePath: candidate,
              type: 'sourceFile',
            };
          }
        }
      }
    }
    throw error;
  }
};

module.exports = config;
