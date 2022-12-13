const path = require('path')
const ZipPlugin = require('zip-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const fs = require('fs')

// Second line change
// npx webpack --config ./webpack.config.dev.js
// Automated Webpack configuration for Lambdas
//
// ■ Goals
//   - Avoid having to reconfigure Webpack for every microservice regardless of number of lambdas
//   - Have each lambda in a separated ZIP file
//   - Have the same JS filename (index.js) inside all ZIP files, so we can always
//     reference 'index.handler' as the Lambda handler in our Terraform/SAM/CloudFormation scripts
//
// ■ How it works
//   1 - Creates a list of Lambda names based on '-handler.ts' files in 'app/handlers'
//   2 - Prints the Lambda names before the Webpack build
//   3 - Creates a Webpack config with one entry point per handler and assigns to module.exports
//
// ■ Output structure:
//   build/
//   ├- archives
//   |  ├- hello-world-1.zip (with index.js inside)
//   |  └- hello-world-X.zip (with index.js inside)
//   └- sources/
//      ├- hello-world-1/
//      |   └- index.js
//      └- hello-world-X/
//          └- index.js

const lambdaHandlers = createLambdaEntryPointMapFromFolder()
printLambdaNames(Object.keys(lambdaHandlers))

function createLambdaEntryPointMapFromFolder() {
  return fs
    .readdirSync(path.join(__dirname, 'app', 'handlers'))
    .filter(fileName => fileName.indexOf('-handler.ts') >= 0)
    .reduce((map, lambdaPath) => {
      const handler = lambdaPath.replace('-handler.ts', '');
      map[handler] = `./app/handlers/${lambdaPath}`;
      return map;
    }, {});
}

function printLambdaNames(lambdaNames) {
  console.log(`■ Lambda Handlers found in 'app/handlers/'`)
  for (const lambda of lambdaNames) {
    console.log(`- ${lambda}`)
  }
  console.log()
}

function createLambdaConfig(handlers) {
  return {
    mode: 'development',
    devtool: 'source-map',
    target: 'node',
    entry: handlers,
    watch: true,
    watchOptions: {
      ignored: ['**/node_modules'],
    },
    output: {
      libraryTarget: 'commonjs2',
      path: path.join(__dirname, 'build'), // We want to have the top level path here for clean to work
      filename: 'source/[name]/index.js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      ...Object.keys(handlers).map(handler => new ZipPlugin({
        path: path.join(__dirname, 'build', 'archives'),
        filename: `${handler}.zip`,
        include: `source/${handler}/index.js`,
        pathMapper: () => 'index.js',
        // Make archive idempotent.
        fileOptions: { mtime: new Date('1970-01-01Z') },
      })),
    ],
  }
}

module.exports = createLambdaConfig(lambdaHandlers)
