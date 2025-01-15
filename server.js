const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function getUsdtBalance(address) {
    try {
        console.log(`Fetching USDT balance for address: ${address}`);
        const usdtResponse = await axios.get(`https://tonapi.io/v2/accounts/${address}/jettons`);
        const usdtBalance = usdtResponse.data.find(jetton => jetton.symbol === 'USDT');
        return usdtBalance ? usdtBalance.balance : 0;
    } catch (error) {
        console.error('Error fetching USDT balance:', error.response ? error.response.data : error.message);
        return 0;
    }
}

app.get('/account-status/:address', async (req, res) => {
    const address = req.params.address;

    try {
        console.log(`Fetching account data for address: ${address}`);
        const accountResponse = await axios.get(`https://tonapi.io/v2/accounts/${address}`);

        if (accountResponse.data) {
            const accountData = accountResponse.data;
            const usdtBalance = await getUsdtBalance(address);

            return res.json({
                success: true,
                status: accountData.status,
                balance: accountData.balance,
                usdtBalance: usdtBalance,
                lastTransaction: accountData.last_transaction
            });
        } else {
            return res.json({
                success: false,
                message: 'Account not found.'
            });
        }
    } catch (error) {
        console.error('Error fetching account data:', error.response ? error.response.data : error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});