import wixUsers from 'wix-users';
import wixData from 'wix-data';
import wixLocation from 'wix-location';

function getQueryParameter(param) {
  const query = wixLocation.query;
  return query[param];
}

async function fetchLikes(user) {
  try {
    let results = await wixData.query('Likes')
      .eq('userId', user.id)
      .find();
    $w("#repeater1").data = results.items;
    if (results.items.length === 0) {
      $w("#repeater1").data = [];
    }
  } catch (error) {
    console.error("Error fetching likes:", error);
  }
}

async function onReady() {
  let user = wixUsers.currentUser;
  if (user.loggedIn) {
    await fetchLikes(user);
    console.log("repeater data", $w("#repeater1").data);

    $w("#repeater1").onItemReady(($item, itemData) => {
      console.log("Binding click event for item:", itemData);
      $item("#liked").onClick(async () => {
        try {
          let queryResult = await wixData.query('Likes')
            .eq('userId', user.id)
            .eq('likedContent', itemData.likedContent) 
            .find();
          if (queryResult.items.length > 0) {
            let likeId = queryResult.items[0]._id;
            await wixData.remove('Likes', likeId);
            console.log("Like removed:", likeId);
            await fetchLikes(user); 
          }
        } catch (error) {
          console.error("Error removing like:", error);
        }
      });
    });

  } else {
    $w("#repeater1").hide();
  }
}

$w.onReady(onReady);
