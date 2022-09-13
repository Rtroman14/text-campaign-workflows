require("dotenv").config();

const moment = require("moment");

const textOutreach = require("./src/textOutreach");
const numTextContacts = require("./src/numTextContacts");

const AirtableApi = require("./src/Airtable");
const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const _ = require("./src/Helpers");

const slackNotification = require("./src/slackNotification");

const today = moment(new Date()).format("MM/DD/YYYY");

const numContacts = 60;

(async () => {
    try {
        const getCampaigns = await Airtable.getCampaigns();
        let accounts = _.accountsToRun(getCampaigns);

        console.log(accounts);
    } catch (error) {
        console.log(error);
    }
})();
