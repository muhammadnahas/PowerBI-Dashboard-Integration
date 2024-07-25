const express = require('express');
const msal = require('@azure/msal-node');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const tenantId = process.env.TENANT_ID;
const authority = `https://login.microsoftonline.com/${tenantId}`;
const scope = 'https://analysis.windows.net/powerbi/api/.default';

const msalConfig = {
  auth: {
    clientId: clientId,
    authority: authority,
    clientSecret: clientSecret,
  },
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

app.post('/get-embed-token', async (req, res) => {
  const { reportId, datasetId, userEmail } = req.body;

  try {
    const authResponse = await cca.acquireTokenByClientCredential({
      scopes: [scope],
    });

    const accessToken = authResponse.accessToken;

    const embedTokenRequest = {
      reports: [{ id: reportId }],
      datasets: [{ id: datasetId }],
      identities: [{
        username: userEmail,
        roles: ['User'],
        datasets: [datasetId]
      }]
    };

    const response = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/GenerateToken`,
      embedTokenRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ embedToken: response.data.token });
  } catch (error) {
    console.error('Error generating embed token:', error.response ? error.response.data : error.message);
    res.status(500).send('Failed to generate embed token');
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

 