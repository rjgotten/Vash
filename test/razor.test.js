var vows = require('vows')
	,assert = require('assert')
	,razor = require('../src/razor');
	
vows.describe('razor templating library').addBatch({
	'a plain text template': {
		topic: function(){
			return razor.tpl('<a href="">this is a <br /> simple template</a>');
		}
		,'sends back the same plain text': function(topic){
			assert.equal( topic(), '<a href="">this is a <br /> simple template</a>');
		}
	}
	,'during "why are you using a template?"-style idiotic edge-cased interpolation': {
		topic: function(){
			return razor.tpl('@i');
		}
		,'we get 2 from just @i': function(topic){
			assert.equal( topic({ i: 2 }), 2 );
		}
		,'we get <li class="what"></li> from just @i': function(topic){
			assert.equal( topic({ i: '<li class="what"></li>' }), '<li class="what"></li>' );
		}
	}
	,'during simple interpolation': {
		topic: function(){
			var str = '<li class="@className">@itemName</li>';
			//console.log( razor._parse(str) )
			return razor.tpl(str);
		}
		,'we get <li class="blue">the blue item</li>': function(topic){
			//console.log(topic);
			assert.equal( 
				topic( { 
					className: 'blue'
					,itemName: 'the blue item' } )
				,'<li class="blue">the blue item</li>' );
		}
	}
	,'for blocks': {
		topic: function(){
			var str = '@for(var i = 0; i < 10; i++){ \n }';
			return razor.tpl(str);
		}
		,'output nothing': function(topic){
			assert.equal( topic(), '' );
		}
	}
	,'for blocks and markup': {
		topic: function(){
			var str = "@for(var i = 0; i < 1; i++){ <li class=\"\">list item</li> \n }";
			return razor.tpl(str);
		}
		,'output markup': function(topic){
			assert.equal(topic(), '<li class="">list item</li> \n ');
		}
	}
	,'for blocks and markup with interpolation/expression': {
		topic: function(){
			var str = "@for(var i = 0; i < 1; i++){ <li class=\"@i\">list item</li> \n }";
			return razor.tpl(str);
		}
		,'output markup': function(topic){
			assert.equal(topic(), '<li class="0">list item</li> \n ');
		}
	}
	,'for blocks and markup with complex interpolation/expression': {
		topic: function(){
			var str = "@for(var i = 0; i < 1; i++){ <li class=\"@(i % 2 == 0 ? \"blue\" : \"red\")\">list item</li> \n }";
			return razor.tpl(str);
		}
		,'output markup': function(topic){
			assert.equal(topic(), '<li class="blue">list item</li> \n ');
		}
	}
	,'nested for blocks and markup with complex interpolation/expression': {
		topic: function(){
			var str = "@for(var i = 0; i < 1; i++){ for(var j = 0; j < 2; j++) { <li class=\"@(i % 2 == 0 ? \"blue\" : \"red\")\">list item</li> \n } }";
			return razor.tpl(str);
		}
		,'output markup': function(topic){
			assert.equal(topic(), '<li class="blue">list item</li> \n <li class="blue">list item</li> \n ');
		}
	}
	,'empty try/catch block': {
		topic: function(){
			var str = "@try { var i = 0; } catch(e){  }";
			return razor.tpl(str);
		}
		,'outputs nothing': function(topic){
			assert.equal(topic(), '')
		}
	}
	,'when try/catch block throws exception': {
		topic: function(){
			var str = "@try { throw new Error('error') } catch(e){ <li>list item</li> \n }";
			return razor.tpl(str);
		}
		,'catch block outputs markup': function(topic){
			assert.equal(topic(), '<li>list item</li> \n ')
		}
	}
	,'when try/catch block does not throw exception': {
		topic: function(){
			var str = "@try { <li>list item</li> \n } catch(e){  }";
			return razor.tpl(str);
		}
		,'try block outputs markup': function(topic){
			assert.equal(topic(), '<li>list item</li> \n ')
		}
	}
	,'when try/catch/finally block does not throw exception': {
		topic: function(){
			var str = "@try { <li>list item</li> \n } catch(e){  } finally{ <li>list item 2</li> \n }";
			return razor.tpl(str);
		}
		,'try block outputs markup': function(topic){
			assert.equal(topic(), '<li>list item</li> \n <li>list item 2</li> \n ')
		}
	}
	,'simple expression': {
		topic: function(){
			var str = '<a href="@(true)"></a>';
			return razor.tpl(str);
		}
		,'outputs true': function(topic){
			assert.equal(topic(), '<a href="true"></a>');
		}
	}
	,'expression with nested parenthesis': {
		topic: function(){
			var str = '<a href="@( true == (Math.random() + 1 >= 1 ? true : false) ? "red" : "blue" )"></a>';
			return razor.tpl(str);
		}
		,'outputs red': function(topic){
			assert.equal(topic(), '<a href="red"></a>');
		}
	}
	,'empty anonymous block': {
		topic: function(){
			var str = "@{ }";
			return razor.tpl(str);
		}
		,'outputs nothing': function(topic){
			assert.equal(topic(), '');
		}
	}
	,'empty anonymous block with same-line markup': {
		topic: function(){
			var str = "@{ @<li>list item</li> @}";
			return razor.tpl(str);
		}
		,'outputs markup': function(topic){
			assert.equal(topic(), '<li>list item</li> ');
		}
	}
	,'anonymous block': {
		topic: function(){
			var str = "@{ <li class=\"1\">list item</li> \n }";
			return razor.tpl(str);
		}
		,'outputs markup': function(topic){
			assert.equal(topic(), '<li class="1">list item</li> \n ');
		}
	}
	,'nested markup and anonymous block': {
		topic: function(){
			var str = "@{ <li class=\"1\">list item</li> @{ <li class=\"2\">list item</li> \n } \n }";
			return razor.tpl(str);
		}
		,'outputs markup': function(topic){
			assert.equal(topic(), '<li class=\"1\">list item</li> <li class=\"2\">list item</li> \n ');
		}
	}
	,'anonymous block and nested for loop': {
		topic: function(){
			var str = "@{ <li class=\"1\">list item</li> @for(var i = 0; i < 1; i++){ <li class=\"2\">list item</li> \n } \n }";
			return razor.tpl(str);
		}
		,'outputs markup': function(topic){
			assert.equal( topic(), '<li class=\"1\">list item</li> <li class=\"2\">list item</li> \n ' );
		}
	}
	,'anonymous block and named function defined': {
		topic: function(){
			var str = "@{ <li class=\"1\">list item</li> @function testFunc(param1, param2){ <li class=\"2\">list item</li> \n } \n }";
			return razor.tpl(str);
		}
		,'outputs non-function defined markup': function(topic){
			assert.equal( topic(), '<li class=\"1\">list item</li> ' );
		}
	}
	,'anonymous block and named function defined and called': {
		topic: function(){
			var str = "@{ <li class=\"1\">list item</li> @function testFunc(param1, param2){ <li class=\"2\">list item</li> \n } testFunc(); \n }";
			return razor.tpl(str);
		}
		,'outputs non-function defined markup': function(topic){
			assert.equal( topic(), '<li class=\"1\">list item</li> <li class=\"2\">list item</li> \n ' );
		}
	}
	,'mixing code and plain text, <text> escape': {
		topic: function(){
			var str = '@if (true) { \n'
				+ '<text>Plain Text</text>\n'
				+ '}';
			return razor.tpl(str);
		}
		,'outputs plain text': function(topic){
			assert.equal( topic(), 'Plain Text\n' );
		}
	}
	,'mixing code and plain text, @: escape': {
		topic: function(){
			var str = '@if (true) { \n'
				+ '@:Plain Text\n'
				+ '}';
			return razor.tpl(str);
		}
		,'outputs plain text': function(topic){
			assert.equal( topic(), 'Plain Text\n' );
		}
	}
	,'including email address in markup': {
		topic: function(){
			var str = 'Hi philha@example.com';
			return razor.tpl(str);
		}
		,'does not leave markup mode': function(topic){
			assert.equal(topic(), 'Hi philha@example.com');
		}
	}
	,'explicit expression': {
		topic: function(){
			var str = '<span>ISBN@(isbnNumber)</span>';
			return razor.tpl(str);
		}
		,'does not trip e-mail escape': function(topic){
			assert.equal( topic({isbnNumber: 10101}), '<span>ISBN10101</span>' )
		}
	}
	,'escaping the @ symbol': {
		topic: function(){
			var str = '<span>In Razor, you use the @@foo to display the value of foo</span>';
			return razor.tpl(str);
		}
		,'leaves just a single @': function(topic){
			assert.equal( topic(), '<span>In Razor, you use the @foo to display the value of foo</span>' )
		}
	}
	,'"server-side" comments': {
		topic: function(){
			var str = '@* \n'
				+ 'This is a server side \n'
				+ 'multiline comment \n'
				+ '*@';
			return razor.tpl(str);
		}
		,'output nothing': function(topic){
			assert.equal( topic(), '' )
		}
	}
	,'mixing expressions and text': {
		topic: function(){
			var str = 'Hello @title. @name.';
			return razor.tpl(str);
		}
		,'outputs text': function(topic){
			assert.equal( topic({ title: 'Mr', name: 'Doob' }), 'Hello Mr. Doob.');
		}
	}
}).run();