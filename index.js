#!/usr/bin/env node

var octokit = require('@octokit/rest')()
var os = require('os')
var fs = require('fs')
var path = require('path')

const saveFilePath = path.join(os.homedir(), '.gisterm')

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
    var configObject = {
      token: args.token
    }
    var baseObject = {}
    if (fs.existsSync(saveFilePath)) baseObject = JSON.parse(fs.readFileSync(saveFilePath, 'utf8'))
    var finalObject = Object.assign(baseObject, configObject)
    fs.writeFileSync(saveFilePath, JSON.stringify(finalObject), 'utf8')
    console.log(`Token ${finalObject.token} has been saved.`)
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
    if (!fs.existsSync(saveFilePath)) {
      console.error("Couldn't find token.\nDid you forget to authenticate?")
      process.exit(1)
    }
    var token = JSON.parse(fs.readFileSync(saveFilePath, 'utf8')).token
    octokit.authenticate({
      type: 'token',
      token
    })
    var files = {}
    args.files.forEach(function (file) {
      if (!fs.existsSync(file)) {
        console.error(`File "${file}" does not exist.`)
        process.exit(1)
      }
      files[file] = {
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

if (argv) {} // fuck you standard style
