# kancolle_fleet_capture

「kancolle_fleet_capture」は、ブラウザゲーム「艦隊これくしょん」の艦娘詳細を1〜6隻までキャプチャ＆連結し、png画像として保存するFirefox用のアドオンです。
“軽量＆シンプル”をコンセプトにしています。

### 使用方法
1. 【編成】からキャプチャしたい艦娘の【詳細】を表示させる
2. ゲーム画面の左右の白い余白を一度クリックしてから【S】キーでキャプチャ
3. 1〜2をキャプチャしたい艦娘分繰り返す（最大6隻）
4. 聯合艦隊の第1か第2を区別した場合は【1】 or 【2】を押下
5. ゲーム画面の左右の白い余白を一度クリックしてから【X】キーで画像を保存

6隻を超えた状態でキャプチャすると、強制的に保存されます。
キーを押下する時は、一度ゲーム画面左右の白い余白をクリックしてください（※上下の余白ではダメ）

### 全画面キャプチャ
【A】キーを押下する事で生成できます。

### オプション
[アドオン]-[オプション...]から、ピクセル単位でのキャプチャ対象枠の調整が可能です。
8種類まで保存する事が可能です。

### 仕様
* ローカルストレージを一時的に10MBほど使います（画像生成時にクリア）
* サーバ側との通信は一切行いません。HTMLの変更も行いません。
* Canvas要素から画像を取得している為、ユーザ入力テキストは反映されません。

### パーミッションについて
ゲーム内の一部のURLが可変IPアドレスで記述されている為“すべてのウェブサイトの保存されたデータへのアクセス”権限を必要としています。
他サイトのデータのアクセスは一切行っておりませんが、気になる方（分かる方）はソースを確認してみてください
※アドオンファイルの拡張子 xpi→zip でアーカイブを展開出来ます。

### 実験的機能
オプション Mask をチェックすると、不要な背景を透過にします。
対応している枠は以下３種で、初期座標でのみ調整しています。
* 編成 - 詳細
* 編成 - 変更
* 編成展開 - 右列

### お願い
自己責任の上での使用をお願いします。
不具合報告等、何かありましたら、下記までフィードバックをください。

---
tawashi
https://twitter.com/mtm13th
