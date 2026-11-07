# 重围突袭 · 安卓试玩上下文

更新：2026-11-07。

2026-11-07 用户要求先做 Operation Ironhold 的安卓版试玩，确认能玩之后再自行增加玩法。本目录是独立工程，不沿用靶域的代码、资源、地图、武器、界面和实现。原作 <https://github.com/StarKnightt/operation-ironhold>，Copyright (c) 2026 StarKnightt，MIT；Three.js r128 位于 `game/vendor/three.min.js`。

## 当前试玩版本

0.2.0 名为“重围突袭”，保留原作的集装箱地图、四把枪、十个敌人与三分钟清场。新版重排触屏 HUD，支持按住开火拖动视角，加入普通和开镜灵敏度、动作键和摇杆大小、按键底色、可拖动布局及本地持久化；新增流畅、均衡、清晰画质档，默认均衡并降低手机画面颗粒。加入独立自适应应用图标。

0.2.0 已发布至 [GitHub Release](https://github.com/junnhwan/ironhold-android/releases/tag/v0.2.0)。本机成品 `dist/Breachline-0.2.0-android.apk`，2,144,511 字节，SHA-256 `b244247b73edb8be4ef7eeff6d91c79b6b4a0db3d2fa621822c37ee1bea7b1f2`。包名 `com.junnhwan.ironhold`，versionCode 2，原签名证书 SHA-256 `7e7d385a3bdcfa1d44c05441a8573ecd589518299de3f8030506f53ca775d7c7`。签名文件在本机 `signing/`，不入库。

已通过 release 构建、签名与打包资源核对；浏览器自动化检查多指移动和开火拖动、暂停释放、设置及位置重载、三种横屏尺寸。隔离的 Android API 35 模拟器上，0.1.0 到 0.2.0 覆盖安装成功，启动、开火拖动、返回暂停、设置和自定义位置重启保留均有截图验证；示例截图为 `dist/Breachline-0.2.0-emulator.png`。上传资产的大小和 GitHub SHA-256 摘要与本地成品一致，未重复下载公开 APK 复验。这些结果不代表 vivo 真机上的手感、帧率、发热或续航已经验收。

## 公开历史

源码和 0.1.0 安装包在公开仓库 [junnhwan/ironhold-android](https://github.com/junnhwan/ironhold-android)。2026-11-07 发布 [v0.1.0](https://github.com/junnhwan/ironhold-android/releases/tag/v0.1.0)，本机安装包 `dist/Ironhold-0.1.0-android.apk`，2,136,034 字节，SHA-256 `22e6ed83fb299c8614bc6774e7feb61d6aa377cb1979e805d24f48538bb9590b`。当时没有下载已发布安装包再做复验。
