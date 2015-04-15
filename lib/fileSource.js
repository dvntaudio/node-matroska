/*jslint node: true, vars: true, nomen: true */
'use strict';

var fs = require('fs');
var util = require('util');

var AbstractSource = require('./abstractSource');
var tools = require('./tools');

function FileSource(filename) {
	AbstractSource.call(this);

	this.filename = filename;
}

util.inherits(FileSource, AbstractSource);

module.exports = FileSource;

/**
 * @private
 * @param callback
 */
FileSource.prototype._getStream = function(output, start, end, callback) {
	output = output || this;

	var fd = output._fd;
	if (fd) {
		var params = {
			flags: 'r',
			fd: fd,
			autoClose: false
		};
		if (typeof (start) === "number") {
			params.start = start;
		}
		if (typeof (end) === "number") {
			params.end = end - 1;
		}

		var stream = fs.createReadStream(this.filename, params);

		return callback(null, stream);
	}

	fs.open(this.filename, 'r', function(error, fd) {
		if (error) {
			return callback(error);
		}

		output._fd = fd;

		self._getStream(output, start, end, callback);
	});
};

/**
 * @private
 */
FileSource.prototype._end = function(output, callback) {
	var self = this;

	if (!output._fd) {
		return callback();
	}

	fs.close(output._fd, function(error) {
		delete output._fd;

		return callback(error);
	});
};