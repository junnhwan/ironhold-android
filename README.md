# Ironhold 安卓试玩

Operation Ironhold 的离线安卓试玩。原作是 StarKnightt 的浏览器 FPS，MIT 许可，见仓库根目录 `LICENSE`。这一版保留原来的集装箱场地、四把枪、十个敌人和三分钟限时，补了横屏触屏，并把 Three.js 放进安装包。

以后加玩法就加在这个目录里。游戏逻辑在 `game/index.html`，触屏在 `game/touch.js`。

## 操作

左手摇杆移动，推满向前冲刺。右侧空白处滑动转向。开火按住连射，瞄准点一下开关，跳按住可以翻上箱子。装弹、下蹲、屏息和单发/连发都在右下角。上方四个键切换步枪、霰弹、手枪和狙击。暂停键或安卓返回键暂停；再按返回离开游戏。

## 浏览器里先看

在 `game` 目录起一个本地页面服务，打开 `http://127.0.0.1:8137/index.html?touch=1`。不带 `?touch=1` 时仍是原来的鼠标键盘。

## 安装

公开版本在 [Releases](https://github.com/junnhwan/ironhold-android/releases)。0.1.0 的安装包是 `Ironhold-0.1.0-android.apk`，包名 `com.junnhwan.ironhold`，横屏，不联网。

本机重新打包时，SDK 路径写在 `local.properties`，正式签名写在不入库的 `signing.properties`。在本目录执行：

```bat
gradlew.bat assembleRelease
```

签名安装包在 `app/build/outputs/apk/release/app-release.apk`。
