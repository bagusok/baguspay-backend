const { createHash } = require('crypto');

const testPaydisiniCallback = async (refId) => {
  const apikey = '1282579c91397d5a71bd0be5690ea279';

  const signature = createHash('md5')
    .update(`${apikey}${refId}CallbackStatus`)
    .digest('hex');

  //   console.log(signature);

  const res = await fetch('http://localhost:3001/callback/paydisini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: 'RANDOMK3Y',
      pay_id: 'INI PAY ID DARI PROVIDer',
      unique_code: refId,
      status: 'Success',
      signature: signature,
    }),
  });

  try {
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  testPaydisiniCallback('1715495105579252DE1CB66D7E3D4');
})();
