const { config } = require("../../config");
const {client, google_key, logger} = config;


exports.distanceService =  async (data) => {
    try {
       const result =  await client
        .distancematrix({
          params: {
            origins: data.origin,
            destinations: data.destinations,
            key: google_key,
          },
          timeout: 3000, // seconds
        });
        // logger.info(result.data);
        return (result.data.rows[0].elements);
    } catch (err) {
        logger.info(err);
        return false
    }

}

// this.distanceService({origin: ["Oluyole, Ibadan"], destinations: ['Eleyele, Ibadan', 'Akobo, Ibadan', 'Dugbe, Ibadan']}); 