import wixData from 'wix-data';
import { currentMember } from 'wix-members';
import wixLocation from 'wix-location';

$w.onReady(function () {
    $w('#noNotificationsText').hide();
    $w('#repeater4').collapse();

    checkUserLoginStatus();

    // Repeater item click event
    $w('#repeater4').onItemReady(($item, itemData) => {
        $item('#notificationText').text = itemData.message;
        $item('#timestamp').text = new Date(itemData._createdDate).toLocaleString();

        $item('#container1').onClick(async () => {
            console.log("Notification clicked, marking as read:", itemData._id);
            await markAsRead(itemData._id);
            // Refresh the page after marking the notification as read
            if (itemData.type == 'Prompt Update') {
                wixLocation.to(wixLocation.url);
            }
            else {
                wixLocation.to("https://annien23.wixsite.com/snapthat/Gallery");
            }
        });
    });
});

async function checkUserLoginStatus() {
    try {
        const member = await currentMember.getMember();
        if (member) {
            await fetchAndDisplayNotifications(member._id);
        } else {
            $w('#noNotificationsText').text = "Please log in to view notifications.";
            $w('#noNotificationsText').show();
        }
    } catch (error) {
        console.error("Error checking member status:", error);
        $w('#noNotificationsText').text = "Error checking member status.";
        $w('#noNotificationsText').show();
    }
}

async function fetchAndDisplayNotifications(userId) {
    try {
        const results = await wixData.query('Notifications')
            .eq('userId', userId)
            .descending('_createdDate')
            .find();
        if (results.items.length > 0) {
            $w('#repeater4').data = results.items;
            const unreadNotifications = results.items.filter(item => !item.isRead);

            if (unreadNotifications.length === 0) {
                $w('#noNotificationsText').show();
            } else {
                $w('#noNotificationsText').hide();
            }
            $w('#repeater4').expand();
        } else {
            $w('#noNotificationsText').show();
            $w('#repeater4').data = [];
            $w('#repeater4').collapse();
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
}

async function markAsRead(notificationId) {
    try {
        const oldNotification = await wixData.get('Notifications', notificationId);
        if (oldNotification) {
            // Update the notification's isRead property
            const updatedNotification = await wixData.update('Notifications', {
                _id: notificationId,
                isRead: true,
                type: oldNotification.type,
                message: oldNotification.message,
                userId: oldNotification.userId
            });
            if (updatedNotification.isRead) {
                console.log("Successfully marked as read: ", notificationId);
            } else {
                console.error("Failed to mark as read: ", notificationId);
            }
        } else {
            console.error("Notification not found in marked read: ", notificationId);
        }
    } catch (error) {
        console.error("Error for notification read: ", error);
    }
}
