const axios = require('axios');
const fs = require('fs');

module.exports = async () => {
    try {
        if (!fs.existsSync('.token')) return console.log('Please log in first.');
        const token = fs.readFileSync('.token', 'utf8');

        if (token.length === 0) return console.log('Please log in first.');

        const resetPasses = await axios({
            url: 'https://localhost:9103/interoperability/api/admin/resetpasses',
            method: 'post',
            headers: {
                'X-OBSERVATORY-AUTH': token
            },
            httpsAgent: new require('https').Agent({ rejectUnauthorized: false })
        });

        console.log(resetPasses.data.status);
    } catch (error) {
        if (error.response && error.response.status && error.response.data) {
            return console.log(error.response.status, error.response.data);
        }
        console.log('Could not hit API');
    }
};
