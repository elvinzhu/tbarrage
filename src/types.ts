import Taro from '@tarojs/taro';

export interface IItemStyle {
  /**
   * 弹幕字体样式。默认 "12px arial"
   */
  font: string;
  /**
   * 弹幕文字颜色。默认white
   */
  color: string;
  /**
   * 弹幕的底色。默认rgba(0,0,0,0.4). 传递null表示不绘制底色
   */
  bgColor?: string | null;
}

export interface IRunningItem extends IItemStyle {
  img?: Taro.Image | HTMLImageElement;
  txt: string;
  left: number;
  top: number;
  speed: number;
  width: number;
}

export interface IItem extends Partial<IItemStyle> {
  /**
   * 头像
   */
  img?: string;
  /**
   * 文本
   */
  txt: string;
}

export interface IOptions extends IItemStyle {
  /**
   * 弹幕项出场模式。once：只出场一次 loop：循环参与滚动
   */
  mode: 'once' | 'loop';
  /**
   * 画布高度。默认150px
   */
  canvasHeight: number;
  /**
   * 画布宽度. 默认屏幕宽度
   */
  canvasWidth: number;
  /**
   * 弹幕项高度。默认22px
   */
  height: number;
  /**
   * 头像尺寸. 默认15px
   */
  imgWidth: number;
  /**
   * 最大行数。默认3
   */
  maxRow: number;
  /**
   * 每行弹幕项最小间隔。默认30
   */
  minGap: number;
  /**
   * 每行弹幕项最大间隔，会影响出场排列。默认 canvasWidth
   */
  maxGap: number;
  /**
   * 行间距. 默认20
   */
  rowGap: number;
  /**
   * 头像文字间距。默认6
   */
  imgTextGap: number;
  /**
   * device pixel ratio. 默认自动获取
   */
  dpr: number;
  /**
   * 第一行弹幕距离顶部位置. 默认同 height
   */
  offsetTop: number;
  /**
   * 最小滚动速度。 默认1
   */
  minSpeed: number;
  /**
   * 最大滚动速度。默认40
   */
  maxSpeed: number;
}

export type TPriority = 'high' | 'low';
