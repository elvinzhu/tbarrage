# tbarrage 弹幕

弹幕 SDK，适用 taro2 & taro3。

taro3 下需注意调用时机。

```typescript
componentDidMount() {
    Taro.eventCenter.once(Taro.Current.router?.onReady as string, () => {
        // code goes here
    });
}
```

反正点赞又不要钱，点个小星星再走呗 ^\_^

### 安装

```javascript
npm install tbarrage --save
```

### 使用

```typescript
import Barrage from 'tbarrage';

this.barrage = new Barrage(
  '#canvas',
  [
    {
      img: require('./avatar.png'),
      txt: 'xx领取了法拉利5元优惠券',
      color: 'red',
      bgColor: null,
    },
    {
      txt: 'xx刚刚领取了兰博基尼5元优惠券',
    },
    {
      txt: 'xx刚刚领取了兰博基尼5元优惠券',
      color: 'red',
    },
  ],
  {
    // your options goes here
  },
);

this.barrage.run();
// this.barrage.stop();
```

### 参数

参考 [src/types.ts](https://github.com/elvinzhu/tbarrage/blob/master/src/types.ts)


构造函数配置项属性： `IOptions`;

弹幕项配置属性： `IItem`;

### License

MIT[@elvinzhu](https://github.com/elvinzhu)