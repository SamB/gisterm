#!/usr/bin/env node

var octokit = require('@octokit/rest')() // GitHub API
var os = require('os') // Used to get home directory
var fs = require('fs') // Used for reading .gisterm config file
var path = require('path') // User for path building

const saveFilePath = path.join(os.homedir(), '.gisterm') // Path for .gisterm config file

// Yargs setup
var argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command('auth <token>', 'Authenticate to GitHub with an access token.', function (yargs) {
    yargs
      .example('$0 auth d6bdf50b04c860058b4d4208e33f8ddd544ea6f8')
      .positional('token', {
        type: 'string',
        required: true,
        description: 'GitHub token with gist permission.'
      })
  }, function (args) {
    // Auth function
    var configObject = { // Object with updates
      token: args.token
    }
    var baseObject = {} // Base object
    if (fs.existsSync(saveFilePath)) baseObject = JSON.parse(fs.readFileSync(saveFilePath, 'utf8')) // If .gisterm already exists, load it into base object
    var finalObject = Object.assign(baseObject, configObject) // Combine base object and updated object
    fs.writeFileSync(saveFilePath, JSON.stringify(finalObject), 'utf8') // Write combined object
    console.log(`Token "${finalObject.token}" has been saved.`)
  })
  .command('create <files...>', 'Create a gist.', function (yargs) {
    yargs
      .example('$0 create README.md myScript.js --description "My brand new project!" --private')
      .positional('files', {
        description: 'Files to upload.',
        required: true
      })
      .option('description', {
        alias: 'd',
        type: 'string',
        required: false
      })
      .option('private', {
        alias: 'p',
        type: 'boolean',
        default: false
      })
  }, function (args) {
    // Create function
    if (!fs.existsSync(saveFilePath)) { // Check for .gisterm
      console.error("Couldn't find token.\nDid you forget to authenticate?")
      process.exit(1)
    }
    var token = JSON.parse(fs.readFileSync(saveFilePath, 'utf8')).token // Get saved token from .gisterm
    octokit.authenticate({ // Authenticate with token
      type: 'token',
      token
    })

    // File object builder
    var files = {}
    args.files.forEach(function (file) { // For each specified file
      if (!fs.existsSync(file)) { // Check if the file exists
        console.error(`File "${file}" does not exist.`)
        process.exit(1)
      }
      files[path.basename(file)] = { // Building file object, read GH Gist API docs for more info
        content: fs.readFileSync(file, 'utf8')
      }
    })
    octokit.gists.create({
      files,
      description: args.description,
      public: !args.private
    }).then(result => {
      console.log(`Created!\nYour link: ${result.data.html_url}`)
    }).catch(err => {
      console.error('Failed to upload Gist.')
      console.error(err.message)
    })
  })
  .demandCommand()
  .help('h')
  .alias('h', 'help')
  .argv

/* Why is the if statement below needed?
 * It's because this style of yargs isn't compatible with the standard style.
 * If I don't get .argv at the end, yargs doesn't do anything.
 * If I don't store the .argv in the variable, standard complains.
 * If I don't use the variable with .argv, standard complains.
 */
if (argv) {}
