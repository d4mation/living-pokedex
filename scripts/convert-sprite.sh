#!/bin/sh
# first parameter is the original file, second is the new file
# https://github.com/Cu3PO42/KeySAVe
convert "$1[0]"  -resize 100x100 -gravity center -background transparent -extent 100x100 "$2"
