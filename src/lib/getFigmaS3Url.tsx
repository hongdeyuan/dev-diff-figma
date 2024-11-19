import { GET_FIGMA_IMAGE_API } from '../components/Reviewer';

export function figmaFetch(url, init) {
  return fetch(url, init).then((resp) => resp.json());
}

function getNodeIdFromUrl(url: string) {
  const regex = new RegExp('[?&]' + 'node-id' + '(=([^&#]*)|&|#|$)');
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1].replace(/=/g, '');
  }

  return '';
}

function getFileKeyFromUrl(url: string) {
  const fileKeyReg = /\/([^?]+)/;
  const matchStrArray = (url.match(fileKeyReg)?.[0] ?? '').split('/');
  const fileKey = matchStrArray?.[matchStrArray.length - 2] ?? '';
  return fileKey;
}

export async function getFigmaS3Url(figma_token: string, figmaUrl: string) {
  const fileKey = getFileKeyFromUrl(figmaUrl);
  const fileIds = getNodeIdFromUrl(figmaUrl);

  const rawData = await figmaFetch(
    `${GET_FIGMA_IMAGE_API}${fileKey}?ids=${fileIds}&use_absolute_bounds=true`,
    {
      method: 'get',
      headers: {
        'X-FIGMA-TOKEN': figma_token,
      },
    }
  );

  const figmaS3Images = rawData?.images ?? {};

  return figmaS3Images;
}
