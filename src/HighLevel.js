require("dotenv").config();

const axios = require("axios");

module.exports = class Highlevel {
    constructor(token) {
        this.token = token;
    }

    getConfig(method, url, data) {
        try {
            if (data) {
                return {
                    method,
                    url,
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                    data,
                };
            }
            return {
                method,
                url,
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            };
        } catch (error) {
            console.log("ERROR CONFIG ---", error);
        }
    }

    async createContact(contact) {
        try {
            const config = this.getConfig(
                "post",
                "https://rest.gohighlevel.com/v1/contacts/",
                contact
            );

            const { data } = await axios(config);

            return data.contact;
        } catch (error) {
            console.log("ERROR CREATECONTACT ---", error);
            return false;
        }
    }

    async addToCampaign(contactID, campaignID) {
        try {
            const config = this.getConfig(
                "post",
                `https://rest.gohighlevel.com/v1/contacts/${contactID}/campaigns/${campaignID}`
            );

            const res = await axios(config);
            return res;
        } catch (error) {
            console.log("ERROR ADDTOCAMPAIGN ---", error.message);
        }
    }

    async addToWorkflow(contactID, workflowID) {
        try {
            const config = this.getConfig(
                "post",
                `https://rest.gohighlevel.com/v1/contacts/${contactID}/workflow/${workflowID}`
            );

            const res = await axios(config);

            return res;
        } catch (error) {
            console.log("ERROR -- addToWorkflow() --", error.message);
            return false;
        }
    }

    async textContact(contactData, campaignID) {
        try {
            const contact = await this.createContact(contactData);

            const res = await this.addToWorkflow(contact.id, campaignID);

            return { ...contact, ...res };
        } catch (error) {
            console.log("ERROR -- textContact() --", error.message);
            return {
                status: "400",
            };
        }
    }

    async getCustomeFields(name) {
        try {
            const config = this.getConfig("get", "https://rest.gohighlevel.com/v1/custom-fields/");

            const { data } = await axios(config);

            const customField = data.customFields.find((field) => field.name === name);

            if (customField) {
                return customField;
            }

            return false;
        } catch (error) {
            // console.log("ERROR GETCUSTOMEFIELDS ---", error);
            return false;
        }
    }
};
