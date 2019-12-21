// It's require at

function loadJs(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onloadend = callback;
  document.head.appendChild(script);
}

var createClient = url => {
  return async data => {
    return new Promise(cb => {
      Axios.post(url, data, {
        headers: { 'content-type': 'application/json' },
      })
        .then(res => {
          if (res.data) {
            return cb(res.data);
          }
          return res;
        })
        .catch(err => cb(err.response ? err.response.data : err));
    });
  };
};
