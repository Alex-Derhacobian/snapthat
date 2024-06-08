import wixUsers from 'wix-users';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { openLightbox } from 'wix-window';

$w.onReady(() => {
    let user = wixUsers.currentUser;

    // Check if the user is logged in and show/hide like buttons accordingly
    if (user.loggedIn) {
        // Initialize the repeater
        $w('#repeater1').onItemReady(async ($item, itemData, index) => {
            $item('#like').show();
            $item('#contentLiked').hide();
            // Check if the item is already liked by the user
            let results = await wixData.query('Likes')
                .eq('userId', user.id)
                .eq('likedContent', itemData._id)
                .find();

            if (results.items.length > 0) {
                $item('#like').hide();
                $item('#contentLiked').show();
            }

            // Event handler for like button click
            $item('#like').onClick(async () => {
                await wixData.insert('Likes', { userId: user.id, likedContent: itemData._id });
                $item('#contentLiked').show();
                $item('#like').hide();
            });

            // Event handler for unlike button click
            $item('#contentLiked').onClick(async () => {
                results = await wixData.query('Likes')
                    .eq('userId', user.id)
                    .eq('likedContent', itemData._id)
                    .find();

                if (results.items.length > 0) {
                    await wixData.remove('Likes', results.items[0]._id);
                    $item('#contentLiked').hide();
                    $item('#like').show();
                }
            });
        });
    } else {
        $w('#like').show();
        $w('#contentLiked').hide();
    }
});
