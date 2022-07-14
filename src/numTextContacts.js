require("dotenv").config();

const AirtableApi = require("./Airtable");

const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

module.exports = async (account) => {
    try {
        let view = "Text";

        if ("Tag" in account) {
            view = `Text - ${account.Tag}`;
        }

        let numContacts = Airtable.getContacts(account["Base ID"], view);

        return { ...account, numContacts };
    } catch (error) {
        console.log(error);
    }
};
