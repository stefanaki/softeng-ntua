const cp = require('child_process');
const fs = require('fs');
const chalk = require('chalk');

String.prototype.trim = function () {
	return this.replace(/^\s+|\s+$/g, '');
};

module.exports = async ({ rounds }) => {
	let commands = [
		{
			cmd: 'se2108 login --username admin --passw wrongpassword',
			out: 'Invalid credentials\n',
			file: null
		},
		{
			cmd: 'se2108 login --username admin --passw freepasses4all',
			out: 'Welcome, admin. Type se2108 --help to display available commands.\n',
			file: '.token'
		},
		{
			cmd: `se2108 passesperstation --station AI01 --datefrom 20200101 --dateto 20210101 --format csv`,
			out: `Bad request: Invalid stationID\n`,
			file: null
		},
		{
			cmd: `se2108 passesanalysis --op1 aodos --op2 aodos --datefrom 20200101 --dateto 20210101 --format csv`,
			out: `Bad request: The 2 Operators IDs are the same\n`,
			file: null
		},
		{
			cmd: `se2108 passesanalysis --op1 aodo --op2 egnatia --datefrom 20200101 --dateto 20210101 --format csv`,
			out: `Bad request: Invalid Operator ID\n`,
			file: null
		},
		{
			cmd: `se2108 chargesby --op1 aodo --datefrom 20200101 --dateto 20210101 --format csv`,
			out: `Bad request: Invalid Operator ID\n`,
			file: null
		},
		{
			cmd: `se2108 passescost --op1 aodos --op2 aodos --datefrom 20200101 --dateto 20210101 --format csv`,
			out: `Bad request: The 2 Operators IDs are the same\n`,
			file: null
		},
		{
			cmd: `se2108 passescost --op1 aodos --op2 egnati --datefrom 20200101 --dateto 20210101 --format csv`,
			out: `Invalid operator ID's\n`,
			file: null
		},
		{
			cmd: `se2108 passescost --op1 aodos --op2 egnatia --datefrom 20200101 --dateto 20190101 --format csv`,
			out: `Bad request: date_from should be smaller than date_to\n`,
			file: null
		},
		{
			cmd: `se2108 settlements --list --datefrom 20200101 --dateto 20190101 --format csv`,
			out: `Bad request: date_from should be smaller than date_to\n`,
			file: null
		},
		{
			cmd: `se2108 settlements --create --op1 aodos --op2 egnatia --datefrom 20201010 --dateto 20211010`,
			out: `Bad request: The settlement overlaps with existing settlement\n`,
			file: null
		},
		{
			cmd: `se2108 settlements --verify --settlid 1`,
			out: `You need payment service provider privileges to execute this endpoint\n`,
			file: null
		},
		{
			cmd: `se2108 passescost --op1 aodos --op2 egnatia --datefrom 20200101 --dateto 2021-01-01 --format csv`,
			out: `Bad request: Invalid date formats\n`,
			file: null
		},
		{
			cmd: `se2108 logout`,
			out: `Log out successful\n`,
			file: null
		}
	];

	let numOfTests =
		commands.reduce((acc, cmd) => (cmd.file ? (acc += 2) : (acc += 1)), 0) * rounds;
	let failedTests = 0;

	for (let i = 1; i <= rounds; ++i) {
		console.log('\n------------------\n');

		console.log(`\nRound ${i}\n`);

		for (const c of commands) {
			console.log(chalk.blue('Executing command: \t') + c.cmd);
			let stdout = cp.execSync(c.cmd).toString();
			if (stdout === c.out) {
				c.out
					.trim()
					.match(/[^\r\n]+/g)
					.forEach((line) => console.log(`\t\t\t${line}`));
				console.log('Standard output: \t' + chalk.green('OK ✓'));
			} else {
				console.log('Standard output: \t' + chalk.red('Not OK ✗'));
				console.log('Expected output: \t' + c.out.trim());
				console.log('CLI response: \t\t' + stdout.trim());
				++failedTests;
			}
			if (c.file) {
				if (fs.existsSync(c.file)) {
					console.log('File created: \t\t' + chalk.green('OK ✓'));
					if (c.file !== '.token') fs.unlinkSync(c.file);
				} else {
					console.log('File created: \t\t' + chalk.red('Not OK ✗'));
					++failedTests;
				}
			}
			console.log('\n------------------\n');
		}
	}

	console.log('Report');
	console.log('Total tests: ' + chalk.blue(numOfTests));
	console.log('Successful tests: ' + chalk.green(numOfTests - failedTests));
	console.log('Failed tests: ' + chalk.red(failedTests));
};
