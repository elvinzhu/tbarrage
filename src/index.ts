import Taro from '@tarojs/taro';
import { getCanvas, getImage, mergeOptions } from './helper';
import { IRunningItem, IItem, IOptions } from './types';

export default class Barrage {
  selector: string;
  queue: IRunningItem[] = [];
  runnings: IRunningItem[][] = [];
  stoped: Boolean = false;
  canvas: Taro.Canvas | HTMLCanvasElement;
  options: IOptions;
  rafId: number;

  constructor(selector: string, data: IItem[], options: Partial<IOptions> = {}) {
    this.options = mergeOptions(options);
    this.selector = selector;
    if (data) {
      this.push(data);
    }
  }

  async getCanvas() {
    if (!this.canvas) {
      const canvas = await getCanvas(this.selector);
      if (!canvas || !canvas.getContext) {
        throw new Error('未找到canvas，请确保selector传递正确，且canvas正确配置了type属性');
      }
      this.canvas = canvas;
    }
    return this.canvas;
  }

  push(data: IItem[] | IItem) {
    if (Array.isArray(data)) {
      data.forEach(item => this.resolve(item));
    } else {
      this.resolve(data);
    }
  }

  async resolve(item: IItem) {
    const itemData: IRunningItem = {
      txt: item.txt,
      left: 0,
      top: 0,
      speed: 0,
      width: 0,
    };
    const canvas = await this.getCanvas();
    if (item.img) {
      const img = await getImage(canvas, item.img).catch(() => undefined);
      itemData.img = img;
    }
    this.queue.push(itemData);
  }

  async run() {
    this.stoped = false;
    const canvas = await this.getCanvas();
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const runings = this.runnings;
    const { maxRow, rowGap, imgTextGap, dpr, height, canvasHeight, canvasWidth, imgWidth, color, font, firstRowTop } =
      this.options;

    // @ts-ignore
    canvas.width = canvasWidth * dpr;
    // @ts-ignore
    canvas.height = canvasHeight * dpr;

    ctx.imageSmoothingEnabled = true;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.scale(dpr, dpr);

    const addItem = (item: IRunningItem, j: number) => {
      // 同一行，保持相同的速度
      if (runings[j].length) {
        item.speed = runings[j][0].speed;
      } else {
        // 如果是第一项，则给一个速度. (包含2种场景，1. 所有项都移除了屏幕 2. 本行刚刚添加)
        item.speed = Math.floor(Math.random() * 40) / 100;
      }
      item.left = canvasWidth + canvasWidth * Math.random();
      // 行间距
      item.top = j * (rowGap + height) + firstRowTop;
      if (!item.width) {
        item.width = ctx.measureText(item.txt).width + imgWidth + imgTextGap; //  + 头像宽度 + 头像文字间距
      }
      runings[j].push(item);
    };

    let i: number, row: IRunningItem[], rowFirst: IRunningItem, rowLast: IRunningItem;
    let run = () => {
      if (this.stoped) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      // 如果还未超出最大行数，则新开一行
      if (runings.length < maxRow && this.queue.length) {
        runings.push([]);
      }

      // 逐行操作每个弹幕
      for (i = 0; i < runings.length; i++) {
        // 当前行
        row = runings[i];
        rowFirst = row[0];
        if (this.queue.length) {
          rowLast = row[row.length - 1];
          // 如果该行没有了，或者最后一项移动了特定距离，则追加一项
          if (row.length < 1 || rowLast.left + rowLast.width + 30 < canvasWidth) {
            addItem(this.queue.shift() as IRunningItem, i);
          }
        }
        // 如果第一个已经跑出了视野
        if (rowFirst && rowFirst.left + rowFirst.width < 0) {
          this.queue.push(rowFirst);
          row.shift();
        }
        // 将每一项往左移动
        for (var t = 0; t < row.length; t++) {
          row[t].left -= 1 + row[t].speed;
          this.drawItem(ctx, row[t]);
        }
      }

      if (process.env.TARO_ENV === 'h5') {
        this.rafId = window.requestAnimationFrame(run);
      } else {
        (canvas as Taro.Canvas).requestAnimationFrame(run);
      }
    };

    run();
  }

  drawItem(ctx: CanvasRenderingContext2D, item: IRunningItem) {
    const { height, imgWidth, bgColor, imgTextGap } = this.options;
    let { left, top } = item; // top 指的是底色中心位置;
    let textX = left;

    top += height / 2;

    if (bgColor) {
      // 底色高度
      ctx.lineWidth = height;
      // 底色圆角
      ctx.lineCap = 'round';
      // 画底色
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left + item.width, top);
      ctx.strokeStyle = bgColor;
      ctx.stroke();
    }
    // 画圆形头像
    if (item.img) {
      const radius = imgWidth / 2;
      const imgX = left - height / 4;
      textX = imgX + imgWidth + imgTextGap;
      ctx.save();
      ctx.beginPath();
      ctx.arc(imgX + radius, top, radius, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(item.img as CanvasImageSource, imgX, top - radius, imgWidth, imgWidth);
      ctx.restore();
    }
    // 文字
    ctx.fillText(item.txt, textX, top);
  }

  toggleRun() {
    this.stoped ? this.run() : this.stop();
  }

  stop() {
    this.stoped = true;
    if (this.canvas) {
      if (process.env.TARO_ENV === 'h5') {
        window.cancelAnimationFrame(this.rafId);
      } else {
        (this.canvas as Taro.Canvas).cancelAnimationFrame(this.rafId);
      }
    }
  }
}
