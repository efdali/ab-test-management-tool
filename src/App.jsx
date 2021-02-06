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
    <div className="App">
      <h1>
        AB Test Variations Tool - <span>{url}</span> - <b>{expCookie}</b>
      </h1>
      <form onSubmit={changeVariationNumber}>
        <input placeholder="Test Id" type="hidden" />
        <input
          placeholder="Variation Number"
          value={variationTestId}
          onChange={({ target }) => setVariationTestId(target.value)}
        />
        <button type="submit">Change Variation</button>
      </form>
      <hr />
      {userInTest ? (
        <button onClick={exitTestHandler}>Exit Test</button>
      ) : (
        <button onClick={enterTestHandler}>Enter Test</button>
      )}

      <button onClick={reloadPage}>Clear Cache</button>
    </div>
  );
}

export default App;
