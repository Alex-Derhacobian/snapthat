import { lightbox, openLightbox } from 'wix-window';
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { authentication } from 'wix-members-frontend';

let currItemId;
let userId = wixUsers.currentUser.id;
let anonymousMap = {};
let nextAnonymousNumber = 0;

$w.onReady(async function () {
    let receivedData = lightbox.getContext();
    console.log("Info received from lightbox: ", receivedData);

    if (receivedData && receivedData.itemId) {
        await loadComments(receivedData.itemId);
        console.log("comments loaded");
        $w('#image1').src = receivedData.imageSource;
        currItemId = receivedData.itemId;

        wixData.query('Likes')
            .eq('likedContent', currItemId)
            .eq('userId', userId)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    $w('#liked').show();
                    $w('#unliked').hide();
                } else {
                    $w('#liked').hide();
                    $w('#unliked').show();
                }
            })
            .catch((err) => {
                console.error("Error querying likes: ", err);
            });
        const isLoggedIn = await authentication.loggedIn();
        displayWelcome(isLoggedIn);
        authentication.onLogin(() => {
            displayWelcome(true);
        });
        authentication.onLogout(() => {
            displayWelcome(false);
        });
        $w('#commentSubmitButton').onClick(() => {
            commentSubmitButton_click(currItemId);
        });
    } else {
        // Reload page if postId doesn't exist yet.
        await openLightbox('Like/Comment', receivedData); 
    }
});

function displayWelcome(loggedIn) {
    if (loggedIn) {
        $w("#commentSubmitBox").enable();
        $w("#commentSubmitButton").enable();
    } else {
        $w("#commentSubmitBox").disable();
        $w("#commentSubmitButton").disable();
    }
}

function formatDate(d) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}
async function sendNotificationsToPoster(message, postId, posterId) {
    try {
        // Query the post to get the owner ID
        const postQuery = await wixData.query("UserImagePosts").eq("_id", postId).find();
        if (postQuery.items.length > 0) {
            const postOwnerId = postQuery.items[0]._owner;
            // Only create notifications for other users (not the original poster) who post on a user's post.
            if (posterId == postOwnerId) {
                return;
            }
            // Query the members to get the member data for the owner
            const memberQuery = await wixData.query("Members/PrivateMembersData").eq("_id", postOwnerId).find();
            if (memberQuery.items.length > 0) {
                const notification = memberQuery.items.map(member => (
                    {
                    isPublic: true,
                    isRead: false,
                    type: 'New Comment',
                    message: message,
                    userId: member._id
                }));
                await wixData.bulkInsert('Notifications', notification);
                console.log('Notification inserted successfully for post owner');
            } else {
                console.error("No member found with the provided owner ID");
            }
        } else {
            console.error("No post found with the provided post ID");
        }
    } catch (error) {
        console.error('Failed to send notifications:', error);
    }
}

export async function commentSubmitButton_click(postId) {
    let commentText = $w('#commentSubmitBox').value;
    if (!commentText) {
        console.error("comment be empty");
        return;
    }
    const Filter = require('bad-words');
    const filter = new Filter();

    if (filter.isProfane(commentText)) {
        console.log("Profane comment, not sumbmitted");
    }
    else {
        const d = new Date();
        const newComment = {
            commentText: String(commentText), 
            createdBy: userId,
            postId: postId,
            createDate: formatDate(d)
        };

        wixData.insert('Comments', newComment)
            .then(() => {
                $w('#commentSubmitBox').value = '';
                sendNotificationsToPoster("New comment on your post!", postId, userId);
                try {
                    loadComments(postId);  
                }
                catch {
                    console.log("error occured loading comments");
                }
            })
            .catch((err) => {
                console.error("Error adding comment: ", err);
            });
    }
}


function mapAnonymousUsers(comments) {
    anonymousMap = {};
    let maxAnonymousNumber = 0;

    // Find the maximum anonymous number already assigned
    comments.forEach(comment => {
        if (comment.createdBy in anonymousMap) {
            const anonNum = anonymousMap[comment.createdBy];
            if (anonNum > maxAnonymousNumber) {
                maxAnonymousNumber = anonNum;
            }
        }
    });

    nextAnonymousNumber = maxAnonymousNumber + 1;
    // Assign anon nums
    comments.forEach(comment => {
        if (!(comment.createdBy in anonymousMap)) {
            anonymousMap[comment.createdBy] = nextAnonymousNumber++;
        }
        comment.anonymousNumber = anonymousMap[comment.createdBy];
    });

}

async function loadComments(postId) {
    let results = await wixData.query('Comments')
        .eq('postId', postId)
        .find();
    mapAnonymousUsers(results.items);
    populateComments(results.items);
}
function populateComments(comments) {
    $w('#commentRepeater').data = comments;
    $w('#commentRepeater').onItemReady(($item, itemData) => {
        $item('#commentText').text = itemData.commentText;
        $item('#username').text = `Anonymous #${itemData.anonymousNumber}`;
        $item('#commentDate').text = itemData.createDate;
    });
}


export function unliked_click(event) {
  console.log("Liked successfully");

  $w('#liked').show();
  $w('#unliked').hide();

  wixData.insert('Likes', { likedContent: currItemId, userId: userId })
    .then(() => {
      console.log("Like inserted successfully");
    })
    .catch((err) => {
      console.error("Error inserting like: ", err);
    });
}

export function liked_click(event) {
  console.log("Unliked successfully");

  $w('#unliked').show();
  $w('#liked').hide();

  wixData.query('Likes')
    .eq('likedContent', currItemId)
    .eq('userId', userId)
    .find()
    .then((results) => {
      if (results.items.length > 0) {
        const likeId = results.items[0]._id;
        wixData.remove('Likes', likeId)
          .then(() => {
            console.log("Like removed successfully");
          })
          .catch((err) => {
            console.error("Error removing like: ", err);
          });
      } else {
        console.log("You haven't liked this content yet.");
      }
    })
    .catch((err) => {
      console.error("Error querying likes: ", err);
    });
}