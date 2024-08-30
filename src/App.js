import React, { useState, useEffect } from 'react';
import FacebookLogin from '@greatsumini/react-facebook-login';

const App = () => {
  const [userData, setUserData] = useState({});
  const [pageData, setPageData] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (userData.accessToken) {
      fetchPages(userData.accessToken);
    }
  }, [userData]);

  const responseFacebook = (response) => {
    console.log(response);
    if (response.accessToken) {
      setUserData({
        name: response.name,
        picture: response.picture.data.url,
        accessToken: response.accessToken
      });
    } else {
      console.error("Failed to authenticate with Facebook");
    }
  };

  const fetchPages = async (accessToken) => {
    try {
      const response = await fetch(`https://graph.facebook.com/me/accounts?access_token=${accessToken}`);
      const data = await response.json();
      if (data.error) {
        console.error("Error fetching pages:", data.error.message);
      } else {
        setPageData(data.data);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const fetchPageInsights = async (pageId) => {
    const accessToken = userData.accessToken;
    try {
      const response = await fetch(`https://graph.facebook.com/${pageId}/insights?metric=page_fans,page_engaged_users,page_impressions,page_actions_post_reactions_total&since=2024-01-01&until=2024-12-31&period=day&access_token=${accessToken}`);
      const data = await response.json();
      if (data.error) {
        console.error("Error fetching insights:", data.error.message);
      } else {
        const insightsData = data.data.reduce((acc, item) => {
          acc[item.name] = item.values[0].value;
          return acc;
        }, {});
        setInsights(insightsData);
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
    }
  };

  const handlePageSelect = (e) => {
    setSelectedPage(e.target.value);
    fetchPageInsights(e.target.value);
  };

  return (
    <div className="App">
      {!userData.name ? (
        <FacebookLogin
          appId="YOUR_APP_ID"
          onSuccess={responseFacebook}
          onFail={responseFacebook}
        />
      ) : (
        <div>
          <h2>Welcome, {userData.name}</h2>
          <img src={userData.picture} alt="Profile" />
          <h3>Select a Page to View Insights</h3>
          <select onChange={handlePageSelect} value={selectedPage}>
            <option value="">Select a page</option>
            {pageData.map((page) => (
              <option key={page.id} value={page.id}>
                {page.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {insights && (
        <div>
          <h3>Page Insights</h3>
          <p>Total Followers: {insights.page_fans || 'N/A'}</p>
          <p>Total Engagement: {insights.page_engaged_users || 'N/A'}</p>
          <p>Total Impressions: {insights.page_impressions || 'N/A'}</p>
          <p>Total Reactions: {insights.page_actions_post_reactions_total || 'N/A'}</p>
        </div>
      )}
    </div>
  );
};

export default App;

