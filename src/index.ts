import Taro from '@tarojs/taro';
import { getCanvas, getImage } from './helper';

interface IRunningItem {
  img: Taro.Image | HTMLImageElement;
  txt: string;
  left: number;
  top: number;
  speed: number;
  width: number;
}

interface IItem {
  img: string;
  txt: string;
}

interface IOptions {
  maxLen?: number;
}

export default class Barrage {
  selector: string;
  queue: IRunningItem[] = [];
  runnings: IRunningItem[][] = [];
  stoped: Boolean = false;
  canvas: Taro.Canvas | HTMLCanvasElement;
  options: IOptions = {};
  rafId: number;

  constructor(selector: string, data: IItem[], options: IOptions = {}) {
    this.options = options;
    this.selector = selector;
    if (data) {
      this.push(data);
    }
  }

  async getCanvas() {
    if (!this.canvas) {
      const canvas = await getCanvas(this.selector);
      // if (!canvas) {
      //   throw new Error('未找到canvas，请确保selector传递正确，且正确配置了type属性');
      // }
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
    const canvas = await this.getCanvas();
    const img = await getImage(canvas, item.img).catch(() => null);
    if (img) {
      this.queue.push({
        img,
        txt: item.txt,
        left: 0,
        top: 0,
        speed: 0,
        width: 0,
      });
    }
  }

  async run() {
    this.stoped = false;
    const canvas = await this.getCanvas();
    const that = this;

    const sysInfo = Taro.getSystemInfoSync();
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const runings = this.runnings;
    const screenW = sysInfo.windowWidth;
    const maxLen = this.options.maxLen || 6;
    const dpr = sysInfo.pixelRatio;

    // @ts-ignore
    canvas.width = screenW * dpr;
    // @ts-ignore
    canvas.height = 100 * dpr;

    ctx.imageSmoothingEnabled = true;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.font = 'normal normal normal 12px arial';
    ctx.scale(dpr, dpr);

    const addItem = function (item: IRunningItem, j: number) {
      // 同一行，保持相同的速度
      if (runings[j].length) {
        item.speed = runings[j][0].speed;
      } else {
        // 如果是第一项，则给一个速度. (包含2种场景，1. 所有项都移除了屏幕 2. 本行刚刚添加)
        item.speed = Math.floor(Math.random() * 40) / 100;
      }
      item.left = screenW + 200 * Math.random();
      // 行间距
      item.top = j * 46 + 22;
      if (!item.width) {
        item.width = ctx.measureText(item.txt).width + 15 + 4; //  + 头像宽度 + 头像文字间距
      }
      runings[j].push(item);
    };

    let i: number, row: IRunningItem[], rowFirst: IRunningItem, rowLast: IRunningItem;
    let run = function () {
      if (that.stoped) return;

      ctx.clearRect(0, 0, screenW, 300);
      // 如果还未超出最大行数，则新开一行
      if (runings.length < maxLen && that.queue.length) {
        runings.push([]);
      }

      // 逐行操作每个弹幕
      for (i = 0; i < runings.length; i++) {
        // 当前行
        row = runings[i];
        rowFirst = row[0];
        if (that.queue.length) {
          rowLast = row[row.length - 1];
          // 如果该行没有了，或者最后一项移动了特定距离，则追加一项
          if (row.length < 1 || rowLast.left + rowLast.width + 30 < screenW) {
            addItem(that.queue.shift() as IRunningItem, i);
          }
        }
        // 如果第一个已经跑出了视野
        if (rowFirst && rowFirst.left + rowFirst.width < 0) {
          that.queue.push(rowFirst);
          row.shift();
        }
        // 将每一项往左移动
        for (var t = 0; t < row.length; t++) {
          row[t].left -= 1 + row[t].speed;
          that.drawItem(ctx, row[t]);
        }
      }

      if (process.env.TARO_ENV === 'h5') {
        that.rafId = window.requestAnimationFrame(run);
      } else {
        (canvas as Taro.Canvas).requestAnimationFrame(run);
      }
    };

    run();
  }

  drawItem(ctx: CanvasRenderingContext2D, item: IRunningItem) {
    const left = item.left,
      top = item.top;
    const radius = 15 / 2;
    const height = 22;

    // 底色高度
    ctx.lineWidth = height;
    // 底色圆角
    ctx.lineCap = 'round';
    // 画底色
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + item.width, top);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.stroke();
    // 画圆形头像
    ctx.save();
    ctx.beginPath();
    ctx.arc(left + radius, top, radius, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(item.img as CanvasImageSource, left, top - radius, 15, 15);
    ctx.restore();
    // 文字
    ctx.fillText(item.txt, left + 15 + 4, top);
  }

  stop() {
    this.stoped = true;
    if (this.canvas) {
      try {
        if (process.env.TARO_ENV === 'h5') {
          window.cancelAnimationFrame(this.rafId);
        } else {
          (this.canvas as Taro.Canvas).cancelAnimationFrame(this.rafId);
        }
      } catch (error) {}
    }
  }
}
