const { elevation } = require("@googlemaps/google-maps-services-js/dist/elevation");
const { config } = require("../../config");
const {client, google_key, logger} = config;


exports.distanceService =  (data) => {
    try {
        client
        .distancematrix({
          params: {
            origins: data.origin,
            destinations: data.destinations,
            key: google_key,
          },
          timeout: 1000, // milliseconds
        })
        .then((r) => {
            logger.info(r.data);
            return (r.data.rows[0].elements);
        })
        .catch((e) => {
          logger.info(e.response.data.error_message);
          return false;
        });
    } catch (err) {
        logger.info(err);
        return false
    }

}

// this.distanceService({origin: ["Oluyole, Ibadan"], destinations: ['Eleyele, Ibadan', 'Akobo, Ibadan', 'Dugbe, Ibadan']}); 