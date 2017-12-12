#!/bin/bash
pm2 start /home/p2pspider/p2pspider/index.js -i 4 >log 2>&1

#/home/p2pspider/p2pspider/checkDisk.sh 90 >>log 2>&1;
