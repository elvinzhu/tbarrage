import Taro from '@tarojs/taro';

export function getCanvas(selector: string): Promise<Taro.Canvas | HTMLCanvasElement> {
  return new Promise(resolve => {
    if (process.env.TARO_ENV === 'h5') {
      resolve(document.querySelector(selector) as HTMLCanvasElement);
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
