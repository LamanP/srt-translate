# SRT translation aid
This package contains some scripts to facilitate translation SRT subtitle files.

## Basic idea
The idea is as follows:

1. Obtain an SRT file with the original subtitles. One way to obtain this is using https://www.temi.com.
2. Then run the _encode_ script: `npm run encode`. This script converts the SRT file to an HTML file that can easily be translated by _Google Translate_.
3. Open the HTML file in Chrome, right click in it and translate it.
4. Press the button. The translated SRT code is now in the text area
5. Copy/past it into an SRT file.
5. Optionally, you can use the `subtitle` program to edit your subtitles and/or view the results.

## Installing and building the package

* Clone/download this repository from github.
* Make sure you have `nodejs` installed on your system (see https://nodejs.org/en/download/).
* Open a command window and change to the folder you put this repo in for the steps below:
* If you haven't installed _Typescript_ on your machine, run

    `npm install -g typescript`.

* To use the web server, run

    `npm install -g http-server`

* Install the dependencies for this package:

    `npm install`

* Compile the _Typescript_ files to Javascript:

    `tsc`.

* Now you're ready to run the script!

## Running the script

To encode SRT to HTML:

npm run encode _filename_ _srclan_ _trglan_