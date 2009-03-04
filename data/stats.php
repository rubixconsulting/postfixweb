<?php

include_once('../lib/session.inc.php');

requireSiteAdmin();

$time = $_GET['time'];

if(!$time) {
	exit;
}

global $config;

if(!$config['stats']['enabled'] || !$config['stats']['mailgraph']['enabled']) {
	exit;
}

$xpoints           = 540;
$points_per_sample = 3;
$ypoints           = 160;
$ypoints_err       = 96;
$rrd               = $config['stats']['mailgraph']['rrd'];
$rrd_virus         = $config['stats']['mailgraph']['rrd_virus'];
$tmp_dir           = $config['stats']['mailgraph']['tmp_dir'];

$color = array(
	'sent'     => '000099',
	'received' => '009900',
	'rejected' => 'AA0000',
	'bounced'  => '000000',
	'virus'    => 'DDBB00',
	'spam'     => '999999'
);

$seconds = 0;
if($time == 'day') {
	$seconds = 60 * 60 * 24;
} else if($time == 'week') {
	$seconds = 60 * 60 * 24 * 7;
} else if($time == 'month') {
	$seconds = 60 * 60 * 24 * 31;
} else if($time == 'year') {
	$seconds = 60 * 60 * 24 * 365;
} else {
	exit;
}

$graph_file     = $tmp_dir.'/mailgraph_'.$time.'.png';
$err_graph_file = $tmp_dir.'/mailgraph_'.$time.'_err.png';

function rrd_graph($range, $file, $ypoints, $rrdargs) {
	global $points_per_sample, $xpoints;
	$step = $range * $points_per_sample / $xpoints;
	$end  = time();
	$end -= $end % $step;
	$date = strftime("%c");
	$date = str_replace(':', '\\:', $date);
	$cmd = "rrdtool graph $file".
		" --imgformat 'PNG'".
		" --width $xpoints".
		" --height $ypoints".
		" --start -$range".
		" --end $end".
		" --vertical-label 'msgs/min'".
		" --lower-limit 0".
		" --units-exponent 0".
		" --lazy".
		" --color 'SHADEA#ffffff'".
		" --color 'SHADEB#ffffff'".
		" --color 'BACK#ffffff'".
		" --slope-mode".
		" $rrdargs".
		" COMMENT:'[$date]\\r'";
	exec($cmd, $output, $ret);
	return $ret;
}

function graph($range, $file) {
	global $points_per_sample, $xpoints, $ypoints, $rrd, $color;
	$step = $range * $points_per_sample / $xpoints;
	rrd_graph($range, $file, $ypoints,
		" DEF:sent=$rrd:sent:AVERAGE".
		" DEF:msent=$rrd:sent:MAX".
		" CDEF:rsent='sent,60,*'".
		" CDEF:rmsent='msent,60,*'".
		" CDEF:dsent='sent,UN,0,sent,IF,$step,*'".
		" CDEF:ssent='PREV,UN,dsent,PREV,IF,dsent,+'".
		" AREA:rsent#".$color['sent'].":'Sent    '".
		" GPRINT:ssent:MAX:'total\: %8.0lf msgs'".
		" GPRINT:rsent:AVERAGE:'avg\: %5.2lf msgs/min'".
		" GPRINT:rmsent:MAX:'max\: %4.0lf msgs/min\l'".
		" DEF:recv='$rrd:recv:AVERAGE'".
		" DEF:mrecv='$rrd:recv:MAX'".
		" CDEF:rrecv='recv,60,*'".
		" CDEF:rmrecv='mrecv,60,*'".
		" CDEF:drecv='recv,UN,0,recv,IF,$step,*'".
		" CDEF:srecv='PREV,UN,drecv,PREV,IF,drecv,+'".
		" LINE2:rrecv#".$color['received'].":Received".
		" GPRINT:srecv:MAX:'total\: %8.0lf msgs'".
		" GPRINT:rrecv:AVERAGE:'avg\: %5.2lf msgs/min'".
		" GPRINT:rmrecv:MAX:'max\: %4.0lf msgs/min\l'"
	);
}

