import Taro from '@tarojs/taro';
import { IOptions } from './types';

export function getCanvas(selector: string): Promise<Taro.Canvas | HTMLCanvasElement> {
  return new Promise(resolve => {
    if (process.env.TARO_ENV === 'h5') {
      resolve(document.querySelector(`${selector} canvas`) as HTMLCanvasElement);
    } else {
      const query = Taro.createSelectorQuery();
      query
        .select(selector)
        .fields({ node: true, size: false })
        .exec(res => {
          resolve(res[0] && res[0].node);
        });
    }
  });
}

export function getImage(
  canvas: Taro.Canvas | HTMLCanvasElement,
  filePath: string,
): Promise<Taro.Image | HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = process.env.TARO_ENV === 'h5' ? new Image() : (canvas as Taro.Canvas).createImage();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject();
    };
    img.src = filePath;
  });
}

export function mergeOptions(options: Partial<IOptions>): IOptions {
  const sysInfo = Taro.getSystemInfoSync();
  return {
    canvasHeight: options.canvasHeight || 150,
    canvasWidth: options.canvasWidth || sysInfo.windowWidth,
    height: options.height || 22,
    imgWidth: options.imgWidth || 15,
    maxRow: options.maxRow || 3,
    rowGap: options.rowGap || 20,
    imgTextGap: options.imgTextGap || 6,
    bgColor: options.bgColor === null ? null : options.bgColor || 'rgba(0,0,0,0.4)',
    dpr: options.dpr || sysInfo.pixelRatio,
    color: options.color || 'white',
    font: options.font || '12px arial',
    firstRowTop: options.firstRowTop || 22,
  };
}
