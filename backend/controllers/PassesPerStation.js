const funcs = require('./../utilities/functions');
const pool = require('./../config/db');
const moment = require('moment');

module.exports = async (req, res) => {
    const { stationID, dateFrom, dateTo } = req.params;
    const dateTimeNow = funcs.getRequestTimestamp();

    if (
        !moment(dateFrom, 'YYYY-MM-DD HH:mm:ss', true).isValid() ||
        !moment(dateFrom, 'YYYY-MM-DD HH:mm:ss', true).isValid()
    ) {
        return res.status(400).json({ message: 'Bad request: Invalid date formats' });
    }

    if (moment(dateFrom, 'YYYY-MM-DD HH:mm:ss', true).diff(dateTo, 'YYYY-MM-DD HH:mm:ss', true) >= 0) {
        return res.status(400).json({
            message: 'Bad request: dateFrom should be smaller than dateTo'
        });
    }

    // Fetch operator name query
    const operatorQuery = `SELECT op_name FROM stations WHERE st_id = ?`;

    // Fetch Pass List query
    const passesListQuery = `
            SELECT p.pass_id as PassID, p.pass_timestamp as PassTimeStamp,
            t.vehicle_id as VehicleID, t.tag_provider as TagProvider,
            CASE
                WHEN t.tag_provider = ? THEN "home"
                ELSE "away"
            END as PassType,
            p.pass_charge as PassCharge
            FROM passes p JOIN tags t ON (p.tag_id = t.tag_id)
            WHERE p.station_id = ? AND p.pass_timestamp BETWEEN ? AND ?
            ORDER BY p.pass_timestamp ASC`;

    try {
        const connection = await pool.getConnection();
        const operatorQueryRes = await connection.query(operatorQuery, [stationID]);

        if (!operatorQueryRes[0][0]) {
            return res.status(404).json({ message: 'Bad request: Invalid stationID' });
        }

        const operatorID = operatorQueryRes[0][0].op_name;

        let queryResult = await connection.query(passesListQuery, [operatorID, stationID, dateFrom, dateTo]);

        // Parse result as JS object, compute total length, append PassIndex field
        let queryResultList = JSON.parse(JSON.stringify(queryResult));
        let i = 0;
        queryResultList[0].forEach((pass) => (pass.PassIndex = ++i));

        res.status(200).json({
            Station: stationID,
            StationOperator: operatorID,
            RequestTimestamp: dateTimeNow,
            PeriodFrom: dateFrom,
            PeriodTo: dateTo,
            NumberOfPasses: i,
            PassesList: queryResultList[0]
        });
    } catch {
        res.status(500).json({ message: 'Internal server error' });
    }
};
