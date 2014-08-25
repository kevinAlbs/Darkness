<?php
if(isset($_REQUEST['name'])){
	$name = $_REQUEST['name'];
	$name = preg_replace("/[^a-zA-Z0-9]/", "", $name);
	if(strlen($name) > 8){
		$name = substr($name, 0, 8);
	}
	$f = fopen("names.csv", "a");
	fwrite($f, "," . $name);
	fclose($f);
} else if(isset($_REQUEST['get'])){
	$names = file_get_contents("names.csv");
	if(!$names){
		echo "kevinalbs";
	}
	$name_arr = explode(",", $names);
	shuffle($name_arr);
	if(count($name_arr) > 10){
		echo implode(",", array_slice($name_arr, 0, 10));
	} else {
		echo implode(",", $name_arr);
	}

}