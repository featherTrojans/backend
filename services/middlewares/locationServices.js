const { config } = require("../../config");
const { Location, LocationHistory, Status } = require("../../models");
const { distanceService } = require("./googleServices");
const {logger, Op} = config;

exports.createLocation = async (data) => {
    try{
        const check = await Location.findOne({where: {userUid: data.userId}});
        if (!check) {

            await Location.create({

                userUid: data.userId,
                longitude: data.longitude,
                latitude: data.latitude,
                locationText: data.locationText
            })
            await LocationHistory.create({

                userUid: data.userId,
                longitude: data.longitude,
                latitude: data.latitude,
                locationText: data.locationText
            })
        } else {

            await Location.update({
                longitude: data.longitude,
                latitude: data.latitude,
                locationText: data.locationText
            }, {where: {userUid: data.userId}})

            await LocationHistory.create({

                userUid: data.userId,
                longitude: data.longitude,
                latitude: data.latitude,
                locationText: data.locationText
            })
        }

    }catch(error) {
        logger.info(error);
        return false
    }

}


exports.returnLocation = async (data) => {
    try {
        const destinations = []
        const results = []
        let allStatuses = await Status.findAll({
            attributes: ['username', 'fullName', 'longitude', 'latitude', 'locationText', 'amount', 'reference'],
            where: {
            status: 'ACTIVE', 
            amount: {
                [Op.gte]: data.amount
            },
            username: {
                [Op.not]: data.username
            }
        }}) //get statuses

        if ( allStatuses.length > 0 ) {
            // logger.info(allStatuses)
            for (const [key, value] of Object.entries(allStatuses)){

                // logger.info(value.locationText)   
                destinations.push(value.locationText)

            }
            const distance = await distanceService({origin: [data.location], destinations})

            if (distance === false) {

                logger.info('distance cannot be fetched')
                return false;

            }else {
                for (const [key, value] of Object.entries(distance)) {
                    logger.info(value.distance.value)
                    allStatuses[key].duration = value.duration.text
                    if ( value.distance.value <= 10000){
                        logger.info(allStatuses[key])
                        results.push(allStatuses[key]);
                    }

                }

                // logger.info(results.length)
                logger.info(results)
                return  results
            }


        } else{
        logger.info(allStatuses)
            return false;
        }

    } catch(error) {
        logger.info(error)
        logger.debug(error);
        return false
    }

}
// this.returnLocation({amount: 1000, location: {lat: 6.7, lng: 8.9}});