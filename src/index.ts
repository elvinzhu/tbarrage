import Taro from '@tarojs/taro';
import { getCanvas, getImage, mergeOptions } from './helper';
import { IRunningItem, IItem, IOptions, TPriority } from './types';

export default class Barrage {
  private selector: string;
  private queue: IRunningItem[] = [];
  private runnings: IRunningItem[][] = [];
  private stoped: Boolean = true;
  private canvas: Taro.Canvas | HTMLCanvasElement;
  private options: IOptions;
  private rafId: number;

  constructor(selector: string | Taro.Canvas | HTMLCanvasElement, data: IItem[], options: Partial<IOptions> = {}) {
    this.options = mergeOptions(options);
    if (typeof selector === 'string') {
      this.selector = selector;
    } else {
      this.canvas = selector;
    }
    if (data) {
      this.push(data, 'low');
    }
  }

  private async getCanvas() {
    if (!this.canvas) {
      const canvas = await getCanvas(this.selector);
      if (!canvas || !canvas.getContext) {
        throw new Error('未找到canvas，请确保selector传递正确，且canvas正确配置了type属性');
      }
      this.canvas = canvas;
    }
    return this.canvas;
  }

  private async resolve(item: IItem) {
    const { color, font, bgColor } = this.options;
    const itemData: IRunningItem = {
      txt: item.txt,
      left: 0,
      top: 0,
      speed: 0,
      width: 0,
      color: item.color || color,
      font: item.font || font,
      bgColor: item.bgColor === null ? null : item.bgColor || bgColor,
    };
    const canvas = await this.getCanvas();
    if (item.img) {
      const img = await getImage(canvas, item.img).catch(() => undefined);
      itemData.img = img;
    }
    return itemData;
  }

  /**
   * 添加弹幕
   * @param data 弹幕数据.
   * @param priority 优先级. 默认 high
   */
  push(data: IItem[] | IItem, priority: TPriority = 'high') {
    const arrData = Array.isArray(data) ? data : [data];
    arrData.forEach(item => {
      if (item && item.txt) {
        this.resolve(item).then(resolved => {
          if (priority === 'high') {
            this.queue.unshift(resolved);
          } else {
            this.queue.push(resolved);
          }
        });
      }
    });
  }

  /**
   * 开始滚动弹幕（重复调用无影响）
   * @returns
   */
  async run() {
    if (!this.stoped) {
      // 运行中，终止
      return;
    }
    this.stoped = false;

    const { height, canvasHeight, canvasWidth, imgWidth, dpr, maxRow, offsetTop } = this.options;
    const { minGap, rowGap, imgTextGap, maxGap, minSpeed, maxSpeed, mode } = this.options;

    const canvas = await this.getCanvas();
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const runings = this.runnings;

    // @ts-ignore
    canvas.width = canvasWidth * dpr;
    // @ts-ignore
    canvas.height = canvasHeight * dpr;

    ctx.imageSmoothingEnabled = true;
    ctx.textBaseline = 'middle';
    ctx.scale(dpr, dpr);

    const addItem = (item: IRunningItem, j: number) => {
      // 同一行，保持相同的速度
      if (runings[j].length) {
        item.speed = runings[j][0].speed;
      } else {
        // 如果是第一项，则给一个速度. (包含2种场景，1. 所有项都移除了屏幕 2. 本行刚刚添加)
        item.speed = Math.round(Math.random() * maxSpeed) / 100 + minSpeed;
      }
      item.left = canvasWidth + maxGap * Math.random();
      // 行间距
      item.top = j * (rowGap + height) + offsetTop;
      if (!item.width) {
        ctx.font = item.font; // 字体样式影响measureText
        item.width = ctx.measureText(item.txt).width;
        if (item.img) {
          // + 头像宽度 + 头像文字间距
          item.width += imgWidth + imgTextGap;
        }
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
          if (row.length < 1 || rowLast.left + rowLast.width + minGap < canvasWidth) {
            addItem(this.queue.shift() as IRunningItem, i);
          }
        }
        // 如果第一个已经跑出了视野. (height / 2 时lineCap那个圆弧的宽度)
        if (rowFirst && mode === 'loop' && rowFirst.left + rowFirst.width + height / 2 < 0) {
          this.queue.push(rowFirst);
          row.shift();
        }
        // 将每一项往左移动
        for (var t = 0; t < row.length; t++) {
          row[t].left -= row[t].speed;
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

  private drawItem(ctx: CanvasRenderingContext2D, item: IRunningItem) {
    const { height, imgWidth, imgTextGap } = this.options;
    let { left, top, color, font, bgColor } = item; // top 指的是底色中心位置;
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
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(item.txt, textX, top);
  }

  /**
   * 停止或者开始滚动
   */
  toggleRun() {
    this.stoped ? this.run() : this.stop();
  }

  /**
   * 停止滚动
   */
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
