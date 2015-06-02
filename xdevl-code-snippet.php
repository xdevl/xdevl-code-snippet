<?php
/**
 * Plugin Name: XdevL code snippet
 * Plugin URI: http://www.xdevl.com/blog
 * Description: Create and manage inline code snippets in your posts
 * Version: 1.0
 * Author: XdevL
 * Author URI: http://www.xdevl.com/blog
 * License: GPL2
 *
 * @copyright Copyright (c) 2015, XdevL
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

namespace xdevl\codesnippet
{

defined( 'ABSPATH' ) or die('No script kiddies please!') ;

define(__NAMESPACE__.'\PLUGIN_NAMESPACE','xdevl_codesnippet') ;

// Theme settings
define(__NAMESPACE__.'\THEME_SETTINGS',PLUGIN_NAMESPACE.'_theme') ;
define(__NAMESPACE__.'\THEME_SETTINGS_NAME',THEME_SETTINGS.'_name') ;
define(__NAMESPACE__.'\THEME_SETTINGS_DEFAULT_NAME','default') ;
define(__NAMESPACE__.'\THEME_SETTINGS_FONT_SIZE',THEME_SETTINGS.'_fontsize') ;
define(__NAMESPACE__.'\THEME_SETTINGS_DEFAULT_FONT_SIZE','1') ; // 1em

// Editor settings
define(__NAMESPACE__.'\EDITOR_SETTINGS',PLUGIN_NAMESPACE.'_editor') ;
define(__NAMESPACE__.'\EDITOR_SETTINGS_LANGUAGE',EDITOR_SETTINGS.'_language') ;
define(__NAMESPACE__.'\EDITOR_SETTINGS_DEFAULT_LANGUAGE','c_cpp') ;
define(__NAMESPACE__.'\EDITOR_SETTINGS_THEME',EDITOR_SETTINGS.'_theme') ;
define(__NAMESPACE__.'\EDITOR_SETTINGS_DEFAULT_THEME','github') ;
define(__NAMESPACE__.'\EDITOR_SETTINGS_FONT_SIZE',EDITOR_SETTINGS.'_fontsize') ;
define(__NAMESPACE__.'\EDITOR_SETTINGS_DEFAULT_FONT_SIZE','1') ; //1em

function echo_files_as_options($dirName, $suffix, $prefix, $value)
{
	if($directory=opendir(plugin_dir_path(__FILE__).$dirName))
	{
		$options=array() ;
		while(($file=readdir($directory))!==false)
		{
			if((empty($suffix) || strpos($file,$suffix)===0) && (empty($prefix) || strpos($file,$prefix)===strlen($file)-strlen($prefix)))
				array_push($options,substr($file,strlen($suffix),strlen($prefix)*-1)) ;
		}
		closedir($directory) ;
		sort($options,SORT_STRING) ;
		
		foreach($options as $option)
			if($option==$value)
				echo "<option value=\"$option\" selected=selected>$option</option>" ;
			else echo "<option value=\"$option\">$option</option>" ;
	}
}

function echo_ace_options($type, $value)
{
	echo_files_as_options('ace',$type.'-','.js',$value) ;
}

function echo_font_size_options($args)
{
	$name=$args[0] ;
	$value=get_option($name,$args[1]) ;
	echo "<select name=\"$name\" id=\"$name\">" ;
	for($i=5;$i<=15;++$i)
	{
		$font_size=$i/10 ;
		if($font_size==$value)
			echo "<option value=\"$font_size\" selected=selected>$font_size em</option>" ;
		else echo "<option value=\"$font_size\">$font_size em</option>" ;
	}
	echo "</select>" ;
}

function echo_prettify_options($args)
{
	$name=$args[0] ;
	$value=get_option($name,$args[1]) ;
	echo "<select name=\"$name\" id=\"$name\">" ;
	if(empty($value) || $value=='default')
		echo "<option value=\"default\" selected=selected>default</option>" ;
	else echo "<option value=\"default\">default</option>" ;
	echo_files_as_options('themes','','.css',$value) ;
	echo "</select>" ;
}

function media_buttons()
{
	echo '<a href="#" id="xdevl-code-snippet" class="button"><span class="xdevl-code-button"></span>Code</a>' ;
}

function wp_enqueue_media()
{
	wp_register_style('xdevl-code-snippet-style',plugins_url('style.css',__FILE__)) ;
	wp_enqueue_style('xdevl-code-snippet-style') ;
	
	wp_register_script('ace',plugins_url('ace/ace.js',__FILE__),array( 'jquery' )) ;
	wp_enqueue_script('ace') ;
	
	// TODO: use wp_localize_script to pass default parameters
	wp_register_script('xdevl-code-snippet-script',plugins_url('script.js',__FILE__),array('jquery','jquery-form','ace')) ;
	wp_enqueue_script('xdevl-code-snippet-script') ;
}

function admin_footer()
{
	?>
<script type="text/template" id="tmpl-xdevl-code-snippet">
	<div class="wrapper">
		<div class="header">
			<h1>Code snippet</h1>
			<form id="code-snippet-form" method="post" action="options.php">
				<?php settings_fields(EDITOR_SETTINGS);
					do_settings_sections(EDITOR_SETTINGS); ?>
				
				<div class="field">					
				<label for="<?php echo EDITOR_SETTINGS_LANGUAGE; ?>">Language:</label><select id="ace-mode" name="<?php echo EDITOR_SETTINGS_LANGUAGE; ?>">
						<?php echo_ace_options('mode',get_option(EDITOR_SETTINGS_LANGUAGE,EDITOR_SETTINGS_DEFAULT_LANGUAGE)); ?></select>
				</div>
				<div class="field">
				<label for="<?php echo EDITOR_SETTINGS_FONT_SIZE; ?>">Font size:</label>
					<?php echo_font_size_options(array(EDITOR_SETTINGS_FONT_SIZE,EDITOR_SETTINGS_DEFAULT_FONT_SIZE)); ?>
				</div>
				<div class="field">		
				<label for="<?php echo EDITOR_SETTINGS_THEME; ?>">Theme:</label><select id="ace-theme" name="<?php echo EDITOR_SETTINGS_THEME; ?>"
						<?php echo_ace_options('theme',get_option(EDITOR_SETTINGS_THEME,EDITOR_SETTINGS_DEFAULT_THEME)); ?></select>
				</div>
				<div class="field">
					<a href="#" id="save-code-snippet" class="button-primary"><?php _e( 'Save snippet' ); ?></a>
				</div>
			</form>
		</div>
		<div class="editor"><div id="ace-editor"></div></div>
	</div>
</script>
	<?php
}

function code_snippet_page()
{
	?>
<div>
	<h2>XdevL code snippets setup</h2>
	<form method="post" action="options.php">
		<?php settings_fields(THEME_SETTINGS);
			do_settings_sections(THEME_SETTINGS);
			submit_button(); ?>
	</form>
</div>
	<?php
}

function admin_menu()
{
	add_theme_page('XdevL code snippets setup','XdevL code snippets','edit_theme_options',PLUGIN_NAMESPACE, __NAMESPACE__.'\code_snippet_page') ;
}

function wp_enqueue_scripts()
{
	$theme=get_option(THEME_SETTINGS_NAME,THEME_SETTINGS_DEFAULT_NAME) ;
	if(empty($theme) || $theme=="default")
		$themeFile='google-code-prettify/prettify.css' ;
	else $themeFile="themes/$theme.css" ;
	
	wp_register_style('prettify-css',plugins_url($themeFile,__FILE__)) ;
	wp_enqueue_style('prettify-css') ;
	
	wp_register_script('prettify-script',plugins_url('google-code-prettify/prettify.js',__FILE__),array('jquery')) ;
	wp_enqueue_script('prettify-script') ;
}

function wp_head()
{
	?>
	<style>pre.prettyprint {font-size: <?php echo esc_attr(get_option(
		THEME_SETTINGS_FONT_SIZE,THEME_SETTINGS_DEFAULT_FONT_SIZE)); ?>em !important;} </style>
	
	<?php
}

function wp_footer()
{
	?>
		<script type="text/javascript">prettyPrint();</script>
	<?php
}

function admin_init()
{
	register_setting(THEME_SETTINGS,THEME_SETTINGS_NAME) ;
	register_setting(THEME_SETTINGS,THEME_SETTINGS_FONT_SIZE) ;
	add_settings_section(THEME_SETTINGS,null,null,THEME_SETTINGS) ;
	add_settings_field(THEME_SETTINGS_NAME,'Theme:', __NAMESPACE__.'\echo_prettify_options',THEME_SETTINGS,THEME_SETTINGS,array(THEME_SETTINGS_NAME,THEME_SETTINGS_DEFAULT_NAME)) ;
	add_settings_field(THEME_SETTINGS_FONT_SIZE,'Font size:', __NAMESPACE__.'\echo_font_size_options',THEME_SETTINGS,THEME_SETTINGS,array(THEME_SETTINGS_FONT_SIZE,THEME_SETTINGS_DEFAULT_FONT_SIZE)) ;
	
	register_setting(EDITOR_SETTINGS,EDITOR_SETTINGS_LANGUAGE) ;
	register_setting(EDITOR_SETTINGS,EDITOR_SETTINGS_FONT_SIZE) ;
	register_setting(EDITOR_SETTINGS,EDITOR_SETTINGS_THEME) ;
}

// admin setup
if(is_admin())
{
	add_action('media_buttons',__NAMESPACE__.'\media_buttons',20) ;
	add_action('wp_enqueue_media',__NAMESPACE__.'\wp_enqueue_media') ;
	add_action('admin_footer-post.php',__NAMESPACE__.'\admin_footer') ;
	add_action('admin_footer-post-new.php',__NAMESPACE__.'\admin_footer') ;
	add_action('admin_menu',__NAMESPACE__.'\admin_menu') ;
	add_action('admin_init',__NAMESPACE__.'\admin_init') ;
}
// front end setup
else
{
	add_action('wp_enqueue_scripts',__NAMESPACE__.'\wp_enqueue_scripts') ;
	add_action('wp_head',__NAMESPACE__.'\wp_head') ;
	add_action('wp_footer',__NAMESPACE__.'\wp_footer') ;
}

} //Endo of xdevl\codesnippet

?>
