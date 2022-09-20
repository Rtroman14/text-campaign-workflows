require("dotenv").config();

const moment = require("moment");

const textOutreach = require("./src/textOutreach");
const numTextContacts = require("./src/numTextContacts");

const AirtableApi = require("./src/Airtable");
const Airtable = new AirtableApi(process.env.AIRTABLE_API_KEY);

const _ = require("./src/Helpers");

const slackNotification = require("./src/slackNotification");

const today = moment(new Date()).format("MM/DD/YYYY");

const RUN_FACILITIES = false;

const NUM_CONTACTS = RUN_FACILITIES ? 20 : 60;

(async () => {
    try {
        const getCampaigns = await Airtable.getCampaigns();
        let accounts = _.accountsToRun(getCampaigns);

        // * remove these clients/accounts
        // accounts = accounts.filter(
        //     (acc) =>
        //         acc.Client !== "SIRC" &&
        //         acc.Client !== "Built Right Roofing" &&
        //         acc.Client !== "HD Roofing" &&
        //         acc.Client !== "All Elements" &&
        //         acc.Client !== "Dr. Roof" &&
        //         acc.Client !== "Greentek" &&
        //         acc.Client !== "Integrity Pro Roofing" &&
        //         acc.Client !== "Pinnacle Roofing Group" &&
        //         acc.Client !== "SCS Construction" &&
        //         acc.Client !== "Stone Roofing" &&
        //         acc.Account !== "Farha Roofing - Lamar" &&
        //         acc.Client !== "Level Edge Construction"
        // );

        // * keep these clients/accounts
        // accounts = accounts.filter(
        //     (acc) =>
        //         // acc.Client === "SCS Construction" ||
        //         // acc.Client === "HD Roofing" ||
        //         // acc.Client === "Integrity Pro Roofing" ||
        //         // acc.Account === "Cannon Roofing"
        // );

        if (RUN_FACILITIES) {
            // * keep all facilities
            accounts = accounts.filter(
                (acc) => acc.Tag?.includes("facilities") || acc.Tag?.includes("property-management")
            );
        } else {
            // * remove all facilities
            accounts = accounts.filter(
                (acc) =>
                    !acc.Tag?.includes("facilities") && !acc.Tag?.includes("property-management")
            );
        }
        await slackNotification("Launching texts...");

        for (let i = 1; i <= NUM_CONTACTS; i++) {
            const arrayTextOutreach = accounts.map((account) => textOutreach(account));

            const results = await Promise.all(arrayTextOutreach);

            // * check to see if client texted same prospect twice
            const textedProspects = results
                .filter((res) => res?.status === "Live")
                .map((res) => `${res.Client} - ${res.texted}`);

            const textedSameProspect = _.hasDuplicates(textedProspects);
            if (textedSameProspect) {
                await slackNotification("TEXTED SAME PROSPECT MULTIPLE TIMES!!");
                throw new Error("\nTEXTED SAME PROSPECT!!");
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

            // if (i === NUM_CONTACTS) {
            //     const arrayNumContacts = accounts.map((account) => numTextContacts(account));

            //     const numContactResults = await Promise.all(arrayNumContacts);

            //     for (let result of numContactResults) {
            //         await Airtable.updateCampaign(result.recordID, {
            //             "Campaign Status": "Live",
            //             "Contacts Left": result.NUM_CONTACTS.length,
            //             "Last Updated": today,
            //         });

            //         if (result.NUM_CONTACTS.length <= 150) {
            //             await slackNotification(
            //                 `\n*Account:* ${result.Account}\n*Campaign:* ${result.Campaign} \n*Number of contacts:* ${result.NUM_CONTACTS.length}\n`
            //             );
            //         }
            //     }
            // }

            console.log(`\n --- Texts sent: ${i} / ${String(NUM_CONTACTS)} --- \n`);
            await _.minutesWait(2);
        }
    } catch (error) {
        console.log(error);
    }
})();