function graph_err($range, $file) {
	global $points_per_sample, $xpoints, $ypoints_err, $rrd, $rrd_virus, $color;
	$step = $range * $points_per_sample / $xpoints;
	rrd_graph($range, $file, $ypoints_err,
		" DEF:bounced=$rrd:bounced:AVERAGE".
		" DEF:mbounced=$rrd:bounced:MAX".
		" CDEF:rbounced='bounced,60,*'".
		" CDEF:dbounced='bounced,UN,0,bounced,IF,$step,*'".
		" CDEF:sbounced='PREV,UN,dbounced,PREV,IF,dbounced,+'".
		" CDEF:rmbounced='mbounced,60,*'".
		" AREA:rbounced#".$color['bounced'].":'Bounced '".
		" GPRINT:sbounced:MAX:'total\: %8.0lf msgs'".
		" GPRINT:rbounced:AVERAGE:'avg\: %5.2lf msgs/min'".
		" GPRINT:rmbounced:MAX:'max\: %4.0lf msgs/min\l'".
		" DEF:virus='$rrd_virus:virus:AVERAGE'".
		" DEF:mvirus='$rrd_virus:virus:MAX'".
		" CDEF:rvirus='virus,60,*'".
		" CDEF:dvirus='virus,UN,0,virus,IF,$step,*'".
		" CDEF:svirus='PREV,UN,dvirus,PREV,IF,dvirus,+'".
		" CDEF:rmvirus='mvirus,60,*'".
		" STACK:rvirus#".$color['virus'].":'Viruses '".
		" GPRINT:svirus:MAX:'total\: %8.0lf msgs'".
		" GPRINT:rvirus:AVERAGE:'avg\: %5.2lf msgs/min'".
		" GPRINT:rmvirus:MAX:'max\: %4.0lf msgs/min\l'".
		" DEF:spam='$rrd_virus:spam:AVERAGE'".
		" DEF:mspam='$rrd_virus:spam:MAX'".
		" CDEF:rspam='spam,60,*'".
		" CDEF:dspam='spam,UN,0,spam,IF,$step,*'".
		" CDEF:sspam='PREV,UN,dspam,PREV,IF,dspam,+'".
		" CDEF:rmspam='mspam,60,*'".
		" STACK:rspam#".$color['spam'].":'Spam    '".
		" GPRINT:sspam:MAX:'total\: %8.0lf msgs'".
		" GPRINT:rspam:AVERAGE:'avg\: %5.2lf msgs/min'".
		" GPRINT:rmspam:MAX:'max\: %4.0lf msgs/min\l'".
		" DEF:rejected='$rrd:rejected:AVERAGE'".
		" DEF:mrejected='$rrd:rejected:MAX'".
		" CDEF:rrejected='rejected,60,*'".
		" CDEF:drejected='rejected,UN,0,rejected,IF,$step,*'".
		" CDEF:srejected='PREV,UN,drejected,PREV,IF,drejected,+'".
		" CDEF:rmrejected='mrejected,60,*'".
		" LINE2:rrejected#".$color['rejected'].":'Rejected'".
		" GPRINT:srejected:MAX:'total\: %8.0lf msgs'".
		" GPRINT:rrejected:AVERAGE:'avg\: %5.2lf msgs/min'".
		" GPRINT:rmrejected:MAX:'max\: %4.0lf msgs/min\l'"
	);
}

$img = $_GET['img'];
if($img) {
	$file = $graph_file;
	$err = $_GET['err'];
	if($err) {
		$file = $err_graph_file;
	}
	header("Content-type: image/png");
	header("Content-length: ".filesize($file));
	print file_get_contents($file);
	exit;
}

unlink($graph_file);
unlink($err_graph_file);

graph($seconds, $graph_file);
graph_err($seconds, $err_graph_file);

$dc = $_GET['_dc'];

print <<< EOF
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
	<head>
		<title>Last $time</title>
	</head>
	<body>
		<img src="data/stats.php?img=1&amp;time=$time&amp;_dc=$dc" /><br />
		<img src="data/stats.php?img=1&amp;err=1&amp;time=$time&amp;_dc=$dc" />
	</body>
</html>
EOF;
