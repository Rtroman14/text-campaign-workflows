const Airtable = require("airtable");

module.exports = class AirtableApi {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("Using Airtable requires an API key.");
        }

        this.apiKey = apiKey;
    }

    async assignAirtable(baseID) {
        try {
            return new Airtable({ apiKey: this.apiKey }).base(baseID);
        } catch (error) {
            console.log("NO API KEY PROVIDED ---", error);
        }
    }

    async getCampaigns() {
        try {
            const base = await this.assignAirtable("appGB7S9Wknu6MiQb");

            const res = await base("Campaigns").select({ view: "Text - workflow" }).all();

            const campaigns = res.map((campaign) => {
                return {
                    ...campaign.fields,
                    recordID: campaign.getId(),
                };
            });

            return campaigns;
        } catch (error) {
            console.log("ERROR GETCAMPAIGNS() ---", error);
        }
    }

    async updateCampaign(recordID, updatedFields) {
        try {
            const base = await this.assignAirtable("appGB7S9Wknu6MiQb");

            await base("Campaigns").update(recordID, updatedFields);
        } catch (error) {
            console.log("ERROR UPDATECAMPAIGN() ---", error);
        }
    }

    async getContact(baseID, view) {
        try {
            const base = await this.assignAirtable(baseID);

            const res = await base("Prospects").select({ maxRecords: 1, view }).firstPage();

            return res.length > 0 ? { ...res[0].fields, recordID: res[0].getId() } : false;
        } catch (error) {
            console.log("ERROR GETCONTACT() ---", error);
        }
    }

    async getContacts(baseID, view) {
        try {
            const base = await this.assignAirtable(baseID);

            const res = await base("Prospects").select({ view }).all();

            const contacts = res.map((contact) => {
                return {
                    ...contact.fields,
                    recordID: contact.getId(),
                };
            });

            return contacts;
        } catch (error) {
            console.log("ERROR GETCONTACTS() ---", error);
        }
    }

    async updateContact(baseID, recordID, updatedFields) {
        try {
            const base = await this.assignAirtable(baseID);

            await base("Prospects").update(recordID, updatedFields);
        } catch (error) {
            console.log("ERROR UPDATECONTACT() ---", error);
        }
    }

    async findBy(baseID) {
        try {
            const base = await this.assignAirtable(baseID);

            const res = await base("Prospects")
                .select({
                    filterByFormula: `({Email} = "elon7489@elonmgmt.com")`,
                })
                .firstPage();

            const contacts = res.map((contact) => ({
                ...contact.fields,
                recordID: contact.getId(),
            }));

            return contacts.length > 0 ? contacts : false;
        } catch (error) {
            console.log("ERROR GETCONTACTS() ---", error);
        }
    }
};
