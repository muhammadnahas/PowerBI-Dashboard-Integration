import React, { useEffect, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import './PowerBIReport.css'

const getUserEmail = () => {

  return 'muhammad.n@cabotsolutions.com';
};

const PowerBIReport = () => {
  const [embedConfig, setEmbedConfig] = useState(null);
  const embedUrl = "https://app.powerbi.com/reportEmbed";
  const userEmail = getUserEmail();

  useEffect(() => {
    async function fetchEmbedToken() {
      const reportId = "c9dec937-c40e-48fb-9a11-3b982f6714bc";
      const datasetId = "d8c0901c-939d-4273-a8f3-5d0b4467bd87";

      const response = await fetch('http://localhost:5000/get-embed-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reportId, datasetId, userEmail })
      });

      if (response.ok) {
        const data = await response.json();
        const embedToken = data.embedToken;

        setEmbedConfig({
          type: 'report',
          id: reportId,
          embedUrl: embedUrl,
          accessToken: embedToken,
          tokenType: models.TokenType.Embed,
          settings: {
            filterPaneEnabled: false,
            navContentPaneEnabled: false
          },
        });
      } else {
        console.error('Failed to fetch embed token');
      }
    }

    fetchEmbedToken();
  }, [embedUrl, userEmail]);

  if (!embedConfig) {
    return <div>Loading...</div>;
  }

  return (
    <div>
    <h2>User : {userEmail}</h2>
      <PowerBIEmbed
        embedConfig={embedConfig}
        cssClassName="powerbiEmbed"
      />
    </div>
  );
};

export default PowerBIReport;
