// 初期化用パラメータ
var INITIAL_DATA = {
  current_view_type: 1,
  layout: 0,
  view_type_1: { w: 724, h: 560, x: 471, y: 145 },
  view_type_2: { w: 318, h: 354, x: 882, y: 145 },
  view_type_3: { w: 480, h: 456, x: 718, y: 211 },
  view_type_4: { w: 336, h: 503, x: 863, y: 197 },
  view_type_5: { w: 1200, h: 720, x: 0, y: 0 },
  view_type_6: { w: 1200, h: 720, x: 0, y: 0 },
  view_type_7: { w: 1200, h: 720, x: 0, y: 0 },
  view_type_8: { w: 1200, h: 720, x: 0, y: 0 },
  mask_file_1: "./mask_image/mask1.png",
  mask_file_2: "./mask_image/mask2.png",
  mask_file_3: "./mask_image/mask3.png",
  mask_file_4: "./mask_image/mask4.png",
  additional_file_1: "./mask_image/fleet1.png",
  additional_file_2: "./mask_image/fleet2.png",
  number_file: "./mask_image/fleet_num.png",
  quick_delay: 200,
  safety_mode: 0,
  dl_file_name: "myfleet_%Y%M%D"
};

// 多重起動防止対象URL
var KANCOLLE_URL = [
  "*://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854/",
  "*://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854"
];

var KANCOLLE_URL_REGEX = /^http:\/\/www\.dmm\.com\/netgame\/social\/-\/gadgets\/=\/app_id=854854\/?$/;
