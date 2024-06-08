import { fetch } from 'wix-fetch';
import { authentication } from 'wix-members-frontend';
import wixData from 'wix-data';
import { openLightbox } from 'wix-window';

const promptsUrl = 'https://raw.githubusercontent.com/matthewvilaysack/CS278/main/prompts.txt';

async function loadPrompts() {
    const response = await fetch(promptsUrl);
    const text = await response.text();
    return text.split('\n');
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function displayPrompts(prompts) {
    try {
        if (prompts.length < 3) {
            throw new Error('Not enough prompts in the file');
        }
        $w('#Section1ListItem1Title1').text = prompts[0];
        $w('#Section1ListItem2Title1').text = prompts[1];
        $w('#Section1ListItem3Title1').text = prompts[2];
    } catch (error) {
        console.error(error.message);
    }
}

async function updatePromptsInDatabase() {
    const prompts = await loadPrompts();
    const shuffledPrompts = shuffle(prompts);

    const existingPrompts = await wixData.query('PromptsCollection').limit(1).find();

    if (existingPrompts && existingPrompts.items && existingPrompts.items.length > 0) {
        let item = existingPrompts.items[0];
        item.currentPrompts = shuffledPrompts;
        await wixData.update('PromptsCollection', item);
    } else {
        await wixData.insert('PromptsCollection', { currentPrompts: shuffledPrompts});
    }

    await sendNotificationsToUsers('Prompts have been updated. Check out the new prompts!');
}

async function getPromptsFromDatabase() {
    const promptsData = await wixData.query('PromptsCollection').limit(1).find();

    if (promptsData && promptsData.items && promptsData.items.length > 0 && promptsData.items[0].currentPrompts) {
        return promptsData.items[0].currentPrompts;
    } else {
        return [];
    }
}
// Flag for prompt updates
let isUpdating = false;

export async function changePrompts() {
    if (isUpdating) return;
    isUpdating = true;

    try {
        await updatePromptsInDatabase();
        const prompts = await getPromptsFromDatabase();
        await displayPrompts(prompts);
    } catch (error) {
        console.error(error);
    } finally {
        isUpdating = false;
    }
}
async function sendNotificationsToUsers(message) {
    try {
        const membersQuery = await wixData.query("Members/PrivateMembersData").find();
        if (membersQuery.items.length > 0) {
            const notifications = membersQuery.items.map(member => ({
                isPublic: true,
                isRead: false,
                type: 'Prompt Update',
                message: message,
                userId: member._id
            }));
            await wixData.bulkInsert('Notifications', notifications);
            console.log('Notifications inserted successfully');
        }
    } catch (error) {
        console.error('Failed to send notifications:', error);
    }
}
function displayWelcome(loggedIn) {
    if (loggedIn) {
        $w("#Section1RegularMediaImage1RuleNoFaceImage").collapse();
    } else {
        $w("#Section1RegularMediaImage1RuleNoFaceImage").expand();
    }
}
$w.onReady(async function () {
    console.log('onReady function called'); 

    const prompts = await getPromptsFromDatabase();
    await displayPrompts(prompts);

    const isLoggedIn = await authentication.loggedIn();
    displayWelcome(isLoggedIn);

    authentication.onLogin(() => {
        displayWelcome(true);
    });

    authentication.onLogout(() => {
        displayWelcome(false);
    });

    // every 2 days
    setInterval(async () => {
        await changePrompts();
    }, 1000 * 60 * 60 * 24 * 2); // 2 days
});


export function button4_click(event) {
    const isLoggedIn = authentication.loggedIn();
    if (isLoggedIn) {
        const lightBoxResponse = openLightbox('Make a post');
    } else {
        const lightBoxResponse = openLightbox('Go Login');
    }
}

export function button3_click(event) {
    const isLoggedIn = authentication.loggedIn();
    if (isLoggedIn) {
        const lightBoxResponse = openLightbox('Make a post');
    } else {
        const lightBoxResponse = openLightbox('Go Login');
    } 
}

export function button2_click(event) {
    const isLoggedIn = authentication.loggedIn();
    if (isLoggedIn) {
        const lightBoxResponse = openLightbox('Make a post');
    } else {
        const lightBoxResponse = openLightbox('Go Login');
    }
}