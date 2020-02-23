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
		
		const posSpace = typed.indexOf(" ");
		const firstPiece = typed.substring(0,posSpace + 1);
		const secondPiece = typed.substring(posSpace + 1,typed.length);		
		
		try {
			
			if (typed.startsWith('search')) {	

				const q = secondPiece;						
				const options = { cx, q, auth: googleApiKey };
				const result = await customsearch.cse.list(options);				
				for (var i = 0; i < result.data.items.length; i++) {
					var r = result.data.items[i];
					const searchData = r.snippet + "\n" + r.link + "\n\n";
					twiml.message(`${searchData}`)
				}
				res.set('Content-Type', 'text/xml');				
				return res.status(200).send(twiml.toString());
			
			} else if (typed.startsWith('price')) {			
	
				const symbol = secondPiece;
				yahooStockPrices.getCurrentPrice(symbol, function(err, price){						
					twiml.message(`The latest action stock price for '${symbol}' is US$ ${price}.`);	
					res.set('Content-Type', 'text/xml');
					return res.status(200).send(twiml.toString());
				  });		
				
			} else {
				
				const result = "Invalid option!!!" +
									"You should type the following options:\n" +
									"- price [which stock ticker symbol of company]\n" + 
									"- search [which word you would like to search]\n" +
									"More information at https://github.com/ehpessoa";
				twiml.message(`${result}`);	
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
