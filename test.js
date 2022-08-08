require("dotenv").config();

const textOutreach = require("./src/textOutreach");
const numTextContacts = require("./src/numTextContacts");

const AirtableApi = require("./src/Airtable");
const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);
const HighlevelApi = require("./src/HighLevel");

const _ = require("./src/Helpers");

(async () => {
    try {
        const arr = [1, 2, 3, 4, 5];

        const hasDuplicates = (array) => new Set(array).size !== array.length;

        console.log(hasDuplicates(arr));
    } catch (error) {
        console.log(error);
    }
})();
