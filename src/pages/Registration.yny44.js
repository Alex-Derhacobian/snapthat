// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction

import wixUsers from 'wix-users';
import wixLocation from 'wix-location';

$w.onReady(function () {

	// Write your Javascript code here using the Velo framework API

	// Print hello world:
	// console.log("Hello world!");

	// Call functions on page elements, e.g.:
	// $w("#button1").label = "Click me!";

	// Click "Run", or Preview your site, to execute your code

	$w('#registerButton').onClick( function (){
		let email = $w('#registerEmail').value;
		let password = $w('#registerPassword').value;
		wixUsers.register(email, password)
		.then(() => {
			wixLocation.to('/blank-1');
		})
	})
});