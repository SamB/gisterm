# gisterm [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
An easy CLI for uploading gists.

## Setup
First, you'll need to install gisterm:
```
npm i -g gisterm
```

Then, you'll need to [create a token on GitHub](https://github.com/settings/tokens/new?scopes=gist) (needs to have `gist` permission), and then set it up with gisterm:
```
gisterm auth YOUR_TOKEN
```

## Usage
```
gisterm create myTextFile.txt myScript.js myImage.png
```

### Descriptions
You can specify a description for your Gist. Use the `--description`, or `-d` option.

```
gisterm create myScript.js --description "Just a little script I wanted to share."
```

### Privacy
You can make your Gist private, by using the `--private`, or `-p` option.

```
gisterm create secret.txt --private
```

---

People reading on npm: if you can't find something, there may be a chance of seeing an updated README with more explanations [here](https://github.com/moriczgergo/gisterm).
