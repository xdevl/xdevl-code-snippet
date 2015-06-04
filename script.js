var xdevl=xdevl || {} ;
xdevl.codesnippet=xdevl.codesnippet || {} ;

jQuery(function($)
{
	xdevl.codesnippet.DEFAULT_LANGUAGE="text" ;
	xdevl.codesnippet.LANGUAGE_PREFIX="language-" ;
		
	xdevl.codesnippet.isCodeSnippet=function(node)
	{
		return node.tagName.toLowerCase()=="code" && node.parentNode!=null
				&& node.parentNode.tagName.toLowerCase()=="pre" ;
	} ;
	
	xdevl.codesnippet.Snippet=function(node)
	{
		this.init=function(node)
		{
			this.node=(node && xdevl.codesnippet.isCodeSnippet(node))?node:document.createElement("pre").appendChild(document.createElement("code")) ;
		} ;
		
		this.setCode=function(code)
		{
			//this.node.textContent=_.escape(code) ;
			//this.node.innerHTML=prettyPrintOne(_.escape(code)) ;
			this.node.textContent=code ;
		} ;
		
		this.getCode=function()
		{
			return this.node.textContent ;
		} ;
		
		this.setLanguage=function(language)
		{
			this.node.className=xdevl.codesnippet.LANGUAGE_PREFIX+(language) ;
			this.node.parentNode.className="prettyprint" ;
		} ;
		
		this.getLanguage=function()
		{
			if(!this.node.className || this.node.className.indexOf(xdevl.codesnippet.LANGUAGE_PREFIX)!=0)
				return xdevl.codesnippet.DEFAULT_LANGUAGE ;
			else return this.node.className.substr(xdevl.codesnippet.LANGUAGE_PREFIX.length) ;
		} ;
		
		this.isAttached=function()
		{
			return this.node.parentNode.parentNode!=null ;
		} ;
		
		this.getHTML=function()
		{
			return document.createElement("div").appendChild(this.node.parentNode).parentNode.innerHTML ;
		} ;
		
		this.encode=function(node)
		{
			node=node || this.node ;
			for(child in node.childNodes)
			{
				if(child.nodeType==3)
					child.nodeValue=child.nodeValue.replace(/ /g,"&#32;").replace(/\t/g,"&#9;").replace(/\r?\n/g,"&#10;") ;
				else if(child.nodeType==1)
					this.encode(child) ;
			}
		} ;
		
		this.init(node) ;
	} ;
	
	xdevl.codesnippet.Dialog=wp.media.view.Modal.extend(
	{
		controller: { trigger: function() {} },
		
		initialize: function()
		{
			wp.media.view.Modal.prototype.initialize.apply(this,arguments) ;
			ModalContentView=wp.Backbone.View.extend({
				template: wp.template(xdevl_codesnippet.TEMPLATE_ID),
				attributes : {
					id: xdevl_codesnippet.TEMPLATE_ID
				}
			}) ;
			this.content(new ModalContentView()) ;
		},
		
		open: function()
		{
			wp.media.view.Modal.prototype.open.apply(this,arguments) ;
			if(!this.editor)
			{
				this.editor=ace.edit(xdevl_codesnippet.EDITOR_ID) ;
				// Diasble error checks
				//this.editor.getSession().setUseWorker(false);
				// Hide vertical line hints for line lenght
				this.editor.setShowPrintMargin(false);
				
				var instance=this ;
				$("#"+xdevl_codesnippet.EDITOR_BUTTON_ID).click(function() {
					
					instance.codeSnippet.setCode(instance.editor.getValue()) ;
					instance.codeSnippet.setLanguage($("#"+xdevl_codesnippet.EDITOR_SETTINGS_LANGUAGE).val()) ;
					if(!instance.codeSnippet.isAttached())
						wp.media.editor.insert(instance.codeSnippet.getHTML()) ;
					
					instance.close() ;
				}) ;
				
				
				$("#"+xdevl_codesnippet.EDITOR_SETTINGS_THEME).change(function() {
					instance.editor.setTheme("ace/theme/"+$("#"+xdevl_codesnippet.EDITOR_SETTINGS_THEME).val()) ;
				}) ;
				
				$("#"+xdevl_codesnippet.EDITOR_SETTINGS_LANGUAGE).change(function() {
					instance.editor.getSession().setMode("ace/mode/"+$("#"+xdevl_codesnippet.EDITOR_SETTINGS_LANGUAGE).val()) ;
				}) ;
				
				$("#"+xdevl_codesnippet.EDITOR_SETTINGS_FONT_SIZE).change(function() {
					instance.editor.setFontSize($("#"+xdevl_codesnippet.EDITOR_SETTINGS_FONT_SIZE).val()+"em") ;
				}) ;
			}
			
			var node=tinymce.activeEditor.selection.getNode() ;
			while(node!=null && !node.tagName.toLowerCase()=="body" && !xdevl.codesnippet.isCodeSnippet(node))
				node=node.parentNode ;
			
			this.codeSnippet=new xdevl.codesnippet.Snippet(node) ;

			if(this.codeSnippet.isAttached())
			{
				$("#"+xdevl_codesnippet.EDITOR_SETTINGS_LANGUAGE).val(this.codeSnippet.getLanguage()) ;
				$("#"+xdevl_codesnippet.EDITOR_SETTINGS_LANGUAGE).change() ;
			}
			else this.codeSnippet.setLanguage($("#"+xdevl_codesnippet.EDITOR_SETTINGS_LANGUAGE).val()) ;
			
			$("#"+xdevl_codesnippet.EDITOR_SETTINGS_THEME).change() ;
			$("#"+xdevl_codesnippet.EDITOR_SETTINGS_FONT_SIZE).change() ;
			
			this.editor.setValue(this.codeSnippet.getCode(),1) ;
		},
		
		close: function()
		{
			wp.media.view.Modal.prototype.close.apply(this,arguments) ;
			$("#"+xdevl_codesnippet.EDITOR_BUTTON_ID).closest("form").ajaxSubmit({}) ;
		}
		
	}) ;
	
	xdevl.codesnippet.dialog=new xdevl.codesnippet.Dialog() ;
	
	$(document).ready
	(
		function()
		{
			$("#"+xdevl_codesnippet.BUTTON_ID).click(function(){xdevl.codesnippet.dialog.open();}) ;
		}
	) ;
}) ;

