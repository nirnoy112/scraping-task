## About This Project

This is a NodeJS based application to scrape data from OTOMOTO (an automotive advertisement platform) using axios, cheerio and exeljs. The following requirements have been fulfilled:

-   Initial url https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at%3Adesc.
-   Add getNextPageUrl function to iterate over pages.
-   Add addItems function that fetches item urls + item ids (unique ids that the portal uses) from list page.
-   Add getTotalAdsCount function - shows how many total ads exist for the provided initial url.
-   Add scrapeTruckItem function - that scrapes the actual ads and parses into the format: item id, title, price, registration date, production date, mileage, power.
-   Scrape all pages, all ads (Either scrapeAllAdsInConsole or scrapeAllAdsInExcelFile function can be called for this requirement).

## Deploying The Project

-   Clone this git repository.

    git clone https://github.com/nirnoy112/scraping-task.git

-   Go to project directory.

    cd scraping-task

-   Run the following command to install the required dependencies.

    npm install

-   Finally start the project to execute scraping.

    npm start

## Questions/Thoughts

-   Ideas for error catching/solving, retry strategies?

    Basic error catching has been done (though I think it can be improved) so the scraping can be run without any issue even if some URLs respond with 404 or 50X status code. For retry strategies, the missing URLs can be stored to try those on later.

-   Accessing more ads from this link than the limit allows (max 50 pages)?

    The initial url shows only 10 pages of ads, it's within the limit and all pages can be accessed normally so I'm not sure what was meant by this question.

-   What would be essential differences between puppeteer and playwright and which is better?

    Puppeteer and Playwright are both open-source libraries for automating web browsers. They can be used to perform tasks such as testing web pages, taking screenshots, and extracting data from websites. There are a few key differences between Puppeteer and Playwright:

    -   Language support: Puppeteer is written in JavaScript and can be used with Node.js, while Playwright is written in Python and can be used with any Python-based system.
    -   Cross-browser support: Playwright supports multiple web browsers (Chrome, Firefox, and Safari) and can be used to automate all three, while Puppeteer only supports Chrome and Chromium.
    -   Automatic waits: Playwright has built-in support for automatic waiting, which means that it can automatically wait for elements to load or for events to occur before performing an action. Puppeteer does not have this capability, so you will need to manually add waits to your scripts.

    It's not really possible to say which of these tools is "better," as it will depend on your specific needs and preferences. Both Puppeteer and Playwright are powerful tools that can be used to automate web browsers, and either one could be a good choice depending on your use case.

    As it's a NodeJS based application I think I would prefer Puppeteer but if needed or situation demands I'll be ready to make a switch.

-   Other considerations?

    'scrapeAllAdsInConsole' function to scrape all pages and ads shows the scraping process information and data within the console. But saving the data is one of the major goals of scraping so I've wrote a function named 'scrapeAllAdsInExcelFile' which allows to save all the scapped ads information in an excel file that can be passed to the function as a paramenter.
