import Taro, { Component, Config } from '@tarojs/taro';
import { View, Canvas, Button } from '@tarojs/components';
import Barrage from '../dist/index.es';
import avatar from './avatar.png';

import './index.css';

export default class Index extends Component {
  config: Config = {
    navigationBarTitleText: '首页',
  };

  barrage: Barrage;

  componentDidMount() {
    this.barrage = new Barrage('#canvas', [
      {
        img: avatar,
        txt: '迪丽热巴刚刚领取了法拉利5元优惠券',
        color: 'red',
      },
      {
        // img: avatar,
        txt: '刘亦菲刚刚领取了兰博基尼5元优惠券',
      },
      {
        // img: avatar,
        txt: '刘亦菲刚刚领取了兰博基尼5元优惠券',
      },
      {
        img: avatar,
        txt: '刘亦菲刚刚领取了兰博基尼5元优惠券',
      },
      {
        // img: avatar,
        txt: '刘亦菲刚刚领取了兰博基尼5元优惠券',
        color: 'red',
      },
      {
        img: avatar,
        txt: '刘亦菲刚刚领取了兰博基尼5元优惠券',
      },
      {
        // img: avatar,
        txt: '刘亦菲刚刚领取了兰博基尼5元优惠券',
      },
    ]);

    this.barrage.run();
  }

  componentDidShow() {
    if (this.barrage) {
      this.barrage.run();
    }
  }

  componentDidHide() {
    this.barrage.stop();
  }

  render() {
    return (
      <View className="index">
        <Canvas id="canvas" canvasId="canvas" type="2d"></Canvas>
        <Button onClick={() => this.barrage.toggleRun()}>Pause</Button>
      </View>
    );
  }
}
