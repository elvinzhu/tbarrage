import Taro from '@tarojs/taro';
import { Component } from 'react';
import { View, Canvas, Button, Input } from '@tarojs/components';
import Barrage from '../dist/index.es';
import avatar from './avatar.png';

import './index.css';

export default class Index extends Component {
  barrage: Barrage;

  state = {
    text: '',
  };

  componentDidMount() {

    setTimeout(() => {
      this.barrage = new Barrage('#canvas', [
        {
          img: avatar,
          txt: 'xx领取了法拉利5元优惠券',
          color: 'red',
          bgColor: null,
        },
        {
          // img: avatar,
          txt: 'xx刚刚领取了兰博基尼5元优惠券',
        },
        {
          // img: avatar,
          txt: 'xx刚刚领取了兰博基尼5元优惠券',
        },
        {
          img: avatar,
          txt: 'xx刚刚领取了兰博基尼5元优惠券',
        },
        {
          // img: avatar,
          txt: 'xx刚刚领取了兰博基尼5元优惠券',
          color: 'red',
        },
        {
          img: avatar,
          txt: 'xx刚刚领取了兰博基尼5元优惠券',
        },
        {
          // img: avatar,
          txt: 'xx刚刚领取了兰博基尼5元优惠券',
        },
      ]);

      this.barrage.run();
    }, 2000);
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
        <View className="box">
          <Input
            type="text"
            value={this.state.text}
            placeholder="弹幕文字内容"
            onInput={e =>
              this.setState({
                text: e.detail.value,
              })
            }
          />
          <Button
            onClick={() =>
              this.barrage.push({
                txt: this.state.text,
              })
            }
            size="mini"
          >
            发送弹幕
          </Button>
          <Button onClick={() => this.barrage.toggleRun()} size="mini">
            停止滚动
          </Button>
        </View>
      </View>
    );
  }
}
