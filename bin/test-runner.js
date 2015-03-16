var program = require('inquirer');
var exec = require('child_process').exec;
var fs = require('fs');

var arg = process.argv[2];

// If using the name as arg, only execute tac6, otherwise run inquirer UI
if (!!arg) {
	exec('tac6 -- ./tests/tests-' + arg + '.js',
		function(error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
		});
} else {

	var questions = [{
		'message': 'Choose which component to test',
		'name': 'lib',
		'type': 'list',
		'choices': []
	}];

	fs.readdir('tests', function(err, items) {
		items.forEach(function(item) {
			questions[0].choices.push(item.replace('tests-', '').replace('.js', ''));
		});

		program.prompt(questions, function(answer) {
			exec('tac6 -- ./tests/tests-' + answer.lib + '.js',
				function(error, stdout, stderr) {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (error !== null) {
						console.log('exec error: ' + error);
					}
				});
		});

	});
}