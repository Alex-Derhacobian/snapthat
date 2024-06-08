import wixData from 'wix-data';
import { openLightbox } from 'wix-window';
import { authentication } from 'wix-members-frontend';
let filteredResults = [];
function displayAllImages() {
    wixData.query("UserImagePosts")
        .find()
        .then(results => {
            if (results.items.length > 0) {
                const galleryItems = results.items.map(item => ({
                    _id: item._id,
                    type: "image",
                    title: item.Title,
                    src: item.Image,
                    description: item.Caption 
                }));
                $w("#gallery5").items = galleryItems;
                filteredResults = results.items; 
                console.log(results);
            } else {
                $w("#gallery5").items = [];
                filteredResults = [];
                console.log("No images found in the database");
            }
        })
        .catch(error => {
            console.error("Error querying images:", error);
        });
}
async function filterImages(tags) {
    const galleryItems = [];
    const allResults = [];
    for (const tag of tags) {
        if (tag) {
            try {
                const results = await wixData.query("UserImagePosts")
                    .contains("Title", tag)
                    .find();
                if (results.items.length > 0) {
                    results.items.forEach(item => {
                        console.log(item)
                        const galleryItem = {
                            _id: item._id,
                            type: "image",
                            title: item.Title,
                            src: item.image,
                            description: item.Caption 
                        };
                        galleryItems.push(galleryItem);
                        allResults.push(item);
                    });
                    console.log("adding items to gallery");
                    console.log($w("#gallery5").items);
                    console.log(galleryItems);
                    $w('#gallery5').items = galleryItems;
                } else {
                    console.log(`No matching images found for tag: ${tag}`);
                }
            } catch (error) {
                console.error("Error querying images:", error);
            }
        }
    }

    if (galleryItems.length > 0) {
        $w("#gallery5").items = galleryItems;
        filteredResults = allResults; 
        console.log("Gallery updated with matching images");
    } else {
        $w("#gallery5").items = [];
        filteredResults = [];
        console.log("No matching images found");
    }
}
$w.onReady(function () {
    displayAllImages();
    $w("#selectionTags1").onClick(async function () {
        const tags = $w("#selectionTags1").value;
        if (tags.length > 0) {
            await filterImages(tags);
        } else {
            displayAllImages();
        }
    });
    $w("#gallery5").onItemClicked(async (event) => {
        const isLoggedIn = authentication.loggedIn();
        if (isLoggedIn) {
            try {
                const matchedItem = filteredResults[event.itemIndex];
                if (matchedItem) {
                    const dataToSend = {
                        imageSource: matchedItem.image,
                        itemId: matchedItem._id
                    };
                    const lightBoxResponse = await openLightbox('Like/Comment', dataToSend);
                } else {
                    console.error("No matching item found for the clicked image");
                }
            } catch (error) {
                console.error("Error finding item by image source:", error);
            }
        } else {
           const lightBoxResponse = await openLightbox('Go Login');
        }
    });
});
