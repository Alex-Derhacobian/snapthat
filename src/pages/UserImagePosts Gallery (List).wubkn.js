// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixUsers from 'wix-users';
import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady( () => {

	// Write your Javascript code here using the Velo framework API

	// Print hello world:
	// console.log("Hello world!");

	// Call functions on page elements, e.g.:
	// $w("#button1").label = "Click me!";

	// Click "Run", or Preview your site, to execute your code

	if(wixUsers.currentUser.loggedIn) {
		$w("#like").show();
	} 
	else {
		$w("#like").show();
	} 
	} );

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function like_click(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	wixData.insert('Likes', {likedContent: $w('#UserImagePosts').getCurrentItem()._id}),
	$w('#contentLiked').show(),
	$w('#like').hide();	
}