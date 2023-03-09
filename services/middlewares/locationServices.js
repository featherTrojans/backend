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
            // locationText: {
            //     [Op.substring]: `${data.location}`
            // },
            status: 'ACTIVE',
            amount: {
                [Op.gte]: data.amount
            },
            username: {
                [Op.not]: data.username
            },
        },
        order: [['createdAt', 'DESC']],
        limit: 24
        }) //get statuses
        
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
                    // logger.info(value.distance.value)
                    // console.log(typeof value.duration == 'undefined')
                    if (typeof value.duration == 'undefined') {
                        continue;
                    } else {
                        
                        allStatuses[key].duration = value.duration.text
                        if ( value.distance.value <= 1000000){
                            logger.info(allStatuses[key].dataValues)
                            results.push(allStatuses[key].dataValues);
                        }else{
                            continue
                        }
                    }
                    

                }

                // logger.info(results.length)
                // logger.info(results)
                // use slice() to copy the array and not just make a reference
                let sortByDuration = results.slice(0);
                sortByDuration.sort(function(a,b) {

                    let aArray = a.duration.split(" ")
                    let bArray = b.duration.split(" ");

                    let aValue = aArray.length > 2 ? parseInt(aArray[0] * 60) + parseInt(aArray[2]) : aArray[0]

                    let bValue = bArray.length > 2 ? parseInt(bArray[0] * 60)  + parseInt(bArray[2]) : bArray[0]

                    return aValue - bValue;
                });
                // console.log(results);
                // console.log(sortByDuration[0]);
                return  data.old ? sortByDuration : sortByDuration[0]
            }


        } else{
        logger.info('no status found')
            return false;
        }

    } catch(error) {
        logger.info(error)
        logger.debug(error);
        return false
    }

}
// this.returnLocation({amount: 1000, location: {lat: 6.7, lng: 8.9}});