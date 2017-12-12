#!/bin/bash
if [ -f ~/.bash_profile ]; then
    . ~/.bash_profile
fi

max=$1
disk=/dev/simfs
if [[ $2 != '' ]]; then
    disk=$2
fi

echo ${disk}
# --------------------------------
#  Start to check the disk space
# --------------------------------
percent=`df -P ${disk} | tail -1 | awk '{print $5 }' | cut -d'%' -f1`
if [ "${percent}" -ge "${max}" ]; then
	echo '磁盘告警'
        pm2 stop all;
else
	echo 磁盘占用 ${percent};
fi;
