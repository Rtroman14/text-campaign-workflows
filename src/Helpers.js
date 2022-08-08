const moment = require("moment");
const today = moment(new Date()).format("YYYY-MM-DD");

class Helpers {
    async minutesWait(minutes) {
        return await new Promise((resolve) => {
            setTimeout(resolve, 60000 * minutes);
        });
    }

    liveCampaigns(campaigns) {
        return campaigns.filter((campaign) => {
            if (
                "Campaign Status" in campaign &&
                "Base ID" in campaign &&
                "API Token" in campaign &&
                "Campaign ID" in campaign
            ) {
                if (
                    campaign["Campaign Status"] === "Live" ||
                    campaign["Campaign Status"] === "Need More Contacts"
                ) {
                    return campaign;
                }
            }
        });
    }

    campaignsDueToday(campaigns) {
        return campaigns.filter((campaign) => {
            if (!("Last Updated" in campaign)) {
                return campaign;
            }

            if ("Last Updated" in campaign && moment(campaign["Last Updated"]).isBefore(today)) {
                return campaign;
            }
        });
    }

    campaignsToRun(campaigns) {
        let textCampaigns = [];

        campaigns.forEach((campaign) => {
            // check if client is in textCampaigns
            const isClientPresent = textCampaigns.some(
                (newCampaign) => newCampaign.Client === campaign.Client
            );

            if ("Type" in campaign && campaign.Type === "Specific") {
                return textCampaigns.push(campaign);
            }

            // check if multiple same clients exist in campaigns
            const clientCampaigns = campaigns.filter((obj) => {
                if (!("Type" in obj)) {
                    return obj.Client === campaign.Client;
                }
            });

            if (clientCampaigns.length > 1 && !isClientPresent) {
                let clientAdded = false;

                clientCampaigns.some((obj) => {
                    if (!("Last Updated" in obj)) {
                        clientAdded = true;
                        return textCampaigns.push(obj);
                    }
                });

                const [nextCampaign] = clientCampaigns.sort(
                    (a, b) => new Date(a["Last Updated"]) - new Date(b["Last Updated"])
                );

                !clientAdded && textCampaigns.push(nextCampaign);
            }

            if (clientCampaigns.length === 1) {
                textCampaigns.push(campaign);
            }
        });

        return textCampaigns;
    }

    accountsToRun(campaigns) {
        let accounts = [];

        let liveCampaigns = this.liveCampaigns(campaigns);
        let todayCampaigns = this.campaignsDueToday(liveCampaigns);

        todayCampaigns = todayCampaigns.sort(
            (a, b) => new Date(a["Last Updated"]) - new Date(b["Last Updated"])
        );

        for (let todayCampaign of todayCampaigns) {
            if (!("Last Updated" in todayCampaign)) {
                accounts.push(todayCampaign);
            }
        }

        let accountNames = [...new Set(todayCampaigns.map((el) => el.Account))];

        for (let accountName of accountNames) {
            const foundAccount = todayCampaigns.find((el) => el.Account === accountName);

            const accountInAccounts = accounts.find((el) => el.Account === accountName);

            if (!accountInAccounts) {
                accounts.push(foundAccount);
            }
        }

        accounts = this.sortByKeyString(accounts, "Account");

        return accounts;
    }

    campaignsToRunTest(campaigns) {
        let liveCampaigns = this.liveCampaigns(campaigns);
        let todayCampaigns = this.campaignsDueToday(liveCampaigns);

        let accounts = [...new Set(todayCampaigns.map((el) => el.Account))];

        let accountData = [];

        for (let account of accounts) {
            const data = todayCampaigns
                .filter((client) => client.Account === account)
                .sort((a, b) => new Date(a["Last Updated"]) - new Date(b["Last Updated"]));
            accountData.push(data);
        }

        return accountData;
    }

    mapContact(contact) {
        return {
            firstName: contact["First Name"] || "",
            lastName: contact["Last Name"] || "",
            name: `${contact["First Name"]} ${contact["Last Name"]}`,
            email: contact.Email || "",
            phone: contact["Phone Number"] || "",
            address1: contact.Street || "",
            city: contact.City || "",
            state: contact.State || "",
            postalCode: contact.Zip || "",
            customField: {},
        };
    }

    sortByKeyString(array, key) {
        return array.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));
    }

    hasDuplicates = (array) => new Set(array).size !== array.length;
}

module.exports = new Helpers();
