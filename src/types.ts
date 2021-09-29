import Taro from '@tarojs/taro';

export interface IRunningItem {
  img?: Taro.Image | HTMLImageElement;
  txt: string;
  left: number;
  top: number;
  speed: number;
  width: number;
}

export interface IItem {
  /**
   * 头像
   */
  img?: string;
  /**
   * 文本
   */
  txt: string;
}

export interface IOptions {
  /**
   * 画布高度。默认150px
   */
  canvasHeight: number;
  /**
   * 画布宽度. 默认屏幕宽度
   */
  canvasWidth: number;
  /**
   * 弹幕项高度。默认150px
   */
  height: number;
  /**
   * 头像尺寸. 默认15px
   */
  imgWith: number;
  /**
   * 最大行数。默认3
   */
  maxRow: number;
  /**
   * 行间距. 默认20
   */
  rowGap: number;
  /**
   * 每条弹幕的底色。默认rgba(0,0,0,0.4). 传递null表示不绘制底色
   */
  bgColor?: string | null;
  /**
   * 弹幕文字颜色。默认white
   */
  color: string;
  /**
   * ctx.font。默认 "12px arial"
   */
  font: string;
  /**
   * device pixel ratio. 默认自动获取
   */
  dpr: number;
  /**
   * 第一行弹幕距离顶部位置. 默认同 height
   */
  firstRowTop: number;
}
