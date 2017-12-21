i=0;

while [[ `pm2 jlist | jq .[$i].pm_id` != null ]]; do
	pm_id=`pm2 jlist | jq .[$i].pm_id`;
	cpu=`pm2 jlist | jq .[$i].monit.cpu`;

	if [[ $cpu > 50 ]]; then
		pm2 restart $pm_id
	fi
	echo $pm_id $cpu
	i=$i+1;
done

