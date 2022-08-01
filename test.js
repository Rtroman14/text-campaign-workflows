require("dotenv").config();

const moment = require("moment");

const textOutreach = require("./src/textOutreach");
const numTextContacts = require("./src/numTextContacts");

const AirtableApi = require("./src/Airtable");
const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const _ = require("./src/Helpers");

const slackNotification = require("./src/slackNotification");

const HighlevelApi = require("./src/HighLevel");
const Highlevel = new HighlevelApi("d5b6c354-ceef-42f7-be82-7ba781b32024");

const today = moment(new Date()).format("MM/DD/YYYY");

const numContacts = 60;

(async () => {
    try {
        const contact = await Airtable.getContact("app1BLhbl2zNvxsTR", "Text");

        let highLevelContact = _.mapContact(contact);

        const companyField = await Highlevel.getCustomeFields("Company");

        if (companyField && "Company Name" in contact) {
            highLevelContact = {
                ...highLevelContact,
                customField: { [companyField.id]: contact["Company Name"] },
            };
        }

        console.log(highLevelContact);
        // const contact = await Airtable.getContact("app7bKOfNcj8BmqAC", "Text - facilities");

        // let highLevelContact = _.mapContact(contact);

        // const companyField = await Highlevel.getCustomeFields("Company");

        // if (companyField && "Company Name" in contact) {
        //     highLevelContact = {
        //         ...highLevelContact,
        //         customField: { [companyField.id]: contact["Company Name"] },
        //     };
        // }

        // console.log(highLevelContact);
    } catch (error) {
        console.log(error);
    }
})();
