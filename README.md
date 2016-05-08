# XdevL code snippet

Wordpress plugin providing a syntax highlighted editor for various languages to edit code snippets embedded in your posts and globally manage their rendering via the use of various provided themes.

# How to

In order to build and package this plugin you will need [python3](https://www.python.org) and [git](https://git-scm.com/) installed locally on your machine.

Start off by downloading the plugin dependencies by running the following command at the root of the plugin directory:
```markdown
python build.py update
```
Once complete the plugin directory should have everything needed in order to work. If it happens to be located under your local Wordpress plugin directory, you should be able to edit any files and directly see the result on your local Wordpress installation.

To package the plugin as a zipped Wordpress plugin file and strip down any unwanted files, symply run:
```markdown
python build.py package
```

# LICENSE

This plugin is licenced under [GPLV2](http://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html) and powered by [Ace](https://ace.c9.io), [Google code prettify](https://github.com/google/code-prettify) and [Color themes for Google prettify](https://jmblog.github.io/color-themes-for-google-code-prettify/).
