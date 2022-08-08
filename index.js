require("dotenv").config();

const moment = require("moment");

const textOutreach = require("./src/textOutreach");
const numTextContacts = require("./src/numTextContacts");

const AirtableApi = require("./src/Airtable");
const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const _ = require("./src/Helpers");

const slackNotification = require("./src/slackNotification");

const today = moment(new Date()).format("MM/DD/YYYY");

const numContacts = 60 - 10;

(async () => {
    try {
        const getCampaigns = await Airtable.getCampaigns();
        let accounts = _.accountsToRun(getCampaigns);

        // accounts = accounts.filter(
        //     (acc) =>
        //         acc.Account === "Hawkeye Flat Roof Solutions" ||
        //         acc.Account === "All Elements" ||
        //         acc.Account === "Beckwith Commercial Roofing" ||
        //         acc.Account === "Blue Springs Commercial" ||
        //         acc.Account === "Central Oregon Roofing" ||
        //         acc.Account === "Dorothy Gale Roofing Group" ||
        //         acc.Account === "Eco Tec - Josh" ||
        //         acc.Account === "Eco Tec - David" ||
        //         acc.Account === "Harrison Roofing" ||
        //         acc.Account === "Integrity Pro Roofing" ||
        //         acc.Account === "Pitts Roofing" ||
        //         acc.Account === "Pete's Builders" ||
        //         acc.Account === "SIRC" ||
        //         acc.Account === "Pro Roof Solutions" ||
        //         acc.Account === "Premier Building Associates" ||
        //         acc.Account === "SCS Construction" ||
        //         acc.Account === "SouthShore Roofing & Exteriors"
        // );

        await slackNotification("Launching texts...");

        for (let i = 1; i <= numContacts; i++) {
            const arrayTextOutreach = accounts.map((account) => textOutreach(account));

            const results = await Promise.all(arrayTextOutreach);

            // * check to see if client texted same prospect twice
            const textedProspects = results
                .filter((res) => res?.status === "Live")
                .map((res) => `${res.Client} - ${res.texted}`);

            const textedSameProspect = _.hasDuplicates(textedProspects);
            if (textedSameProspect) {
                new Error("TEXTED SAME PROSPECT!!");
                console.log(
                    "Check logs. One of our clients texted the same prospect multiple times. This is most likely because a filter wasn't set in Airtable."
                );
            }

            for (let result of results) {
                if (result?.status === "Need More Contacts") {
                    if (i > 2) {
                        await Airtable.updateCampaign(result.recordID, {
                            "Campaign Status": result.status,
                            "Last Updated": today,
                            "Contacts Left": 0,
                        });
                    } else {
                        await Airtable.updateCampaign(result.recordID, {
                            "Campaign Status": result.status,
                            "Contacts Left": 0,
                        });
                    }

                    // remove account from list
                    accounts = accounts.filter(
                        (currentAccount) => currentAccount.Account !== result.Account
                    );
                }
            }

            if (i === numContacts) {
                const arrayNumContacts = accounts.map((account) => numTextContacts(account));

                const numContactResults = await Promise.all(arrayNumContacts);

                for (let result of numContactResults) {
                    await Airtable.updateCampaign(result.recordID, {
                        "Campaign Status": "Live",
                        "Contacts Left": result.numContacts.length,
                        "Last Updated": today,
                    });

                    if (result.numContacts.length <= 150) {
                        await slackNotification(
                            `\n*Account:* ${result.Account}\n*Campaign:* ${result.Campaign} \n*Number of contacts:* ${result.numContacts.length}\n`
                        );
                    }
                }
            }

            console.log(`\n --- Texts sent: ${i} --- \n`);
            await _.minutesWait(2);
        }
    } catch (error) {
        console.log(error);
    }
})();
