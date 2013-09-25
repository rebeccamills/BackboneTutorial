<?php

  $post_statement = json_decode($GLOBALS['HTTP_RAW_POST_DATA']);

  $query = $post_statement->query; 

  $apikey = 'sgrfykg5tt5cyj7kahhyyb8t';

  if($query != ""){
    $q = urlencode($query); // make sure to url encode an query parameters
  }
  else {
    $q = urlencode('Toy Story'); // make sure to url encode an query parameters
  }

  // construct the query with our apikey and the query we want to make
  $endpoint = 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=' . $apikey . '&q=' . $q;

  // setup curl to make a call to the endpoint
  $session = curl_init($endpoint);

  // indicates that we want the response back
  curl_setopt($session, CURLOPT_RETURNTRANSFER, true);

  // exec curl and get the data back
  $data = curl_exec($session);

  // remember to close the curl session once we are finished retrieveing the data
  curl_close($session);

  // decode the json data to make it easier to parse the php
  // actually, just spit out this JSON!
  echo ($data);

?>
