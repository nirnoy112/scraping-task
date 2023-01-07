import axios from 'axios';
import cheerio from 'cheerio';
import Excel from 'exceljs';

const initialPageUrl =
    'https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/od-2014/q-actros?search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at%3Adesc';

const loadPage = async (url) => {
    try {
        const response = await axios.get(url);
        const htmlData = response.data;
        return cheerio.load(htmlData);
    } catch (error) {
        console.log(error.message);
    }
};

const getNextPageUrl = ($, currentPageUrl) => {
    let nextPageUrl = null;
    const nextPageLinkElement = $('li').filter(
        (index, element) =>
            $(element).attr('title') === 'Next Page' &&
            $(element).attr('aria-disabled') === 'false'
    );
    if (nextPageLinkElement.length > 0) {
        if (currentPageUrl.split('&page=').length === 1) {
            nextPageUrl = currentPageUrl + '&page=2';
        } else {
            nextPageUrl =
                currentPageUrl.split('&page=')[0] +
                '&page=' +
                (parseInt(currentPageUrl.split('&page=')[1]) + 1);
        }
    }
    return nextPageUrl;
};

const addItems = ($) => {
    const items = [];
    const itemContainers = $('.ooa-1hab6wx article');
    itemContainers.each((i, elem) => {
        const id = $(elem).attr('id');
        const url = $(elem).find('a').attr('href');
        items.push({
            id,
            url,
        });
    });
    return items;
};

const getTotalAdsCount = ($) => {
    const itemContainers = $('.ooa-1hab6wx article');
    return itemContainers.length;
};

const scrapeTruckItem = async (url) => {
    try {
        const response = await axios.get(url);
        const htmlData = response.data;
        const $ = cheerio.load(htmlData);
        const adIdSpans = $('#ad_id');
        const adId = $(adIdSpans[0]).text();
        const titleSpans = $('.offer-title');
        const adTitle = $(titleSpans[0]).text().trim();
        const priceCurrencySpans = $('.offer-price__currency');
        const priceCurrency = $(priceCurrencySpans[0]).text().trim();
        const priceValueSpans = $('.offer-price');
        const priceValue = $(priceValueSpans[0]).attr('data-price').trim();
        const offerParams = $('.offer-params__item');
        const truckInfo = {};
        offerParams.each((index, elem) => {
            const offerParamTitle = $(elem).find('.offer-params__label').text();
            const offerParamValue = $(elem).find('.offer-params__value').text();
            truckInfo[offerParamTitle] = offerParamValue.trim();
        });
        return {
            url: url,
            id: adId,
            title: adTitle,
            price: `${priceValue} ${priceCurrency}`,
            registrationDate:
                truckInfo['Pierwsza rejestracja'] || 'Not Provided',
            yearOfProduction: truckInfo['Rok produkcji'] || 'Not provided',
            mileage: truckInfo['Przebieg'] || 'Not Provided',
            power: truckInfo['Moc'] || 'Not Provided',
        };
    } catch (error) {
        throw new Error(error);
    }
};

const scrapeAllAdsInConsole = async () => {
    let currentPageUrl = initialPageUrl,
        nextPageUrl,
        $;
    while (currentPageUrl) {
        console.log('Sraping Page: ' + currentPageUrl);
        $ = await loadPage(currentPageUrl);
        console.log(`Number Of Total Ads In This Page: ${getTotalAdsCount($)}`);
        const items = addItems($);
        for (let index = 0; index < items.length; index++) {
            const { url } = items[index];
            try {
                console.log(`Scraping Item From URL: ${url}`);
                const itemInfo = await scrapeTruckItem(url);
                console.log(itemInfo);
            } catch (error) {
                console.log(error.message);
            }
        }
        nextPageUrl = getNextPageUrl($, currentPageUrl);
        currentPageUrl = nextPageUrl;
    }
};

const scrapeAllAdsInExcelFile = async (filePath) => {
    let currentPageUrl = initialPageUrl,
        nextPageUrl,
        $;
    const itemsInfo = [];
    while (currentPageUrl) {
        console.log('Sraping Page: ' + currentPageUrl);
        $ = await loadPage(currentPageUrl);
        console.log(`Number Of Total Ads In This Page: ${getTotalAdsCount($)}`);
        const items = addItems($);
        for (let index = 0; index < items.length; index++) {
            const { url } = items[index];
            try {
                console.log(`Scraping Item From URL: ${url}`);
                const itemInfo = await scrapeTruckItem(url);
                itemsInfo.push(itemInfo);
            } catch (error) {
                console.log(error.message);
            }
        }
        nextPageUrl = getNextPageUrl($, currentPageUrl);
        currentPageUrl = nextPageUrl;
    }

    // Saving The Scraped Data In An Excel File
    console.log('Starting To Save The Scraped Data In An Excel File...');
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
    worksheet.addRow([
        'URL',
        'ID',
        'Title',
        'Price',
        'Year Of Production',
        'Registration Date',
        'Mileage',
        'Power',
    ]);
    worksheet.addRows(
        itemsInfo.map(
            ({
                url,
                id,
                title,
                price,
                registrationDate,
                yearOfProduction,
                mileage,
                power,
            }) => [
                url,
                id,
                title,
                price,
                yearOfProduction,
                registrationDate,
                mileage,
                power,
            ]
        )
    );
    await workbook.xlsx.writeFile(filePath);
    console.log(
        `Saving The Scraped Data In An Excel File (${filePath}) Is Finished!`
    );
};

console.log('STARTING TO SCRAP...');
// Scrape All Ads And See The Scraped Data In The Console - To do this please comment the following line out.
//await scrapeAllAdsInConsole();
// Scrape All Ads And Save The Scraped Data In An Excel File - To do this please comment the following line out.
await scrapeAllAdsInExcelFile('scrappedData/TrucksInfo.xlsx');
console.log('SCRAPING FINISHED!');
