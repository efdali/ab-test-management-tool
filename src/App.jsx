import React, { useState, useEffect, useCallback } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [expCookie, setExpCookie] = useState('');
  const [cookieDomain, setCookieDomain] = useState('');
  const [variationTestId, setVariationTestId] = useState('');
  const [userInTest, setUserInTest] = useState(false);

  useEffect(() => {
    chrome?.tabs?.query({ active: true }, function (tab) {
      setUrl(tab[0].url);
    });
  }, []);

  const changeExpState = useCallback((cookie) => {
    setExpCookie(cookie.value);
    setCookieDomain(cookie.domain);
    setVariationTestId(cookie.value.slice(-1));
  }, []);

  const reloadPage = () => {
    chrome?.browsingData?.removeCache({}, function () {});
    chrome.tabs.reload();
  };

  useEffect(() => {
    if (!url) {
      return;
    }

    chrome?.cookies?.get({ url, name: '_gaexp' }, function (cookie) {
      changeExpState(cookie);
    });

    chrome?.cookies?.get({ url, name: 'hypeab' }, function (cookie) {
      setUserInTest(!!cookie);
    });

    chrome.cookies.onChanged.addListener(function ({ cookie, removed }) {
      if (cookie.name === 'hypeab') {
        setUserInTest(!removed);
      } else if (cookie.name === '_gaexp') {
        changeExpState(cookie);
      }
    });
  }, [url]);

  const changeVariationNumber = useCallback(
    (e) => {
      e.preventDefault();
      chrome?.cookies?.set(
        {
          name: '_gaexp',
          value: expCookie.substr(0, expCookie.length - 1) + variationTestId,
          domain: cookieDomain,
          url,
        },
        function () {
          reloadPage();
        }
      );
    },
    [expCookie, variationTestId, cookieDomain]
  );

  const enterTestHandler = useCallback(() => {
    chrome?.cookies?.set(
      {
        name: 'hypeab',
        value: 'true',
        domain: cookieDomain,
        url,
      },
      function () {
        reloadPage();
      }
    );
  }, [cookieDomain, url]);

  const exitTestHandler = useCallback(() => {
    chrome?.cookies?.remove(
      {
        name: 'hypeab',
        storeId: '0',
        url,
      },
      function () {
        reloadPage();
      }
    );
  }, [cookieDomain, url]);

  return (
    <div className="app">
      <h1>AB Test Management Tool</h1>
      <div className="info-area">
        <div className="info">
          <span className="label">URL</span>
          <span>{url}</span>
        </div>
        <div className="info">
          <span className="label">Test ID</span>
          <span>{expCookie}</span>
        </div>
      </div>
      <form onSubmit={changeVariationNumber}>
        <span className="label">Variation</span>
        <div className="row">
          <input
            placeholder="0"
            value={variationTestId}
            onChange={({ target }) => setVariationTestId(target.value)}
            type="number"
          />
          <button type="submit">Change Variation</button>
        </div>
      </form>
      <div className="button-container">
        {userInTest ? (
          <button onClick={exitTestHandler}>Exit Test</button>
        ) : (
          <button onClick={enterTestHandler}>Enter Test</button>
        )}
        <button onClick={reloadPage}>Clear Cache</button>
      </div>
    </div>
  );
}

export default App;
