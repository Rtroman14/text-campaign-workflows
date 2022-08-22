require("dotenv").config();

const moment = require("moment");

const textOutreach = require("./src/textOutreach");
const numTextContacts = require("./src/numTextContacts");

const AirtableApi = require("./src/Airtable");
const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const _ = require("./src/Helpers");

const slackNotification = require("./src/slackNotification");

const today = moment(new Date()).format("MM/DD/YYYY");

const numContacts = 10;

(async () => {
    try {
        const getCampaigns = await Airtable.getCampaigns();

        let accountCampaigns = getCampaigns.slice(0, 20);

        for (let i = 0; i <= numContacts; i++) {
            const campaign = accountCampaigns.shift();

            console.log(`${campaign.Account} - ${campaign.Campaign}`);

            accountCampaigns.push(campaign);
        }

        console.log("\n----------- TEXT -----------\n");
    } catch (error) {
        console.log(error);
    }
})();
