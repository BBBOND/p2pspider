#!/bin/bash
if [ -f ~/.bash_profile ]; then
    . ~/.bash_profile
fi

max=$1
disk='/dev/simfs'
if [[ '$2' ]]; then
    disk=$2
fi


# --------------------------------
#  Start to check the disk space
# --------------------------------
while [ disk ]
    do
        percent=`df -P '${disk}' | tail -1 | awk '{print $5 }' | cut -d'%' -f1`
        if [ "${percent}" -ge "${max}" ]; then
            echo '磁盘告警'
            pm2 stop all
	    break
        fi;
        shift
    done;
