import { google } from 'googleapis';
import dotenv from 'dotenv';
import twilio from 'twilio';
import yahooStockPrices from '../libraries/yahoo-stock-prices';

dotenv.config();

const {
  SID: accountSid,
  KEY: TwilloAuthToken,
  APIKEY: googleApiKey,
  CX: cx
} = process.env;

twilio(accountSid, TwilloAuthToken);
const { MessagingResponse } = twilio.twiml;
const customsearch = google.customsearch('v1');

/**
 * @class WhatsappBot
 * @description class will implement bot functionality
 */
class WhatsappBot {
	
	
  /**
   * @memberof WhatsappBot
   * @param {object} req - Request sent to the route
   * @param {object} res - Response sent from the controller
   * @param {object} next - Error handler
   * @returns {object} - object representing response message
   */
	static async serviceRoute(req, res, next) {		
			
		const twiml = new MessagingResponse();
		const typed = req.body.Body.toLowerCase();
		
		try {
			
			if (typed.startsWith('price')) {			
	
				const arr = typed.split(" ");
				const symbol = arr[1];						
				//var yahooStockPrices = require('yahoo-stock-prices');
				
				yahooStockPrices.getCurrentPrice(symbol, function(err, price){						
					twiml.message(`The latest action stock price for '${symbol}' é US$ ${price}. More information at https://github.com/ehpessoa`);	
					res.set('Content-Type', 'text/xml');
					return res.status(200).send(twiml.toString());
				  });		
				
			} else {
				
				twiml.message(`Invalid option! You typed '${typed}'. Please, type: 'price [ticker]' and get the latest action stock price. More information at https://github.com/ehpessoa`);	
				res.set('Content-Type', 'text/xml');
				return res.status(200).send(twiml.toString());

			}			
			
		} catch (error) {
		  console.log(`error: ${error}`);
		  return next(error);
		}	
		
	}
  
}

export default WhatsappBot;
