var xdevl=xdevl || {} ;

jQuery(function($)
{		
	xdevl.CodeSnippet=function(node)
	{
		xdevl.CodeSnippet.DEFAULT_LANGUAGE="text" ;
		xdevl.CodeSnippet.LANGUAGE_PREFIX="language-" ;
		
		xdevl.CodeSnippet.isCodeSnippet=function(node)
		{
			return node.tagName.toLowerCase()=="code" && node.parentNode!=null
					&& node.parentNode.tagName.toLowerCase()=="pre" ;
		} ;
		
		this.init=function(node)
		{
			this.node=(node && xdevl.CodeSnippet.isCodeSnippet(node))?node:document.createElement("pre").appendChild(document.createElement("code")) ;
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
			this.node.className=xdevl.CodeSnippet.LANGUAGE_PREFIX+(language) ;
			this.node.parentNode.className="prettyprint" ;
		} ;
		
		this.getLanguage=function()
		{
			if(!this.node.className || this.node.className.indexOf(xdevl.CodeSnippet.LANGUAGE_PREFIX)!=0)
				return xdevl.CodeSnippet.DEFAULT_LANGUAGE ;
			else return this.node.className.substr(xdevl.CodeSnippet.LANGUAGE_PREFIX.length) ;
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
	
	xdevl.CodeSnippetDialog=wp.media.view.Modal.extend(
	{
		controller: { trigger: function() {} },
		
		initialize: function()
		{
			wp.media.view.Modal.prototype.initialize.apply(this,arguments) ;
			ModalContentView=wp.Backbone.View.extend({
				template: wp.template("xdevl-code-snippet"),
				attributes : {
					id: "xdevl-code-dialog"
				}
			}) ;
			this.content(new ModalContentView()) ;
		},
		
		open: function()
		{
			wp.media.view.Modal.prototype.open.apply(this,arguments) ;
			if(!this.editor)
			{
				this.editor=ace.edit("ace-editor") ;
				// Diasble error checks
				//this.editor.getSession().setUseWorker(false);
				// Hide vertical line hints for line lenght
				this.editor.setShowPrintMargin(false);
				
				var instance=this ;
				$("#save-code-snippet").click(function() {
					
					instance.codeSnippet.setCode(instance.editor.getValue()) ;
					instance.codeSnippet.setLanguage($("#ace-mode").val()) ;
					if(!instance.codeSnippet.isAttached())
						wp.media.editor.insert(instance.codeSnippet.getHTML()) ;
					
					instance.close() ;
					$("#code-snippet-form").ajaxSubmit({});
				}) ;
				
				$("#ace-theme").change(function() {
					instance.editor.setTheme("ace/theme/"+$("#ace-theme").val()) ;
				}) ;
				
				$("#ace-mode").change(function() {
					instance.editor.getSession().setMode("ace/mode/"+$("#ace-mode").val()) ;
				}) ;
				
				$("#xdevl_codesnippet_editor_fontsize").change(function() {
					instance.editor.setFontSize($("#xdevl_codesnippet_editor_fontsize").val()+"em") ;
				}) ;
			}
			
			var node=tinymce.activeEditor.selection.getNode() ;
			while(node!=null && !node.tagName.toLowerCase()=="body" && !xdevl.CodeSnippet.isCodeSnippet(node))
				node=node.parentNode ;
			
			this.codeSnippet=new xdevl.CodeSnippet(node) ;

			if(this.codeSnippet.isAttached())
			{
				$("#ace-mode").val(this.codeSnippet.getLanguage()) ;
				$("#ace-mode").change() ;
			}
			else this.codeSnippet.setLanguage($("#ace-mode").val()) ;
			
			$("#ace-theme").change() ;
			$("#ace-font-size").change() ;
			
			this.editor.setValue(this.codeSnippet.getCode(),1) ;
		}
	}) ;
	
	xdevl.codeSnippetDialog=new xdevl.CodeSnippetDialog() ;
	
	$(document).ready
	(
		function()
		{
			$("#xdevl-code-snippet").click(function(){xdevl.codeSnippetDialog.open();}) ;
		}
	) ;
}) ;

