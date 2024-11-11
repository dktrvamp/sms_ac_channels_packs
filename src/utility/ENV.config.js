import beta_sms from "../api/beta.sms.channels";
import prod_sms from "../api/prod.sms.channels";

const ENV_CONFIG = {
	PRODUCTION: {
		NAME: 'PRODUCTION',
		MAGENTO_HOST: 'https://www.slingcommerce.com/graphql',
		SMS_CHANNELS: prod_sms,
	},
	BETA: {
		NAME: 'BETA',
		MAGENTO_HOST: 'https://b.slingcommerce.com/graphql',
		SMS_CHANNELS: beta_sms,
	}
};

	export default ENV_CONFIG;