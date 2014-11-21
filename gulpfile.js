var gulp = require('gulp');
var packageJson = require('./package.json');

require('module-boilerplate/load-dependencies')(gulp, packageJson);

tasks = require('module-boilerplate/tasks.json');

for(var i in tasks) {
  require('module-boilerplate/tasks/' + tasks[i])(gulp, packageJson);
}
