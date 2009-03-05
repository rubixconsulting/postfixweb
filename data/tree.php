<?php

include_once('../lib/config.inc.php');
include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireLogin();

$tree = array(
	array(
		'text' => 'User Information',
		'id'   => 'user-info',
		'leaf' => TRUE
	)
);

if($config['webmail']['enabled']) {
	$tree[] = array(
		'text' => 'Webmail',
		'id'   => 'webmail',
		'leaf' => TRUE
	);
}

$tree[] = array(
	'text' => 'Your Settings',
	'id'   => 'your-settings',
	'children' => array(
		array(
			'text' => 'Password',
			'id'   => 'change-password',
			'leaf' => TRUE
		),
		array(
			'text' => 'Forwards',
			'id'   => 'forwards',
			'leaf' => TRUE
		),
		array(
			'text' => 'Name',
			'id'   => 'name',
			'leaf' => TRUE
#		),
## TODO investigate how to do auto replies
#		array(
#			'text' => 'Auto Reply',
#			'id'   => 'auto-reply',
#			'leaf' => TRUE
		)
	)
);

$siteAdministration   = array();
$domainAdministration = array();

$siteAdministration[] = array(
	'text' => 'Domains',
	'id'   => 'manage-domains',
	'leaf' => TRUE
);

$domainAdministration[] = array(
	'text' => 'Users',
	'id'   => 'manage-users',
	'leaf' => TRUE
);

$domainAdministration[] = array(
	'text' => 'User Forwards',
	'id'   => 'manage-forwards',
	'leaf' => TRUE
);

$domainAdministration[] = array(
	'text' => 'Aliases',
	'id'   => 'manage-aliases',
	'leaf' => TRUE
);

$domainAdministration[] = array(
	'text' => 'Catch All Forwards',
	'id'   => 'catchall-addresses',
	'leaf' => TRUE
);

$domainAdministration[] = array(
	'text' => 'Domain Administrators',
	'id'   => 'manage-domain-permissions',
	'leaf' => TRUE
);

$siteAdministration[] = array(
	'text' => 'Site Administrators',
	'id'   => 'manage-site-administrators',
	'leaf' => TRUE
);

$siteAdministration[] = array(
	'text' => 'Virtual to Local Forwards',
	'id'   => 'manage-local-forwards',
	'leaf' => TRUE
);

$siteAdministration[] = array(
	'text' => 'Local Aliases',
	'id'   => 'manage-local-aliases',
	'leaf' => TRUE
);

if(isDomainAdmin()) {
	$tree[] = array(
		'text'     => 'Domain Administration',
		'id'       => 'domain-administration',
		'children' => $domainAdministration
	);
}

if(isSiteAdmin()) {
	$tree[] = array(
		'text'     => 'Site Administration',
		'id'       => 'site-administration',
		'children' => $siteAdministration
	);
	$stats = array();
	if($config['stats']['pflogsumm']['enabled']) {
		$stats[] = array(
			'text' => 'Log Summary',
			'id'   => 'log-summary',
			'leaf' => TRUE
		);
	}
	if($config['stats']['mailgraph']['enabled']) {
		$stats[] = array(
			'text' => 'Graphs',
			'id'   => 'graphs',
			'children' => array(
				array(
					'text' => 'Last Day',
					'id'   => 'last-day-stats',
					'leaf' => TRUE
				),
				array(
					'text' => 'Last Week',
					'id'   => 'last-week-stats',
					'leaf' => TRUE
				),
				array(
					'text' => 'Last Month',
					'id'   => 'last-month-stats',
					'leaf' => TRUE
				),
				array(
					'text' => 'Last Year',
					'id'   => 'last-year-stats',
					'leaf' => TRUE
				)
			)
		);
	}
	if($config['stats']['enabled']) {
		$tree[] = array(
			'text'     => 'Mail Server Stats',
			'id'       => 'server-stats',
			'children' => $stats
		);
	}
	if($config['logs']['enabled']) {
		$tree[] = array(
			'text' => 'Mail Server Log',
			'id'   => 'mail-log',
			'leaf' => TRUE
		);
	}
}

print json_encode($tree)."\n";
