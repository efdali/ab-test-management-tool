import { useEffect, useState } from 'react';

function getCookie(name = '_gaexp', url) {
  url = tab[0].url;
  chrome?.cookies?.get({ name, url }, function (cookie) {
    variationId = cookie.value;
  });
  return value;
}

function CookieProvider({ component: Component }) {
  const [url, setUrl] = useState('');
  const [variationId, setVariationId] = useState('');
  const [isInTest, setIsInTest] = useState('');

  useEffect(() => {
    chrome?.tabs?.query({ active: true }, function (tab) {
      setUrl(tab[0].url);
    });
  }, []);

  useEffect(() => {
    if (!url) {
      return;
    }

    setVariationId(getCookie());
    const isInTest = getCookie('hypeab');
    setIsInTest(!!isInTest);
  }, [url]);

  return <Component url={url} variationId={variationId} isInTest={isInTest} />;
}

export default CookieProvider;
