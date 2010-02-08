<?php

global $config;

$config = array(
	'db' => array(
		'default' => array(
			'type' => 'postgres',
			'host' => 'localhost',
			'name' => 'mail',
			'user' => 'mail',
			'pass' => 'replace with db password'
		),
		'logs' => array(
			'type' => 'postgres',
			'host' => 'localhost',
			'name' => 'rsyslog',
			'user' => 'mail',
			'pass' => 'replace with db password'
		)
	),
	'cookie' => array(
		'lifetime' => 0,
		'name'     => 'RubixConsultingPostfixWeb',
		'host'     => 'replace with hostname',
		'secure'   => TRUE
	),
	'page' => array(
		'title'   => 'Rubix Consulting, Inc. Mail User Portal',
		'path'    => '/postfixweb/',
		'google_analytics' => array(
			'enabled' => TRUE,
			'code'    => 'replace with google code'
		)
	),
	'encryption' => array(
		'key' => 'replace with a random password'
	),
	'webmail' => array(
		'enabled' => TRUE
	),
	'stats' => array(
		'enabled' => TRUE,
		'mailgraph' => array(
			'enabled'   => TRUE,
			'rrd'       => '/var/lib/mailgraph/mailgraph.rrd',
			'rrd_virus' => '/var/lib/mailgraph/mailgraph_virus.rrd',
			'tmp_dir'   => '/var/lib/mailgraph'
		),
		'pflogsumm' => array(
			'enabled' => TRUE,
			'dir'     => '/var/lib/pflogsumm'
		)
	),
	'logs' => array(
		'enabled' => TRUE
	)
);
