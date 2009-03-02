<?php

include_once('../lib/config.inc.php');
include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireLogin();

session_destroy();
setcookie($config['cookie']['name'], "", time() - 3600, $config['page']['path'], $config['cookie']['host'], TRUE, TRUE);
