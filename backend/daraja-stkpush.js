const axios = require('axios');

const darajaApi = axios.create({
  baseURL: 'https://sandbox.safaricom.co.ke',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get OAuth 2.0 Access Token
 */
async function getAccessToken() {
  try {
    const consumerKey = process.env.DARAJA_CONSUMER_KEY;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      throw new Error('Daraja consumer key or secret is not defined in .env');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await darajaApi.get('/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to get Daraja access token');
  }
}

/**
 * Initiate STK Push (Lipa Na M-Pesa Online)
 * @param {string} phoneNumber - Phone number in format 254XXXXXXXXX
 * @param {number} amount - Amount to pay
 * @param {string} accountReference - Meter number
 * @returns {Promise<Object>} STK Push response
 */
async function initiateSTKPush(phoneNumber, amount, accountReference) {
  try {
    console.log('[STK Push] Step 1: Getting access token...');
    const accessToken = await getAccessToken();
    console.log('[STK Push] Step 2: Access token obtained');

    const businessShortCode = process.env.DARAJA_SHORTCODE || '174379';
    const passkey = process.env.DARAJA_PASSKEY;
    const callbackUrl = process.env.DARAJA_CALLBACK_URL;

    if (!passkey) {
      throw new Error('DARAJA_PASSKEY not set in .env');
    }

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    // Generate password: Base64(Shortcode + Passkey + Timestamp)
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: `Electricity recharge for meter ${accountReference}`,
    };

    console.log('[STK Push] Step 3: Sending STK Push request...');
    console.log('[STK Push] Payload:', JSON.stringify({ ...payload, Password: '***' }, null, 2));

    const response = await darajaApi.post('/mpesa/stkpush/v1/processrequest', payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('[STK Push] Step 4: Response received:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('[STK Push] Error:', error.message);
    if (error.response) {
      console.error('[STK Push] Response status:', error.response.status);
      console.error('[STK Push] Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to initiate STK Push: ${error.message}`);
  }
}

module.exports = {
  getAccessToken,
  initiateSTKPush,
};
