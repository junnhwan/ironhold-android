# 重围突袭 · 安卓试玩

基于 [Operation Ironhold](https://github.com/StarKnightt/operation-ironhold) 的离线安卓 FPS。保留原作的集装箱场地、四把枪、十个敌人和三分钟清场，并针对横屏触控调整。原作 Copyright (c) 2026 StarKnightt，MIT 许可，见 `LICENSE`。

## 试玩与操作

- 0.2.0 试玩包：[GitHub 下载](https://github.com/junnhwan/ironhold-android/releases/download/v0.2.0/Breachline-0.2.0-android.apk)，本机成品位于 `dist/Breachline-0.2.0-android.apk`。原来的 0.1.0 仍可在 [Releases](https://github.com/junnhwan/ironhold-android/releases) 找到。
- 左手摇杆移动，向前推满冲刺；右侧空白区域滑动转向。按住开火键射击时，也可以直接拖动开火键转向。
- 开始界面或暂停界面的“操作与画质设置”可调整普通/开镜灵敏度、动作键与摇杆大小、按键底色，以及流畅、均衡、清晰三档画质。
- 在设置中选择“拖动调整按键位置”，拖动摇杆、单个动作键、武器栏或暂停键，点“完成”保存；编辑时可恢复默认位置。设置保存在本机。
- “清晰”固定较高的场景渲染分辨率，设备卡顿或发热时可以切换“均衡”或“流畅”。实际画质和帧率依设备而定。
- 暂停键或安卓返回键暂停；暂停时再按返回离开游戏。

应用包名仍为 `com.junnhwan.ironhold`，使用原签名，可覆盖安装 0.1.0。最低 Android 8.0（API 26），游戏不需要联网。

## 开发和验证

游戏主体为 `game/index.html`，移动端界面为 `game/mobile.css`，触控与设置为 `game/mobile-controls.js`。在 `game` 目录运行本地页面服务，打开 `http://127.0.0.1:8137/index.html?touch=1` 可查看触屏布局；不带 `?touch=1` 时保留鼠标键盘操作。

在本目录配置好 SDK 的 `local.properties` 和不入库的 `signing.properties` 后，运行 `gradlew.bat assembleRelease`；签名成品位于 `app/build/outputs/apk/release/app-release.apk`。

`tests/mobile-controls.test.cjs` 使用 Node.js、可解析的 Playwright 和本机 Chromium/Edge，验证多指移动与开火拖动、暂停释放、设置及布局持久化、不同横屏尺寸。运行 `node tests/mobile-controls.test.cjs`；可通过环境变量 `BREACHLINE_BROWSER` 指定浏览器程序。浏览器测试和模拟器测试不能替代真机手感、发热和性能验收。
