#!/bin/bash

echo "enter project name:"
read projectName

echo "clone boilerplate into $projectName"
git clone git@github.com:ircam-jstools/es-next-prototyping-client.git "$projectName"

cd "$projectName"

echo "delete .git project"
rm -Rf .git
rm README.md

echo "npm install"
npm install
npm install --save waves-loaders
npm install --save @ircam/basic-controllers
npm install --save waves-audio


rm package-lock.json

echo "link waves-audio"
npm link waves-audio

echo "copy assets"
cp ../assets/common.css ./css/common.css
cp -R ../assets/audio ./assets/audio

mkdir js
cp ../assets/insert-code.js ./js/insert-code.js
cp ../assets/prism.js ./js/prism.js
cp ../assets/prism.css ./css/prism.css
