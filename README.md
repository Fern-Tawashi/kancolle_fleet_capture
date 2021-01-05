# kancolle_fleet_capture

「kancolle_fleet_capture」は、ブラウザゲーム「艦隊これくしょん」の艦娘詳細を1～6隻までキャプチャ＆連結し、png画像として保存するFirefox用のアドオンです。
“軽量＆シンプル”をコンセプトにしています。

### 使用方法
※全操作に共通して、キーボード入力をする前に、ゲーム画面左右の白い余白をクリックしてください。

1. 【編成】からキャプチャしたい艦娘の【詳細】を表示させる
2. ゲーム画面の左右の白い余白を一度クリックしてから【S】キーでキャプチャ
3. 1～2をキャプチャしたい艦娘分繰り返す（最大6隻）
4. 聯合艦隊の第1か第2を区別したい場合は【1】 or 【2】を押下
5. 艦娘に番号（１～６）を付けたい場合は【W】キーを押下
6. レイアウト縦長or横長の変更は【R】キーを押下
7. ゲーム画面の左右の白い余白を一度クリックしてから【X】キーで画像を保存

6隻を超えた状態でキャプチャしようとすると、強制的に画像を排出します。
キーを押下する時は、一度ゲーム画面左右の白い余白をクリックしてください（※上下の余白ではダメ）

### 全画面キャプチャ
【A】キーを押下する事で生成できます。

### 艦娘詳細６連キャプチャ
【Q】キーを押下してから、編成画面でキャプチャしたい艦娘の詳細ウィンドウを連続で表示していき、最後に【X】キーで保存します。

### オプション
[アドオン]-[オプション...]から、ピクセル単位でのキャプチャ対象枠の調整が可能です。
プリセットを合わせ、8種類まで保存する事が可能です。
※マスク画像はデフォルト座標に合わせているので、別途マスク画像の調整が必要です。

### マスク機能
マスク画像を設定すると、マスク画像の非透過部分と、キャプチャイメージの重なった部分がマスクされて出力されます。

### 独自画像アペンド機能
任意の画像を、画像出力前（[X]押下前）にキーボードの[1-4]キーを押下する事で、重ねる事が出来ます。
アペンド画像は４種類まで設定出来ます。
連合艦隊の艦隊識別タグ等にお役立てください。

### その他機能
* 「艦これ」の多重起動を抑制します（※Firefoxのみ）
* 「艦これ」の離脱前に確認メッセージを表示します。

### 仕様
* ローカルストレージを一時的に10MBほど使います（画像生成時にクリア）
* 本拡張機能が独立してサーバとの送受信を行う事はありません。
* ポップアップ表示に最小限のHTML挿入を行います。
* Canvas要素から画像を取得している為、基地航空隊名称を除く一部のユーザ入力テキストは反映されません。

### パーミッションについて
ゲーム内の一部のURLが可変IPアドレスで記述されている為“すべてのウェブサイトの保存されたデータへのアクセス”権限を必要としていますが、他サイトのデータへのアクセスは行っておりません。
また、多重起動防止処理において、新しく開こうとしているURLを参照する為にも、同権限が必要となっています。

### お願い
自己責任の上での使用をお願いします。
