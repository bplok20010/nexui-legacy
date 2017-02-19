/**
* lang.js
*/
define(function(require, exports, module){
	var lang = require('./lang');
	var support = require('./support');
	var Class = require('./Class');
	var ClassManager = require('./ClassManager');
	var root = window;
	
	Nex = root.Nex || {};
	
	lang.extend(Nex, lang);
	
	Nex.extend( Nex, {
		version : '1.0',
		global : root,
		Class: Class,
		define: Class,
		ClassManager : ClassManager,
		create: Nex.bind(ClassManager.create, ClassManager),
		Create: Nex.bind(ClassManager.create, ClassManager),
		getClass: Nex.bind(ClassManager.get, ClassManager),
		zIndex : 9999,
		topzIndex : 999999,
		dropdownzIndex : 9999999,
		support : support
	} );
	
	return Nex;
});