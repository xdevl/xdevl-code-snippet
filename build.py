#!/usr/bin/python3

import os
import subprocess
import sys
import shutil
import urllib.request
import zipfile

SCRIPT_NAME=os.path.basename(__file__)
PLUGIN_NAME="xdevl-code-snippet"
PLUGIN_VERSION="1.0"
PACKAGE_NAME="%s-%s.zip"%(PLUGIN_NAME,PLUGIN_VERSION)
CMD_UPDATE="update"
CMD_PACKAGE="package"
TMP_DIRECTORY="tmp"

working_directory=sys.path[0]
tmp_directory=os.path.join(working_directory,TMP_DIRECTORY)

# Delete a directory
def clean(directory):
	if os.path.isdir(directory):
		shutil.rmtree(directory)

# Clone a git repository and checkout a specific revision
def clone(url, revision):
	directory=os.path.join(tmp_directory,url.split("/")[-1])
	print("Cloning %s..."%url)
	subprocess.check_call(["git","clone",url,directory])
	subprocess.check_call(["git","checkout",revision],cwd=directory)
	return directory

# Download a file from the internet
def download(url):
	download=os.path.join(tmp_directory,url.split("/")[-1])
	print("Downloading %s..."%url)
	urllib.request.urlretrieve(url,download)
	return download

# Add a directory into a zip file with the given name
def zip_dir(z, name, directory):
	exclude=[".git",".gitignore",TMP_DIRECTORY,SCRIPT_NAME,PACKAGE_NAME]
	for entry in os.listdir(directory):
		if entry not in exclude:
			real_path=os.path.join(directory,entry)
			archive_path=os.path.join(name,entry)
			if os.path.isdir(real_path):
				zip_dir(z,archive_path,real_path)
			else:
				z.write(real_path,archive_path)
	
if(len(sys.argv)==1):
	action=CMD_PACKAGE
elif(len(sys.argv)==2):
	action=sys.argv[1]
else:
	action=""

clean(tmp_directory)

if action.lower()==CMD_UPDATE:
	
	# Ace javascript editor
	directory=os.path.join(working_directory,"ace")
	clean(directory)
	clone_directory=clone("https://github.com/ajaxorg/ace-builds.git","v1.2.3")
	shutil.copytree(os.path.join(clone_directory,"src-min-noconflict"),directory)
	
	# Google prettify code
	directory=os.path.join(working_directory,"google-code-prettify")
	clean(directory)
	clone_directory=clone("https://github.com/google/code-prettify.git","9c3730f40994018a8ca9b786b088826b60d7b54a")
	with zipfile.ZipFile(os.path.join(clone_directory,"distrib","prettify-small.zip")) as z:
		z.extractall(working_directory)
	
	# Google prettify themes
	directory=os.path.join(working_directory,"themes")
	clean(directory)
	themes_zip=download("https://github.com/jmblog/color-themes-for-google-code-prettify/releases/download/v2.0/themes.zip")
	with zipfile.ZipFile(themes_zip) as z:
		z.extractall(working_directory)
	# Only keep minified css theme files	
	for css_file in os.listdir(directory):
		min_extension=".min.css"
		if css_file.endswith(min_extension):
			os.rename(os.path.join(directory,css_file),os.path.join(directory,"%s.css"%css_file[:-1*len(min_extension)]))
	
		
elif action.lower()==CMD_PACKAGE:
	
	# Create a zip plugin package
	with zipfile.ZipFile(os.path.join(working_directory,PACKAGE_NAME),"w") as z:
		zip_dir(z,PLUGIN_NAME,working_directory)
			
else:
	print("usage: %s update | package"%SCRIPT_NAME)

clean(tmp_directory)
	
	
