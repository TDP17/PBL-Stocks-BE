/**
 * @todo Make dataHandler run everyday at 9pm ist
 * This file is the brain of the project. 
 * It handles the following 
     * Upload data to the database
     * Update data in fundsData file on a daily basis
 */

import fundsData from '../data/fundsData.js';
import Fund from '../models/Fund.js';

const dataHandler = () => {
    fundsData.forEach(async fund => {
        try {
            const fundEntry = await Fund.findOne({ where: { id: fund.id } });
            if (fundEntry) {
                if (fundEntry.price !== fund.price)
                    fundEntry.price = fund.price;
                return;
            }
            await Fund.create(fund);
        } catch (error) {
            console.log(error);
        }
    })
}

dataHandler();