// 获取 figma 图片
// eslint-disable-next-line @typescript-eslint/no-explicit-any
chrome.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
  const action = message.action;
  if (action === 'GET_FIGMA_IMAGE') {
    const file_ids = message.file_ids;
    const file_key = message.file_key;
    const file_token = message.file_token;
    getFigmaS3Url(file_token, file_key, file_ids)
      .then((images) => {
        sendResponse(images);
      })
      .catch((err) => {
        console.error(err);
        sendResponse(null);
      });
  }

  return true;
});

const get_figma_image_api = 'https://api.figma.com/v1/images/';

function figmaFetch(url, init) {
  return fetch(url, init).then((resp) => resp.json());
}

async function getFigmaS3Url(file_token: string, file_key: string, file_ids: string) {
  const rawData = await figmaFetch(
    `${get_figma_image_api}${file_key}?ids=${file_ids}&use_absolute_bounds=true`,
    {
      method: 'get',
      headers: {
        'X-FIGMA-TOKEN': file_token,
      },
    }
  );

  const figmaS3Images = rawData?.images ?? {};

  return figmaS3Images;
}
