import Taro from '@tarojs/taro';

export function getCanvas(selector: string): Promise<Taro.Canvas> {
  return new Promise(resolve => {
    const query = Taro.createSelectorQuery();
    query
      .select(selector)
      .fields({ node: true, size: false })
      .exec(res => {
        resolve(res[0] && res[0].node);
      });
  });
}

export function getImage(canvas: Taro.Canvas, filePath: string): Promise<Taro.Image> {
  return new Promise((resolve, reject) => {
    const img = canvas.createImage();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject();
    };
    img.src = filePath;
  });
}
