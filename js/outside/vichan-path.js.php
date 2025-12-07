<?php

/**
 * js/outside/vichan-path.js.php
 *
 * - vichan外からvichan内のリソースを扱うためにvichanのリモートホスト名
 *   (ドメイン名)とパス名を提供する.
 */

chdir('../../'); // to vichan root directory.
require_once 'inc/bootstrap.php';

header('Content-type: text/javascript');

echo '
/**
 * js/outside/vichan-path.js.php
 *
 * - 利用側jsでは次の例のように使うこと.
 *   window.VichanPath = window.VichanPath || [];
 *   window.VichanPath.push(function(vichan) { console.log(vichan.host, vichan.pathname); });
 */

window.VichanPath = window.VichanPath || [];

window.VichanPath.vichan = '.json_encode(array(
	// ex. 'localhost:1234'
	'host' => $_SERVER['HTTP_HOST'],
	// ex. '/path/to/vichan/'
	'pathname' => dirname($_SERVER['REQUEST_URI'], 3) . '/',
	// default: '%s/'
	'board_path' => $config['board_path'],
	'dir' => array(
		// default: 'src/'
		'img' => $config['dir']['img'],
		// default: 'thumb/'
		'thumb' => $config['dir']['thumb'],
		// default: 'res/'
		'res' => $config['dir']['res']
	),
	// default: '%d.html'
	'file_page' => $config['file_page'],
	// default: 'png'
	'thumb_ext' => $config['thumb_ext'],
	// default: 255; For resizing, maximum thumbnail dimensions.
	'thumb_width' => $config['thumb_width'],
	'thumb_height' => $config['thumb_height'],
	'thumb_op_width' => $config['thumb_op_width'],
	'thumb_op_height' => $config['thumb_op_height']
)).';

';

echo file_get_contents('js/outside/_vichan-path.js');
