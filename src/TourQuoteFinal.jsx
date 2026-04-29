import { useState, useMemo, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";

/* ═══════════════════════════ GLOBAL CSS ═══════════════════════════ */
const G=`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500;600&family=Noto+Sans+SC:wght@400;600&display=swap');
  *{box-sizing:border-box;} body,#root{margin:0;padding:0;}
  input,select{font-family:'DM Sans','Noto Sans SC',sans-serif;}
  input[type=number]::-webkit-inner-spin-button{opacity:.5;}
  .rh:hover{background:#edf5ff!important;transition:background .12s;}
  .ov{position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:900;backdrop-filter:blur(3px);}
  .dr{position:fixed;top:0;right:0;height:100vh;width:460px;max-width:96vw;background:#fff;z-index:901;
      box-shadow:-10px 0 50px rgba(0,0,0,.28);display:flex;flex-direction:column;animation:sli .22s ease;}
  @keyframes sli{from{transform:translateX(100%)}to{transform:translateX(0)}}
  .tab-bar{display:flex;border-bottom:2px solid #ede8dc;}
  .tab{flex:1;padding:10px 6px;border:none;background:none;cursor:pointer;font-family:inherit;
       font-size:13px;font-weight:600;color:#8a7a6a;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .18s;}
  .tab.on{color:#1a3a4a;border-bottom-color:#c9962a;}
  .qc{border:1px solid #ddd8cc;border-radius:10px;padding:13px 14px;margin-bottom:10px;background:white;
      transition:border-color .18s,box-shadow .18s,transform .14s;}
  .qc:hover{border-color:#c9962a;box-shadow:0 4px 16px rgba(201,150,42,.15);transform:translateY(-1px);}
  .tc{border:1px solid #ddd8cc;border-radius:12px;margin-bottom:12px;background:white;overflow:hidden;
      transition:border-color .18s,box-shadow .18s;}
  .tc:hover{border-color:#c9962a;box-shadow:0 4px 20px rgba(201,150,42,.14);}
  .toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);background:#1a3a4a;color:#e8d5a3;
         padding:10px 22px;border-radius:30px;font-size:13px;font-weight:600;z-index:2000;pointer-events:none;
         animation:tin .28s ease,tout .28s ease 2.3s forwards;}
  @keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes tout{from{opacity:1}to{opacity:0}}
  .mov{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1100;background:rgba(0,0,0,.42);}
  .mbox{background:white;border-radius:14px;padding:26px 28px;max-width:400px;width:92vw;box-shadow:0 14px 50px rgba(0,0,0,.28);}
  .tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;}
  .preset-badge{background:linear-gradient(135deg,#1a3a4a,#0d2535);color:#e8d5a3;font-size:10px;font-weight:700;
                padding:2px 8px;border-radius:20px;letter-spacing:.4px;}
  .lang-btn{padding:5px 10px;border-radius:7px;border:1px solid rgba(232,213,163,.3);cursor:pointer;
            background:rgba(255,255,255,.08);color:#c8d8e0;font-size:12px;font-weight:600;
            font-family:inherit;transition:all .15s;}
  .lang-btn.on{background:rgba(201,150,42,.3);border-color:#c9962a;color:#e8d5a3;}
  .cur-btn{padding:5px 11px;border-radius:7px;border:1px solid rgba(232,213,163,.3);cursor:pointer;
           background:rgba(255,255,255,.08);color:#c8d8e0;font-size:12px;font-weight:700;
           font-family:inherit;transition:all .15s;}
  .cur-btn.on{background:rgba(201,150,42,.28);border-color:#c9962a;color:#e8d5a3;}
`;

/* ═══════════════════════════ COLOURS ═══════════════════════════ */
const C={navy:"#1a3a4a",dark:"#0d2535",gold:"#c9962a",goldL:"#e8d5a3",
         cream:"#faf7f0",creamD:"#ede8dc",border:"#ddd8cc",text:"#222",
         mut:"#7a6a5a",bg:"#f4efe4",green:"#2a7a4e",red:"#c0392b"};

/* ═══════════════════════════ I18N ═══════════════════════════ */
const LANG={
  vi:{
    appName:"TourQuote Pro", tagline:"Báo giá chuyên nghiệp",
    finalPrice:"Giá bán cuối", btnTemplate:"🎨 Template", btnSaved:"📁 Đã lưu",
    sectionInfo:"📋 Thông tin chuyến đi", sectionSettings:"⚙️ Cài đặt tính giá",
    sectionCurrency:"💱 Tỷ giá ngoại tệ",
    fTourName:"Tên tour", fCode:"Mã tour", fClient:"Khách hàng / Đoàn", fBy:"Người lập",
    fStart:"Ngày khởi hành", fEnd:"Ngày kết thúc", fAdults:"Người lớn", fChildren:"Trẻ em", fNotes:"Ghi chú",
    phTourName:"Đà Nẵng – Hội An 4N3Đ", phCode:"DN-HA-001", phClient:"Công ty TNHH ABC",
    phBy:"Nguyễn Văn A", phNotes:"Lưu ý / điều khoản...",
    fMarkup:"Lợi nhuận / Markup (%)", fDiscount:"Chiết khấu (%)", fVAT:"VAT (%)",
    hMarkup:"Tính trên tổng chi phí vận hành", hDiscount:"Giảm trước khi tính markup", hVAT:"Cộng vào giá bán cuối",
    displayCur:"Hiển thị tiền tệ", rateUSD:"Tỷ giá 1 USD =", rateCNY:"Tỷ giá 1 CNY =",
    hRateUSD:"VNĐ / 1 USD (cập nhật theo thị trường)", hRateCNY:"VNĐ / 1 CNY",
    colService:"Tên dịch vụ", colQty:"SL", colUnit:"Đơn giá", colTimes:"Số lần",
    colTotal:"Thành tiền", colNote:"Ghi chú", colCur:"Tiền tệ",
    btnAdd:"+ Thêm dịch vụ", formula:"Số lượng × Đơn giá × Số lần = Thành tiền",
    emptyRow:"Chưa có dịch vụ · Nhấn \"+ Thêm dịch vụ\" bên dưới",
    sumTitle:"📊 Tổng kết báo giá", sumBycat:"Chi tiết theo hạng mục", sumPricing:"Bảng tính giá bán",
    sumBase:"Tổng chi phí vận hành", sumDiscount:"Chiết khấu", sumProfit:"Lợi nhuận dự kiến",
    sumVAT:"VAT", sumFinal:"🎯 GIÁ BÁN CUỐI", sumPP:"👤 Giá / người", sumPax:"pax",
    btnUseTpl:"🎨 Dùng template", btnSaveQ:"💾 Lưu báo giá",
    cat0:"Lưu trú", cat1:"Giao thông", cat2:"Cảnh điểm", cat3:"Hướng dẫn viên", cat4:"Nhà hàng", cat5:"Dịch vụ khác",
    // Saved drawer
    savedTitle:"📁 Lịch sử báo giá", savedCount:"báo giá đã lưu",
    btnSaveCur:"💾 Lưu báo giá hiện tại", searchPH:"Tìm tên tour, mã, khách hàng...",
    btnLoad:"📂 Tải lên", btnDup:"📋 Nhân bản",
    noSaved:"Chưa có báo giá nào được lưu", noSavedH:"Nhấn nút lưu ở trên để bắt đầu",
    savedFoot:"Dữ liệu được lưu trên thiết bị của bạn",
    // Template drawer
    tplTitle:"🎨 Template Tour", tplPreset:"⭐ Preset có sẵn", tplMine:"🎨 Của tôi",
    btnSaveTpl:"💾 Lưu báo giá hiện tại thành template",
    btnApply:"⚡ Áp dụng ngay", btnPreview:"👁 Xem", btnHide:"▲ Ẩn",
    tplNamePH:"Tên template (bắt buộc) *", tplDescPH:"Mô tả ngắn...",
    btnConfirmSaveTpl:"✓ Lưu template", tplSvcCount:"dịch vụ",
    noTpl:"Chưa có template nào", noTplH:"Lưu báo giá hiện tại thành template để bắt đầu",
    tplFoot:"Áp dụng template sẽ thay thế toàn bộ dịch vụ hiện tại",
    tplDetail:"Chi tiết dịch vụ", tplSaving:"⏳ Đang lưu...", loading:"⏳ Đang tải...",
    noResult:"Không tìm thấy kết quả", tryOther:"Thử từ khóa khác",
    confirmDeleteMsg:"Hành động này không thể hoàn tác.",
    btnCancel:"Hủy", btnDelete:"Xóa",
    tSaved:"✅ Đã lưu báo giá!", tLoaded:"📂 Đã tải báo giá!", tDup:"📋 Đã nhân bản!",
    tDelQ:"🗑️ Đã xóa báo giá!", tTplSaved:"🎨 Đã lưu template!", tTplApplied:"✅ Đã áp dụng template!",
    tTplDel:"🗑️ Đã xóa template!", tTplName:"⚠️ Vui lòng nhập tên template!", tErr:"❌ Có lỗi xảy ra!",
    tNotFound:"❌ Không tìm thấy dữ liệu!",
    pdfTitle:"Báo Giá Tour Du Lịch", pdfBy:"Người lập", pdfDate:"Ngày lập", pdfFoot:"Tổng kết báo giá",
    subTotal:"Subtotal", xlsTitle:"BÁO GIÁ TOUR DU LỊCH", xlsCat:"HẠNG MỤC", xlsAmt:"THÀNH TIỀN",
    presetLabel:"PRESET", adults:"Người lớn", children:"Trẻ em",
  },
  en:{
    appName:"TourQuote Pro", tagline:"Professional Tour Quotation",
    finalPrice:"Final Price", btnTemplate:"🎨 Templates", btnSaved:"📁 Saved",
    sectionInfo:"📋 Trip Information", sectionSettings:"⚙️ Pricing Settings",
    sectionCurrency:"💱 Currency & Exchange Rates",
    fTourName:"Tour Name", fCode:"Tour Code", fClient:"Client / Group", fBy:"Prepared By",
    fStart:"Departure Date", fEnd:"Return Date", fAdults:"Adults", fChildren:"Children", fNotes:"Notes / Terms",
    phTourName:"Da Nang – Hoi An 4D3N", phCode:"DN-HA-001", phClient:"ABC Company Ltd.",
    phBy:"John Doe", phNotes:"Special terms & conditions...",
    fMarkup:"Profit / Markup (%)", fDiscount:"Discount (%)", fVAT:"VAT (%)",
    hMarkup:"Applied on total operating cost", hDiscount:"Applied before markup", hVAT:"Added to final price",
    displayCur:"Display currency", rateUSD:"Rate: 1 USD =", rateCNY:"Rate: 1 CNY =",
    hRateUSD:"VND per 1 USD (update to market rate)", hRateCNY:"VND per 1 CNY",
    colService:"Service Name", colQty:"Qty", colUnit:"Unit Price", colTimes:"Times",
    colTotal:"Total", colNote:"Note", colCur:"Currency",
    btnAdd:"+ Add Service", formula:"Qty × Unit Price × Times = Total",
    emptyRow:'No services yet · Click "+ Add Service" below',
    sumTitle:"📊 Quotation Summary", sumBycat:"Breakdown by Category", sumPricing:"Pricing Calculation",
    sumBase:"Total Operating Cost", sumDiscount:"Discount", sumProfit:"Expected Profit",
    sumVAT:"VAT", sumFinal:"🎯 FINAL PRICE", sumPP:"👤 Per person", sumPax:"pax",
    btnUseTpl:"🎨 Use Template", btnSaveQ:"💾 Save Quote",
    cat0:"Accommodation", cat1:"Transportation", cat2:"Attractions", cat3:"Tour Guide", cat4:"Restaurant", cat5:"Other Services",
    savedTitle:"📁 Quote History", savedCount:"quotes saved",
    btnSaveCur:"💾 Save Current Quote", searchPH:"Search by tour name, code, client...",
    btnLoad:"📂 Load", btnDup:"📋 Duplicate",
    noSaved:"No quotes saved yet", noSavedH:"Click the save button above to get started",
    savedFoot:"Data stored on your device",
    tplTitle:"🎨 Tour Templates", tplPreset:"⭐ Preset Templates", tplMine:"🎨 My Templates",
    btnSaveTpl:"💾 Save current quote as template",
    btnApply:"⚡ Apply Now", btnPreview:"👁 Preview", btnHide:"▲ Hide",
    tplNamePH:"Template name (required) *", tplDescPH:"Short description...",
    btnConfirmSaveTpl:"✓ Save Template", tplSvcCount:"services",
    noTpl:"No templates yet", noTplH:"Save a quote as a template to get started",
    tplFoot:"Applying a template will replace all current services",
    tplDetail:"Service Details", tplSaving:"⏳ Saving...", loading:"⏳ Loading...",
    noResult:"No results found", tryOther:"Try a different keyword",
    confirmDeleteMsg:"This action cannot be undone.",
    btnCancel:"Cancel", btnDelete:"Delete",
    tSaved:"✅ Quote saved!", tLoaded:"📂 Quote loaded!", tDup:"📋 Quote duplicated!",
    tDelQ:"🗑️ Quote deleted!", tTplSaved:"🎨 Template saved!", tTplApplied:"✅ Template applied!",
    tTplDel:"🗑️ Template deleted!", tTplName:"⚠️ Please enter a template name!", tErr:"❌ An error occurred!",
    tNotFound:"❌ Data not found!",
    pdfTitle:"Tour Travel Quotation", pdfBy:"Prepared by", pdfDate:"Date", pdfFoot:"Quotation Summary",
    subTotal:"Subtotal", xlsTitle:"TOUR TRAVEL QUOTATION", xlsCat:"CATEGORY", xlsAmt:"AMOUNT",
    presetLabel:"PRESET", adults:"Adults", children:"Children",
  },
  zh:{
    appName:"TourQuote Pro", tagline:"专业旅游报价系统",
    finalPrice:"最终价格", btnTemplate:"🎨 模板", btnSaved:"📁 已保存",
    sectionInfo:"📋 行程信息", sectionSettings:"⚙️ 定价设置",
    sectionCurrency:"💱 汇率设置",
    fTourName:"线路名称", fCode:"线路编号", fClient:"客户 / 团队", fBy:"报价人",
    fStart:"出发日期", fEnd:"返回日期", fAdults:"成人人数", fChildren:"儿童人数", fNotes:"备注 / 条款",
    phTourName:"岘港 – 会安 4天3晚", phCode:"DN-HA-001", phClient:"ABC有限公司",
    phBy:"张三", phNotes:"特别说明 / 条款...",
    fMarkup:"利润 / 加价 (%)", fDiscount:"折扣 (%)", fVAT:"增值税 (%)",
    hMarkup:"基于总运营成本计算", hDiscount:"在加价前扣除", hVAT:"加入最终售价",
    displayCur:"显示货币", rateUSD:"汇率：1 USD =", rateCNY:"汇率：1 CNY =",
    hRateUSD:"越南盾 / 1 美元（请更新为市场汇率）", hRateCNY:"越南盾 / 1 人民币",
    colService:"服务名称", colQty:"数量", colUnit:"单价", colTimes:"次数",
    colTotal:"合计", colNote:"备注", colCur:"货币",
    btnAdd:"+ 添加服务", formula:"数量 × 单价 × 次数 = 合计",
    emptyRow:'暂无服务 · 点击下方"+ 添加服务"',
    sumTitle:"📊 报价汇总", sumBycat:"分类明细", sumPricing:"定价计算",
    sumBase:"总运营成本", sumDiscount:"折扣", sumProfit:"预期利润",
    sumVAT:"增值税", sumFinal:"🎯 最终售价", sumPP:"👤 每人价格", sumPax:"人",
    btnUseTpl:"🎨 使用模板", btnSaveQ:"💾 保存报价",
    cat0:"住宿", cat1:"交通", cat2:"景点", cat3:"导游", cat4:"餐饮", cat5:"其他服务",
    savedTitle:"📁 报价历史", savedCount:"份报价已保存",
    btnSaveCur:"💾 保存当前报价", searchPH:"搜索线路名称、编号、客户...",
    btnLoad:"📂 加载", btnDup:"📋 复制",
    noSaved:"暂无已保存的报价", noSavedH:"点击上方保存按钮开始",
    savedFoot:"数据存储在您的设备上",
    tplTitle:"🎨 旅游模板", tplPreset:"⭐ 预设模板", tplMine:"🎨 我的模板",
    btnSaveTpl:"💾 将当前报价保存为模板",
    btnApply:"⚡ 立即应用", btnPreview:"👁 预览", btnHide:"▲ 隐藏",
    tplNamePH:"模板名称（必填）*", tplDescPH:"简短描述...",
    btnConfirmSaveTpl:"✓ 保存模板", tplSvcCount:"项服务",
    noTpl:"暂无模板", noTplH:"将当前报价保存为模板以开始使用",
    tplFoot:"应用模板将替换所有当前服务",
    tplDetail:"服务详情", tplSaving:"⏳ 保存中...", loading:"⏳ 加载中...",
    noResult:"未找到结果", tryOther:"请尝试其他关键词",
    confirmDeleteMsg:"此操作无法撤销。",
    btnCancel:"取消", btnDelete:"删除",
    tSaved:"✅ 报价已保存！", tLoaded:"📂 报价已加载！", tDup:"📋 报价已复制！",
    tDelQ:"🗑️ 报价已删除！", tTplSaved:"🎨 模板已保存！", tTplApplied:"✅ 模板已应用！",
    tTplDel:"🗑️ 模板已删除！", tTplName:"⚠️ 请输入模板名称！", tErr:"❌ 发生错误！",
    tNotFound:"❌ 未找到数据！",
    pdfTitle:"旅游报价单", pdfBy:"报价人", pdfDate:"报价日期", pdfFoot:"报价汇总",
    subTotal:"小计", xlsTitle:"旅游报价单", xlsCat:"类别", xlsAmt:"金额",
    presetLabel:"预设", adults:"成人", children:"儿童",
  }
};

/* ═══════════════════════════ CURRENCY ═══════════════════════════ */
const CURR={
  VND:{symbol:"₫", dec:0, locale:"vi-VN", flag:"🇻🇳"},
  USD:{symbol:"$", dec:2, locale:"en-US", flag:"🇺🇸"},
  CNY:{symbol:"¥", dec:2, locale:"zh-CN", flag:"🇨🇳"},
};
const CURR_KEYS=["VND","USD","CNY"];

const toVND=(amount,cur,rates)=>{
  if(cur==="VND"||!cur) return Number(amount);
  return Number(amount)*(rates[cur]||1);
};
const fromVND=(amountVND,cur,rates)=>{
  if(cur==="VND"||!cur) return amountVND;
  return amountVND/(rates[cur]||1);
};
const fmtAmt=(amount,cur)=>{
  const c=CURR[cur]||CURR.VND;
  const n=isNaN(amount)||amount==null?0:amount;
  const s=new Intl.NumberFormat(c.locale,{minimumFractionDigits:c.dec,maximumFractionDigits:c.dec}).format(n);
  return cur==="VND"?s+" ₫":c.symbol+s;
};

/* ═══════════════════════════ CATEGORIES ═══════════════════════════ */
const CATS=[
  {id:"accommodation", tKey:"cat0", icon:"🏨", defaults:[]},
  {id:"transport",     tKey:"cat1", icon:"🚌", defaults:["Tiền xe","Tiền tips tài xế","Tiền qua đêm tài xế","Tiền ăn tài xế","Tiền nước suối"]},
  {id:"attractions",   tKey:"cat2", icon:"🎫", defaults:[]},
  {id:"guide",         tKey:"cat3", icon:"🧭", defaults:["Công tác phí HDV","Tiền tips HDV","Tiền qua đêm HDV","Tiền ăn HDV","Tiền xe HDV"]},
  {id:"restaurant",    tKey:"cat4", icon:"🍽️", defaults:[]},
  {id:"other",         tKey:"cat5", icon:"⚙️", defaults:[]},
];

/* ═══════════════════════════ PRESET TEMPLATES ═══════════════════════════ */
const TAG_COLORS={"City Tour":{bg:"#e8f0fe",color:"#1a4caf"},"Biển":{bg:"#e0f7fa",color:"#00697a"},
  "Trekking":{bg:"#e8f5e9",color:"#256025"},"MICE":{bg:"#fce4ec",color:"#a0002a"},
  "Honeymoon":{bg:"#fce8f6",color:"#8a0060"},"Gia đình":{bg:"#fff3e0",color:"#8a4700"},"Của tôi":{bg:"#f3e8ff",color:"#5a00a0"}};

const PRESET_TEMPLATES=[
  {id:"p1",preset:true,name:"City Tour 2N1Đ",tag:"City Tour",desc:"Tour nội thành HCM / Hà Nội / Đà Nẵng.",cfg:{markup:15,vat:0,discount:0},cats:[
    {id:"accommodation",services:[{name:"Khách sạn 2 sao (1 đêm)",qty:1,unitPrice:450000,times:1,note:"",currency:"VND"}]},
    {id:"transport",services:[{name:"Xe đưa đón sân bay",qty:1,unitPrice:350000,times:2,note:"",currency:"VND"},{name:"Xe du lịch 16 chỗ",qty:1,unitPrice:1800000,times:1,note:"",currency:"VND"},{name:"Tiền tips tài xế",qty:1,unitPrice:100000,times:1,note:"",currency:"VND"},{name:"Nước suối",qty:1,unitPrice:10000,times:2,note:"",currency:"VND"}]},
    {id:"attractions",services:[{name:"Vé tham quan điểm 1",qty:1,unitPrice:80000,times:1,note:"",currency:"VND"},{name:"Vé tham quan điểm 2",qty:1,unitPrice:60000,times:1,note:"",currency:"VND"}]},
    {id:"guide",services:[{name:"Công tác phí HDV",qty:1,unitPrice:400000,times:1,note:"",currency:"VND"},{name:"Tiền tips HDV",qty:1,unitPrice:100000,times:1,note:"",currency:"VND"},{name:"Tiền ăn HDV",qty:1,unitPrice:80000,times:2,note:"",currency:"VND"}]},
    {id:"restaurant",services:[{name:"Bữa trưa (set menu)",qty:1,unitPrice:120000,times:1,note:"",currency:"VND"},{name:"Bữa tối đặc sản",qty:1,unitPrice:180000,times:1,note:"",currency:"VND"}]},
    {id:"other",services:[{name:"Bảo hiểm du lịch",qty:1,unitPrice:25000,times:1,note:"",currency:"VND"}]},
  ]},
  {id:"p2",preset:true,name:"Beach Resort 3N2Đ",tag:"Biển",desc:"Phú Quốc / Nha Trang / Đà Nẵng.",cfg:{markup:18,vat:0,discount:0},cats:[
    {id:"accommodation",services:[{name:"Resort 3 sao (2 đêm)",qty:1,unitPrice:1200000,times:2,note:"",currency:"VND"}]},
    {id:"transport",services:[{name:"Vé máy bay khứ hồi",qty:1,unitPrice:95,times:1,note:"",currency:"USD"},{name:"Xe đưa đón sân bay",qty:1,unitPrice:300000,times:2,note:"",currency:"VND"},{name:"Tiền tips tài xế",qty:1,unitPrice:100000,times:1,note:"",currency:"VND"}]},
    {id:"attractions",services:[{name:"Tour đảo (4 đảo)",qty:1,unitPrice:350000,times:1,note:"",currency:"VND"},{name:"Vé cáp treo",qty:1,unitPrice:400000,times:1,note:"",currency:"VND"}]},
    {id:"guide",services:[{name:"Công tác phí HDV",qty:1,unitPrice:400000,times:3,note:"",currency:"VND"},{name:"Tiền qua đêm HDV",qty:1,unitPrice:300000,times:2,note:"",currency:"VND"}]},
    {id:"restaurant",services:[{name:"Bữa sáng tại resort",qty:1,unitPrice:80000,times:2,note:"",currency:"VND"},{name:"Bữa trưa hải sản",qty:1,unitPrice:10,times:2,note:"",currency:"USD"}]},
    {id:"other",services:[{name:"Bảo hiểm du lịch",qty:1,unitPrice:35000,times:1,note:"",currency:"VND"}]},
  ]},
  {id:"p3",preset:true,name:"Trekking Núi 4N3Đ",tag:"Trekking",desc:"Sapa / Hà Giang / Đà Lạt. Homestay, HDV bản địa.",cfg:{markup:20,vat:0,discount:0},cats:[
    {id:"accommodation",services:[{name:"Homestay (2 đêm)",qty:1,unitPrice:350000,times:2,note:"",currency:"VND"},{name:"Khách sạn trung tâm (1 đêm)",qty:1,unitPrice:600000,times:1,note:"",currency:"VND"}]},
    {id:"transport",services:[{name:"Xe giường nằm đêm",qty:1,unitPrice:350000,times:2,note:"",currency:"VND"},{name:"Xe địa phương",qty:1,unitPrice:800000,times:3,note:"",currency:"VND"}]},
    {id:"attractions",services:[{name:"Vé vào Bản Cát Cát",qty:1,unitPrice:70000,times:1,note:"",currency:"VND"},{name:"Cáp treo Fansipan",qty:1,unitPrice:750000,times:1,note:"",currency:"VND"}]},
    {id:"guide",services:[{name:"Công tác phí HDV",qty:1,unitPrice:400000,times:4,note:"",currency:"VND"},{name:"HDV bản địa",qty:1,unitPrice:500000,times:2,note:"",currency:"VND"},{name:"Tiền qua đêm HDV",qty:1,unitPrice:200000,times:3,note:"",currency:"VND"}]},
    {id:"restaurant",services:[{name:"Cơm địa phương",qty:1,unitPrice:120000,times:3,note:"",currency:"VND"},{name:"Lẩu đặc sản",qty:1,unitPrice:200000,times:1,note:"",currency:"VND"}]},
    {id:"other",services:[{name:"Thuê đồ leo núi",qty:1,unitPrice:100000,times:1,note:"",currency:"VND"},{name:"Bảo hiểm du lịch",qty:1,unitPrice:45000,times:1,note:"",currency:"VND"}]},
  ]},
  {id:"p4",preset:true,name:"MICE / Team Building",tag:"MICE",desc:"Hội nghị, teambuilding doanh nghiệp. Resort 4 sao.",cfg:{markup:20,vat:8,discount:0},cats:[
    {id:"accommodation",services:[{name:"Resort 4 sao (2 đêm)",qty:1,unitPrice:2200000,times:2,note:"",currency:"VND"},{name:"Phòng họp (full day)",qty:1,unitPrice:200,times:1,note:"",currency:"USD"}]},
    {id:"transport",services:[{name:"Xe đoàn 45 chỗ",qty:1,unitPrice:4500000,times:1,note:"",currency:"VND"},{name:"Tiền tips tài xế",qty:1,unitPrice:150000,times:1,note:"",currency:"VND"}]},
    {id:"attractions",services:[{name:"Hoạt động teambuilding",qty:1,unitPrice:350000,times:1,note:"",currency:"VND"},{name:"Gala dinner / Tiệc bế mạc",qty:1,unitPrice:500000,times:1,note:"",currency:"VND"}]},
    {id:"guide",services:[{name:"Điều phối viên chương trình",qty:2,unitPrice:800000,times:1,note:"",currency:"VND"},{name:"MC sự kiện",qty:1,unitPrice:2000000,times:1,note:"",currency:"VND"}]},
    {id:"restaurant",services:[{name:"Buffet sáng",qty:1,unitPrice:150000,times:2,note:"",currency:"VND"},{name:"Coffee break",qty:1,unitPrice:80000,times:4,note:"",currency:"VND"}]},
    {id:"other",services:[{name:"Âm thanh & ánh sáng",qty:1,unitPrice:8000000,times:1,note:"",currency:"VND"},{name:"Quà lưu niệm",qty:1,unitPrice:200000,times:1,note:"",currency:"VND"}]},
  ]},
  {id:"p5",preset:true,name:"Honeymoon 3N2Đ",tag:"Honeymoon",desc:"Trăng mật lãng mạn. Suite, bữa tối nến, spa cặp đôi.",cfg:{markup:22,vat:0,discount:0},cats:[
    {id:"accommodation",services:[{name:"Honeymoon Suite (2 đêm)",qty:1,unitPrice:3500000,times:2,note:"",currency:"VND"},{name:"Hoa tươi trang trí phòng",qty:1,unitPrice:500000,times:1,note:"",currency:"VND"}]},
    {id:"transport",services:[{name:"Xe đưa đón VIP",qty:1,unitPrice:800000,times:2,note:"",currency:"VND"},{name:"Tiền tips tài xế",qty:1,unitPrice:150000,times:1,note:"",currency:"VND"}]},
    {id:"attractions",services:[{name:"Vé tham quan cặp đôi",qty:2,unitPrice:150000,times:1,note:"",currency:"VND"},{name:"Chụp ảnh cưới ngoại cảnh",qty:1,unitPrice:120,times:1,note:"",currency:"USD"}]},
    {id:"guide",services:[{name:"Công tác phí HDV",qty:1,unitPrice:400000,times:3,note:"",currency:"VND"},{name:"Tiền tips HDV",qty:1,unitPrice:200000,times:1,note:"",currency:"VND"}]},
    {id:"restaurant",services:[{name:"Bữa tối lãng mạn (nến)",qty:2,unitPrice:600000,times:1,note:"",currency:"VND"},{name:"Champagne / Rượu vang",qty:1,unitPrice:500000,times:1,note:"",currency:"VND"}]},
    {id:"other",services:[{name:"Spa cặp đôi (60 phút)",qty:2,unitPrice:600000,times:1,note:"",currency:"VND"},{name:"Bảo hiểm du lịch",qty:2,unitPrice:35000,times:1,note:"",currency:"VND"}]},
  ]},
  {id:"p6",preset:true,name:"Gia Đình 4N3Đ",tag:"Gia đình",desc:"Thân thiện trẻ em. Công viên, bãi biển, ẩm thực.",cfg:{markup:15,vat:0,discount:5},cats:[
    {id:"accommodation",services:[{name:"Khách sạn 3 sao 2 phòng (3 đêm)",qty:2,unitPrice:900000,times:3,note:"",currency:"VND"}]},
    {id:"transport",services:[{name:"Xe du lịch 7 chỗ",qty:1,unitPrice:2200000,times:3,note:"",currency:"VND"},{name:"Tiền tips tài xế",qty:1,unitPrice:100000,times:1,note:"",currency:"VND"}]},
    {id:"attractions",services:[{name:"Vé công viên (NL)",qty:1,unitPrice:350000,times:1,note:"",currency:"VND"},{name:"Vé công viên (TE)",qty:1,unitPrice:250000,times:1,note:"",currency:"VND"}]},
    {id:"guide",services:[{name:"Công tác phí HDV",qty:1,unitPrice:400000,times:4,note:"",currency:"VND"},{name:"Tiền qua đêm HDV",qty:1,unitPrice:300000,times:3,note:"",currency:"VND"}]},
    {id:"restaurant",services:[{name:"Bữa trưa (set gia đình)",qty:1,unitPrice:150000,times:3,note:"",currency:"VND"},{name:"Bữa tối đặc sản",qty:1,unitPrice:200000,times:2,note:"",currency:"VND"}]},
    {id:"other",services:[{name:"Bảo hiểm du lịch (NL)",qty:1,unitPrice:35000,times:1,note:"",currency:"VND"},{name:"Bảo hiểm du lịch (TE)",qty:1,unitPrice:35000,times:1,note:"",currency:"VND"}]},
  ]},
];

/* ═══════════════════════════ HELPERS ═══════════════════════════ */
let _sid=500;
const uid=()=>++_sid;
const mkS=(name="")=>({id:uid(),name,qty:1,unitPrice:0,times:1,note:"",currency:"VND"});
const initCats=()=>CATS.map(c=>({...c,services:c.defaults.map(mkS),open:true}));
const num=v=>{const n=parseFloat(String(v).replace(/[^\d.-]/g,""));return isNaN(n)?0:n;};
const stotVND=(s,rates)=>toVND(num(s.qty)*num(s.unitPrice)*num(s.times),s.currency||"VND",rates);
const calcFinal=(cats,cfg,rates)=>{
  const base=cats.reduce((s,c)=>s+c.services.reduce((x,sv)=>x+stotVND(sv,rates),0),0);
  return Math.round(base*(1-cfg.discount/100)*(1+cfg.markup/100)*(1+cfg.vat/100));
};
const hydrateCats=tplCats=>CATS.map(cat=>{
  const tc=tplCats.find(c=>c.id===cat.id);
  return{...cat,open:true,services:(tc?.services||[]).map(s=>({...s,id:uid(),currency:s.currency||"VND"}))};
});
const freshCats=cats=>cats.map(c=>({...c,services:c.services.map(s=>({...s,id:uid()}))}));

/* ── BUILD QUOTE JSON để gửi sang TravelMaster-Core ── */
const buildQuoteJSON = (info, cats, cfg, rates) => {
  return {
    quote_id: info.tourCode || `QT-${Date.now()}`,
    confirmed_at: new Date().toISOString(),
    customer: {
      name:     info.clientName || "",
      phone:    "",                        // thêm field phone vào info nếu cần
      pax:      num(info.adults) + num(info.children),
      pax_detail: {
        adult: num(info.adults),
        child: num(info.children),
      },
    },
    tour: {
      name:        info.tourName || "",
      start_date:  info.startDate || "",
      end_date:    info.endDate   || "",
      destination: info.tourName  || "",   // hoặc thêm field destination riêng
      prepared_by: info.preparedBy || "",
      notes:       info.notes || "",
    },
    services: cats.flatMap(cat =>
      cat.services
        .filter(s => s.name && num(s.qty) > 0)
        .map(s => ({
          category:   cat.id,              // "accommodation", "transport", v.v.
          type:       cat.id,
          name:       s.name,
          qty:        num(s.qty),
          unit_price: num(s.unitPrice),
          currency:   s.currency || "VND",
          unit_price_vnd: toVND(num(s.unitPrice), s.currency || "VND", rates),
          times:      num(s.times),
          total_vnd:  stotVND(s, rates),
          note:       s.note || "",
        }))
    ),
    pricing: {
      base_cost_vnd:    Math.round(cats.reduce((s,c) => s + c.services.reduce((x,sv) => x + stotVND(sv,rates), 0), 0)),
      markup_pct:       num(cfg.markup),
      discount_pct:     num(cfg.discount),
      vat_pct:          num(cfg.vat),
      selling_price_vnd: calcFinal(cats, cfg, rates),
      display_currency: cfg.displayCur || "VND",
    },
  };
};

/* CSS builders */
const inp=(ex={})=>({border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 10px",fontSize:13,width:"100%",background:"#fafaf8",outline:"none",fontFamily:"inherit",color:C.text,...ex});
const thS=(ex={})=>({background:C.creamD,color:C.navy,fontWeight:600,padding:"9px 12px",textAlign:"left",borderBottom:`2px solid ${C.border}`,fontSize:11,textTransform:"uppercase",letterSpacing:.4,...ex});
const tdS=(ex={})=>({padding:"8px 12px",borderBottom:`1px solid ${C.border}`,verticalAlign:"middle",...ex});

/* ═══════════════════════════ STORAGE ═══════════════════════════ */
const IDX_KEY="tqpro:idx";const TIDX_KEY="tqpro:tidx";
const qKey=id=>`tqpro:q:${id}`;const tKey=id=>`tqpro:t:${id}`;
const loadIdx =async()=>{try{const r=await window.storage.get(IDX_KEY);return r?JSON.parse(r.value):[]}catch{return[]}};
const saveIdx =async l=>{try{await window.storage.set(IDX_KEY,JSON.stringify(l))}catch{}};
const loadQ   =async id=>{try{const r=await window.storage.get(qKey(id));return r?JSON.parse(r.value):null}catch{return null}};
const deleteQ =async id=>{try{await window.storage.delete(qKey(id))}catch{}};
const loadTIdx=async()=>{try{const r=await window.storage.get(TIDX_KEY);return r?JSON.parse(r.value):[]}catch{return[]}};
const saveTIdx=async l=>{try{await window.storage.set(TIDX_KEY,JSON.stringify(l))}catch{}};
const loadT   =async id=>{try{const r=await window.storage.get(tKey(id));return r?JSON.parse(r.value):null}catch{return null}};
const deleteT =async id=>{try{await window.storage.delete(tKey(id))}catch{}};

/* ═══════════════════════════ ATOMS ═══════════════════════════ */
function Confirm({emoji="🗑️",title,msg,onOk,onCancel,okLabel,okColor=C.red}){
  return<div className="mov" onClick={onCancel}><div className="mbox" onClick={e=>e.stopPropagation()} style={{textAlign:"center"}}>
    <div style={{fontSize:38,marginBottom:10}}>{emoji}</div>
    <div style={{fontSize:15,color:C.text,fontWeight:700,marginBottom:6}}>{title}</div>
    <div style={{fontSize:13,color:C.mut,marginBottom:22,lineHeight:1.7}}>{msg}</div>
    <div style={{display:"flex",gap:10,justifyContent:"center"}}>
      <button onClick={onCancel} style={{padding:"9px 22px",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer",background:"white",color:C.text,fontSize:13,fontWeight:600,fontFamily:"inherit"}}>Cancel</button>
      <button onClick={onOk} style={{padding:"9px 22px",borderRadius:8,border:"none",cursor:"pointer",background:okColor,color:"white",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>{okLabel}</button>
    </div>
  </div></div>;
}

function TagPill({tag}){
  const s=TAG_COLORS[tag]||{bg:"#f0f0f0",color:"#555"};
  return<span className="tag" style={{background:s.bg,color:s.color}}>{tag}</span>;
}

/* ═══════════════════════════ TEMPLATE DRAWER ═══════════════════════════ */
function TemplateDrawer({onClose,onApply,curCats,curCfg,rates,toast,t}){
  const [tab,setTab]=useState("preset");
  const [myList,setMyList]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [showSaveForm,setShowSaveForm]=useState(false);
  const [tName,setTName]=useState("");const [tTag,setTTag]=useState("Của tôi");const [tDesc,setTDesc]=useState("");
  const [saving,setSaving]=useState(false);
  const [confirmDel,setConfirmDel]=useState(null);
  const [previewId,setPreviewId]=useState(null);

  useEffect(()=>{loadTIdx().then(r=>{setMyList(r);setLoading(false);});},[]);

  const countSvcs=tc=>tc.reduce((s,c)=>s+c.services.length,0);
  const nonEmpty=tc=>tc.filter(c=>c.services.length>0);

  const doSaveTpl=async()=>{
    if(!tName.trim()) return toast(t("tTplName"));
    setSaving(true);
    const id=Date.now().toString();
    const meta={id,name:tName.trim(),tag:tTag,desc:tDesc.trim(),createdAt:new Date().toISOString(),svcCount:countSvcs(curCats)};
    try{
      await window.storage.set(tKey(id),JSON.stringify({name:tName.trim(),tag:tTag,desc:tDesc.trim(),cats:curCats,cfg:curCfg,createdAt:meta.createdAt}));
      const idx=await loadTIdx();idx.unshift(meta);await saveTIdx(idx);setMyList(idx);
      toast(t("tTplSaved")); setShowSaveForm(false);setTName("");setTDesc("");setTab("mine");
    }catch{toast(t("tErr"));}
    setSaving(false);
  };

  const doApplyPreset=tpl=>{onApply(hydrateCats(tpl.cats),tpl.cfg);toast(t("tTplApplied"));onClose();};
  const doApplyUser=async id=>{
    const data=await loadT(id);if(!data) return toast(t("tNotFound"));
    onApply(hydrateCats(data.cats),data.cfg);toast(t("tTplApplied"));onClose();
  };
  const doDelete=async id=>{
    await deleteT(id);const idx=await loadTIdx();const upd=idx.filter(x=>x.id!==id);
    await saveTIdx(upd);setMyList(upd);setConfirmDel(null);toast(t("tTplDel"));
  };

  const fmtDt=iso=>{try{return new Date(iso).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"});}catch{return iso;}};
  const filtP=PRESET_TEMPLATES.filter(x=>x.name.toLowerCase().includes(search.toLowerCase())||x.tag.toLowerCase().includes(search.toLowerCase()));
  const filtM=myList.filter(x=>(x.name||"").toLowerCase().includes(search.toLowerCase())||(x.tag||"").toLowerCase().includes(search.toLowerCase()));

  const PreviewCard=({tplCats,cfg})=>(
    <div style={{padding:"12px 14px",background:"#fafaf8",borderRadius:8,border:`1px solid ${C.border}`,marginTop:10}}>
      <div style={{fontSize:11,color:C.mut,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>{t("tplDetail")}</div>
      {nonEmpty(tplCats).map(c=>{
        const cat=CATS.find(x=>x.id===c.id)||{icon:"",tKey:"cat5"};
        return<div key={c.id} style={{marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700,color:C.navy,marginBottom:4}}>{cat.icon} {t(cat.tKey)}</div>
          {c.services.map((s,i)=><div key={i} style={{fontSize:12,color:C.mut,paddingLeft:18,lineHeight:1.7}}>
            · {s.name}{s.unitPrice>0?<span style={{color:C.gold,marginLeft:6}}>{fmtAmt(s.unitPrice,s.currency||"VND")}</span>:null}
          </div>)}
        </div>;
      })}
      <div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${C.border}`,fontSize:12,color:C.mut,display:"flex",gap:16,flexWrap:"wrap"}}>
        <span>Markup: <b style={{color:C.navy}}>{cfg.markup}%</b></span>
        {cfg.vat>0&&<span>VAT: <b style={{color:C.navy}}>{cfg.vat}%</b></span>}
        {cfg.discount>0&&<span style={{color:C.green}}>CK: <b>{cfg.discount}%</b></span>}
      </div>
    </div>
  );

  function UserPreview({id}){
    const [data,setData]=useState(null);
    useEffect(()=>{loadT(id).then(setData);},[id]);
    if(!data) return<div style={{padding:"12px",color:"#bbb",fontSize:12}}>{t("loading")}</div>;
    return<div style={{padding:"12px 16px"}}><PreviewCard tplCats={data.cats} cfg={data.cfg}/></div>;
  }

  const CardActions=({onApply,id,isPreview,onTogglePreview,onDelete})=>(
    <div style={{display:"flex",gap:7,marginTop:10}}>
      <button onClick={onApply} style={{flex:1,padding:"8px 0",borderRadius:7,border:"none",cursor:"pointer",background:C.navy,color:"white",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>{t("btnApply")}</button>
      <button onClick={onTogglePreview} style={{padding:"8px 14px",borderRadius:7,border:`1px solid ${C.border}`,cursor:"pointer",background:isPreview?"#f0f0f0":"white",color:C.navy,fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{isPreview?t("btnHide"):t("btnPreview")}</button>
      {onDelete&&<button onClick={onDelete} style={{padding:"8px 11px",borderRadius:7,border:"1px solid #ffc0c0",cursor:"pointer",background:"#fff5f5",color:C.red,fontSize:13,fontWeight:700}}>🗑️</button>}
    </div>
  );

  return<>
    <div className="ov" onClick={onClose}/>
    <div className="dr" style={{fontFamily:"inherit"}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.dark})`,padding:"18px 20px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:700,color:C.goldL}}>{t("tplTitle")}</div>
            <div style={{color:"#8ab4c4",fontSize:11,marginTop:3}}>{PRESET_TEMPLATES.length} preset · {myList.length} {t("tplMine").replace("🎨 ","")}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.12)",border:"none",color:C.goldL,width:34,height:34,borderRadius:8,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
        </div>
        {!showSaveForm
          ?<button onClick={()=>setShowSaveForm(true)} style={{width:"100%",padding:"10px",borderRadius:10,border:"2px dashed rgba(232,213,163,.5)",background:"rgba(255,255,255,.07)",color:C.goldL,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{t("btnSaveTpl")}</button>
          :<div style={{background:"rgba(255,255,255,.09)",borderRadius:10,padding:"14px",border:"1px solid rgba(232,213,163,.3)"}}>
            <div style={{fontSize:12,color:C.goldL,fontWeight:700,marginBottom:10}}>💾 {t("btnConfirmSaveTpl")}</div>
            <input style={{...inp({marginBottom:8,background:"rgba(255,255,255,.12)",border:"1px solid rgba(232,213,163,.3)",color:"white"})}} placeholder={t("tplNamePH")} value={tName} onChange={e=>setTName(e.target.value)}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <select value={tTag} onChange={e=>setTTag(e.target.value)} style={{...inp({background:"rgba(255,255,255,.12)",border:"1px solid rgba(232,213,163,.3)",color:"white"})}}>
                {Object.keys(TAG_COLORS).filter(k=>k!=="Của tôi").concat(["Của tôi"]).map(x=><option key={x} value={x} style={{color:C.text,background:"white"}}>{x}</option>)}
              </select>
              <input style={{...inp({background:"rgba(255,255,255,.12)",border:"1px solid rgba(232,213,163,.3)",color:"white"})}} placeholder={t("tplDescPH")} value={tDesc} onChange={e=>setTDesc(e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={doSaveTpl} disabled={saving} style={{flex:1,padding:"8px",borderRadius:8,border:"none",cursor:saving?"not-allowed":"pointer",background:C.gold,color:"white",fontSize:13,fontWeight:700,fontFamily:"inherit"}}>{saving?t("tplSaving"):t("btnConfirmSaveTpl")}</button>
              <button onClick={()=>setShowSaveForm(false)} style={{padding:"8px 14px",borderRadius:8,border:"1px solid rgba(232,213,163,.3)",cursor:"pointer",background:"transparent",color:C.goldL,fontSize:13,fontFamily:"inherit"}}>{t("btnCancel")}</button>
            </div>
          </div>}
      </div>
      {/* Search */}
      <div style={{padding:"10px 16px",background:"#fafaf8",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <input style={inp({paddingLeft:32,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2.5'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"9px center",backgroundSize:"14px"})} placeholder={t("searchPH")} value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      {/* Tabs */}
      <div className="tab-bar" style={{padding:"0 16px",background:"white",flexShrink:0}}>
        <button className={`tab ${tab==="preset"?"on":""}`} onClick={()=>setTab("preset")}>{t("tplPreset")} <span style={{background:C.creamD,color:C.mut,padding:"1px 6px",borderRadius:20,fontSize:10,fontWeight:700,marginLeft:4}}>{PRESET_TEMPLATES.length}</span></button>
        <button className={`tab ${tab==="mine"?"on":""}`} onClick={()=>setTab("mine")}>{t("tplMine")} <span style={{background:C.creamD,color:C.mut,padding:"1px 6px",borderRadius:20,fontSize:10,fontWeight:700,marginLeft:4}}>{myList.length}</span></button>
      </div>
      {/* Body */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px",fontFamily:"inherit"}}>
        {tab==="preset"&&(filtP.length===0
          ?<div style={{textAlign:"center",padding:"40px",color:C.mut}}>{t("noResult")}</div>
          :filtP.map(tpl=>{
            const isPrev=previewId===tpl.id;
            return<div key={tpl.id} className="tc">
              <div style={{padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,color:C.navy,fontSize:14}}>{tpl.name}</span>
                      <span className="preset-badge">{t("presetLabel")}</span>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
                      <TagPill tag={tpl.tag}/><span style={{fontSize:11,color:C.mut}}>{countSvcs(tpl.cats)} {t("tplSvcCount")} · Markup {tpl.cfg.markup}%{tpl.cfg.vat>0?` · VAT ${tpl.cfg.vat}%`:""}</span>
                    </div>
                    {tpl.desc&&<div style={{fontSize:12,color:C.mut,lineHeight:1.6,marginBottom:8}}>{tpl.desc}</div>}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {tpl.cats.filter(c=>c.services.length>0).map(c=>{
                        const cat=CATS.find(x=>x.id===c.id)||{icon:"",tKey:"cat5"};
                        return<span key={c.id} style={{fontSize:11,background:C.creamD,color:C.navy,padding:"3px 9px",borderRadius:20,fontWeight:600}}>{cat.icon} {t(cat.tKey)} ({c.services.length})</span>;
                      })}
                    </div>
                  </div>
                </div>
                <CardActions onApply={()=>doApplyPreset(tpl)} id={tpl.id} isPreview={isPrev} onTogglePreview={()=>setPreviewId(isPrev?null:tpl.id)}/>
              </div>
              {isPrev&&<div style={{padding:"0 16px 14px"}}><PreviewCard tplCats={tpl.cats} cfg={tpl.cfg}/></div>}
            </div>;
          })
        )}
        {tab==="mine"&&(loading
          ?<div style={{textAlign:"center",padding:"48px",color:C.mut}}>{t("loading")}</div>
          :filtM.length===0
            ?<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:40,marginBottom:12}}>{myList.length===0?"🎨":"🔍"}</div><div style={{fontSize:14,color:C.mut,fontWeight:600}}>{myList.length===0?t("noTpl"):t("noResult")}</div><div style={{fontSize:12,color:"#bbb",marginTop:6}}>{myList.length===0?t("noTplH"):t("tryOther")}</div></div>
            :filtM.map(meta=>{
              const isPrev=previewId===meta.id;
              return<div key={meta.id} className="tc">
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontWeight:700,color:C.navy,fontSize:14,marginBottom:6}}>{meta.name}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:6}}>
                    <TagPill tag={meta.tag||"Của tôi"}/>
                    <span style={{fontSize:11,color:C.mut}}>🕐 {fmtDt(meta.createdAt)} · {meta.svcCount} {t("tplSvcCount")}</span>
                  </div>
                  {meta.desc&&<div style={{fontSize:12,color:C.mut,lineHeight:1.6,marginBottom:8}}>{meta.desc}</div>}
                  <CardActions onApply={()=>doApplyUser(meta.id)} id={meta.id} isPreview={isPrev} onTogglePreview={()=>setPreviewId(isPrev?null:meta.id)} onDelete={()=>setConfirmDel({id:meta.id,name:meta.name})}/>
                </div>
                {isPrev&&<UserPreview id={meta.id}/>}
              </div>;
            })
        )}
      </div>
      <div style={{padding:"9px 16px",borderTop:`1px solid ${C.border}`,fontSize:11,color:"#bbb",textAlign:"center",flexShrink:0,background:"#fafaf8"}}>{t("tplFoot")}</div>
    </div>
    {confirmDel&&<Confirm title={t("btnDelete")} msg={`"${confirmDel.name}" — ${t("confirmDeleteMsg")}`} okLabel={t("btnDelete")} onOk={()=>doDelete(confirmDel.id)} onCancel={()=>setConfirmDel(null)}/>}
  </>;
}

/* ═══════════════════════════ SAVED DRAWER ═══════════════════════════ */
function SavedDrawer({onClose,onLoad,curInfo,curCats,curCfg,rates,toast,t}){
  const [list,setList]=useState([]);const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");const [saving,setSaving]=useState(false);
  const [confirmDel,setConfirmDel]=useState(null);

  useEffect(()=>{loadIdx().then(r=>{setList(r);setLoading(false);});},[]);

  const doSave=async()=>{
    setSaving(true);const id=Date.now().toString();
    const meta={id,savedAt:new Date().toISOString(),tourName:curInfo.tourName||"(Chưa đặt tên)",tourCode:curInfo.tourCode||"",clientName:curInfo.clientName||"",startDate:curInfo.startDate||"",endDate:curInfo.endDate||"",total:calcFinal(curCats,curCfg,rates),pax:num(curInfo.adults)+num(curInfo.children)};
    try{
      await window.storage.set(qKey(id),JSON.stringify({info:curInfo,cats:curCats,cfg:curCfg}));
      const idx=await loadIdx();idx.unshift(meta);await saveIdx(idx);setList(idx);toast(t("tSaved"));
    }catch{toast(t("tErr"));}
    setSaving(false);
  };
  const doLoad=async id=>{const data=await loadQ(id);if(!data) return toast(t("tNotFound"));onLoad(data);toast(t("tLoaded"));onClose();};
  const doDup=async id=>{
    const data=await loadQ(id);if(!data) return toast(t("tNotFound"));
    const newId=Date.now().toString();const newCats=freshCats(data.cats);const newInfo={...data.info,tourName:"[Copy] "+data.info.tourName,tourCode:""};
    const meta={id:newId,savedAt:new Date().toISOString(),tourName:"[Copy] "+data.info.tourName,tourCode:"",clientName:data.info.clientName||"",startDate:data.info.startDate||"",endDate:data.info.endDate||"",total:calcFinal(newCats,data.cfg,rates),pax:num(data.info.adults)+num(data.info.children)};
    await window.storage.set(qKey(newId),JSON.stringify({info:newInfo,cats:newCats,cfg:data.cfg}));
    const idx=await loadIdx();idx.unshift(meta);await saveIdx(idx);setList(idx);toast(t("tDup"));
  };
  const doDelete=async id=>{
    await deleteQ(id);const idx=await loadIdx();const upd=idx.filter(q=>q.id!==id);await saveIdx(upd);setList(upd);setConfirmDel(null);toast(t("tDelQ"));
  };

  const filtered=list.filter(q=>q.tourName.toLowerCase().includes(search.toLowerCase())||(q.tourCode||"").toLowerCase().includes(search.toLowerCase())||(q.clientName||"").toLowerCase().includes(search.toLowerCase()));
  const fmtDt=iso=>{try{return new Date(iso).toLocaleString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});}catch{return iso;}};

  return<>
    <div className="ov" onClick={onClose}/>
    <div className="dr" style={{fontFamily:"inherit"}}>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.dark})`,padding:"18px 20px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:C.goldL}}>{t("savedTitle")}</div>
            <div style={{color:"#8ab4c4",fontSize:11,marginTop:2}}>{list.length} {t("savedCount")}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.12)",border:"none",color:C.goldL,width:34,height:34,borderRadius:8,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <button onClick={doSave} disabled={saving} style={{width:"100%",padding:"11px",borderRadius:10,border:`2px solid ${C.gold}`,background:saving?"rgba(201,150,42,.25)":C.gold,color:"white",fontSize:14,fontWeight:700,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {saving?t("tplSaving"):t("btnSaveCur")}
        </button>
      </div>
      <div style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,flexShrink:0,background:"#fafaf8"}}>
        <input style={inp({paddingLeft:32,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2.5'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"9px center",backgroundSize:"14px"})} placeholder={t("searchPH")} value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 14px"}}>
        {loading&&<div style={{textAlign:"center",padding:"48px",color:C.mut}}>{t("loading")}</div>}
        {!loading&&filtered.length===0&&<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:40,marginBottom:12}}>{list.length===0?"📭":"🔍"}</div><div style={{fontSize:14,color:C.mut,fontWeight:600}}>{list.length===0?t("noSaved"):t("noResult")}</div><div style={{fontSize:12,color:"#bbb",marginTop:6}}>{list.length===0?t("noSavedH"):t("tryOther")}</div></div>}
        {filtered.map(q=><div key={q.id} className="qc">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:7}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:C.navy,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:5}}>{q.tourName}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {q.tourCode&&<span style={{fontSize:11,background:C.creamD,color:C.mut,padding:"2px 8px",borderRadius:20,fontWeight:600}}>{q.tourCode}</span>}
                {q.clientName&&<span style={{fontSize:11,background:"#e8f4e8",color:"#256025",padding:"2px 8px",borderRadius:20,fontWeight:600}}>👤 {q.clientName}</span>}
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{color:C.gold,fontWeight:800,fontSize:14,whiteSpace:"nowrap"}}>{fmtAmt(q.total,"VND")}</div>
              {q.pax>0&&<div style={{fontSize:11,color:C.mut}}>{q.pax} pax</div>}
            </div>
          </div>
          <div style={{fontSize:11,color:"#aaa",marginBottom:11}}>🕐 {fmtDt(q.savedAt)}{q.startDate&&<span style={{marginLeft:10}}>📅 {q.startDate}{q.endDate&&" → "+q.endDate}</span>}</div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>doLoad(q.id)} style={{flex:1,padding:"7px 0",borderRadius:7,border:"none",cursor:"pointer",background:C.navy,color:"white",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{t("btnLoad")}</button>
            <button onClick={()=>doDup(q.id)} style={{flex:1,padding:"7px 0",borderRadius:7,border:`1px solid ${C.border}`,cursor:"pointer",background:"white",color:C.navy,fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{t("btnDup")}</button>
            <button onClick={()=>setConfirmDel({id:q.id,name:q.tourName})} style={{padding:"7px 11px",borderRadius:7,border:"1px solid #ffc0c0",cursor:"pointer",background:"#fff5f5",color:C.red,fontSize:13,fontWeight:700}}>🗑️</button>
          </div>
        </div>)}
      </div>
      <div style={{padding:"9px 16px",borderTop:`1px solid ${C.border}`,fontSize:11,color:"#bbb",textAlign:"center",flexShrink:0,background:"#fafaf8"}}>{t("savedFoot")}</div>
    </div>
    {confirmDel&&<Confirm title={t("btnDelete")} msg={`"${confirmDel.name}" — ${t("confirmDeleteMsg")}`} okLabel={t("btnDelete")} onOk={()=>doDelete(confirmDel.id)} onCancel={()=>setConfirmDel(null)}/>}
  </>;
}

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
export default function App(){
  const [lang,setLang]=useState("vi");
  const t=k=>LANG[lang]?.[k]||LANG.vi[k]||k;
  const fontFam=lang==="zh"?"'Noto Sans SC','DM Sans',sans-serif":"'DM Sans',sans-serif";

  const [info,setInfo]=useState({tourName:"",tourCode:"",clientName:"",startDate:"",endDate:"",adults:2,children:0,preparedBy:"",notes:""});
  const [cats,setCats]=useState(initCats());
  const [cfg,setCfg]=useState({markup:15,vat:0,discount:0,displayCur:"VND",rateUSD:25000,rateCNY:3500});
  const [panel,setPanel]=useState({info:true,cfg:false,cur:false});
  const [drawer,setDrawer]=useState(null);
  const [toast,setToast]=useState(null);const [toastKey,setToastKey]=useState(0);

  const rates=useMemo(()=>({USD:num(cfg.rateUSD)||25000,CNY:num(cfg.rateCNY)||3500}),[cfg.rateUSD,cfg.rateCNY]);
  const DC=cfg.displayCur||"VND";

  const showToast=msg=>{setToast(msg);setToastKey(k=>k+1);setTimeout(()=>setToast(null),2700);};
  const loadData=({info:i,cats:c,cfg:g})=>{setInfo(i);setCats(freshCats(c));setCfg(prev=>({...prev,...g}));setPanel({info:true,cfg:false,cur:false});};
  const applyTemplate=(newCats,newCfg)=>{setCats(newCats);setCfg(prev=>({...prev,...newCfg}));};

  const ui=(k,v)=>setInfo(p=>({...p,[k]:v}));
  const uc=(k,v)=>setCfg(p=>({...p,[k]:v}));
  const tog=id=>setCats(p=>p.map(c=>c.id===id?{...c,open:!c.open}:c));
  const add=id=>setCats(p=>p.map(c=>c.id===id?{...c,services:[...c.services,mkS()]}:c));
  const rm=(cid,sid)=>setCats(p=>p.map(c=>c.id===cid?{...c,services:c.services.filter(s=>s.id!==sid)}:c));
  const us=(cid,sid,k,v)=>setCats(p=>p.map(c=>c.id!==cid?c:{...c,services:c.services.map(s=>s.id!==sid?s:{...s,[k]:v})}));
  const handleConfirmAndExport = async () => {
  const payload = buildQuoteJSON(info, cats, cfg, rates);

  // API Key lưu trong .env của Vite (file .env ở root TourQuotePro)
  const API_KEY = import.meta.env.VITE_TRAVELMASTER_API_KEY;

  try {
    const res = await fetch(
      import.meta.env.VITE_TRAVELMASTER_URL + "/api/import-quote/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,           // ← Gửi key trong header
        },
        body: JSON.stringify(payload),
      }
    );
  const totals=useMemo(()=>cats.map(c=>({id:c.id,tKey:c.tKey,icon:c.icon,subVND:c.services.reduce((s,x)=>s+stotVND(x,rates),0)})),[cats,rates]);
  const baseVND=totals.reduce((s,c)=>s+c.subVND,0);
  const aDiscVND=baseVND*(1-cfg.discount/100);
  const aMarkupVND=aDiscVND*(1+cfg.markup/100);
  const aVatVND=aMarkupVND*(1+cfg.vat/100);
  const pax=num(info.adults)+num(info.children);
  const ppVND=pax>0?aVatVND/pax:0;

  // Display values in chosen currency
  const dv=vnd=>fromVND(vnd,DC,rates);
 }
};
  /* Excel export */
  const exportXlsx=useCallback(()=>{
    const wb=XLSX.utils.book_new();
    const r=[[t("xlsTitle")],[""],["Tour:",info.tourName,"Code:",info.tourCode],["Client:",info.clientName,"From:",info.startDate],["Adults:",info.adults,"To:",info.endDate],["Children:",info.children,"By:",info.preparedBy],[],[t("xlsCat"),"","",t("xlsAmt")+" ("+DC+")"]];
    totals.forEach(c=>r.push([c.icon+" "+t(c.tKey),"","",Number(dv(c.subVND).toFixed(2))]));
    r.push([],["Total Operating Cost","","",Number(dv(baseVND).toFixed(2))]);
    if(cfg.discount>0)r.push([`Discount (${cfg.discount}%)`,"","",Number(dv(-(baseVND-aDiscVND)).toFixed(2))]);
    r.push([`Profit (${cfg.markup}%)`,"","",Number(dv(aMarkupVND-aDiscVND).toFixed(2))]);
    if(cfg.vat>0)r.push([`VAT (${cfg.vat}%)`,"","",Number(dv(aVatVND-aMarkupVND).toFixed(2))]);
    r.push([t("sumFinal").replace("🎯 ",""),"","",Number(dv(aVatVND).toFixed(2))]);
    if(pax>0)r.push([`Per person (${pax} pax)`,"","",Number(dv(ppVND).toFixed(2))]);
    r.push(["","","","Currency: "+DC]);
    const ws=XLSX.utils.aoa_to_sheet(r);ws["!cols"]=[{wch:36},{wch:24},{wch:14},{wch:20}];
    XLSX.utils.book_append_sheet(wb,ws,"Summary");
    cats.forEach(cat=>{
      if(!cat.services.length)return;
      const cr=[[cat.icon+" "+t(cat.tKey).toUpperCase()],[],["#","Service","Qty","Unit Price","Currency","Times","Total (VND)","Note"]];
      cat.services.forEach((s,i)=>cr.push([i+1,s.name,num(s.qty),num(s.unitPrice),s.currency||"VND",num(s.times),stotVND(s,rates),s.note]));
      cr.push(["","TOTAL","","","","",cat.services.reduce((x,s)=>x+stotVND(s,rates),0),""]);
      const ws2=XLSX.utils.aoa_to_sheet(cr);ws2["!cols"]=[{wch:4},{wch:30},{wch:6},{wch:14},{wch:10},{wch:7},{wch:16},{wch:20}];
      XLSX.utils.book_append_sheet(wb,ws2,t(cat.tKey).slice(0,31));
    });
    XLSX.writeFile(wb,`Quote_${info.tourCode||"Tour"}_${new Date().toISOString().slice(0,10)}.xlsx`);
  },[cats,totals,info,cfg,rates,DC,baseVND,aDiscVND,aMarkupVND,aVatVND,ppVND,pax,t]);

  /* PDF export */
  const exportPDF=useCallback(()=>{
    const body=cats.map(cat=>{
      const subVND=cat.services.reduce((s,x)=>s+stotVND(x,rates),0);
      const rows=cat.services.map((s,i)=>{
        const tVND=stotVND(s,rates); const tDC=fromVND(tVND,DC,rates);
        const upDC=fromVND(toVND(num(s.unitPrice),s.currency||"VND",rates),DC,rates);
        return`<tr><td>${i+1}</td><td>${s.name||"—"}</td><td align="center">${s.qty}</td><td align="right">${fmtAmt(upDC,DC)}</td><td align="center">${s.times}</td><td align="right"><b>${fmtAmt(tDC,DC)}</b></td><td style="color:#666">${s.note}</td></tr>`;
      }).join("");
      return`<div style="mb:16px"><div style="background:#1a3a4a;color:#e8d5a3;padding:8px 12px;font-weight:700;border-radius:4px 4px 0 0">${cat.icon} ${t(cat.tKey)}</div><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#ede8dc"><th style="padding:6px 10px;border-bottom:2px solid #ccc;text-align:left">#</th><th style="padding:6px 10px;border-bottom:2px solid #ccc;text-align:left">${t("colService")}</th><th style="padding:6px 10px;border-bottom:2px solid #ccc">${t("colQty")}</th><th style="padding:6px 10px;border-bottom:2px solid #ccc;text-align:right">${t("colUnit")}</th><th style="padding:6px 10px;border-bottom:2px solid #ccc">${t("colTimes")}</th><th style="padding:6px 10px;border-bottom:2px solid #ccc;text-align:right">${t("colTotal")} (${DC})</th><th style="padding:6px 10px;border-bottom:2px solid #ccc">${t("colNote")}</th></tr></thead><tbody>${rows}</tbody><tfoot><tr style="background:#faf8f2"><td colspan="5" align="right" style="padding:7px 10px;font-weight:700">${t("subTotal")}:</td><td align="right" style="padding:7px 10px;font-weight:700;color:#c9962a">${fmtAmt(fromVND(subVND,DC,rates),DC)}</td><td></td></tr></tfoot></table></div>`;
    }).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${t("pdfTitle")} - ${info.tourName}</title><style>@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=Noto+Sans+SC:wght@400;600&display=swap');body{font-family:'DM Sans','Noto Sans SC',sans-serif;font-size:12px;padding:20px;max-width:900px;margin:0 auto}h1{font-size:19px;color:#1a3a4a;border-bottom:3px solid #c9962a;padding-bottom:8px;margin-bottom:14px}.ig{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#f8f4ee;padding:12px;border-radius:6px;margin-bottom:14px}.ig label{font-size:10px;text-transform:uppercase;color:#888;display:block}.ig b{color:#1a3a4a}.sm{background:#1a3a4a;color:#fff;padding:16px;border-radius:8px;margin-top:16px}.sm h2{color:#e8d5a3;margin-bottom:10px}.sr{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:13px}.ac{color:#c9962a;font-weight:700;font-size:15px}.cur-note{background:#f0ebe0;color:#7a6a5a;padding:6px 12px;border-radius:6px;font-size:11px;margin-bottom:8px}@media print{div{page-break-inside:avoid}}</style></head><body><h1>📋 ${t("pdfTitle")}</h1><div class="cur-note">💱 ${t("displayCur")}: <b>${DC}</b>${DC!=="VND"?` · 1 USD = ${fmtAmt(rates.USD,"VND")} · 1 CNY = ${fmtAmt(rates.CNY,"VND")}`:""}</div><div class="ig"><div><label>${t("fTourName")}</label><b>${info.tourName||"—"}</b></div><div><label>${t("fCode")}</label><b>${info.tourCode||"—"}</b></div><div><label>${t("fClient")}</label><b>${info.clientName||"—"}</b></div><div><label>${t("fStart")}</label><b>${info.startDate||"—"} → ${info.endDate||"—"}</b></div><div><label>${t("fAdults")}</label><b>${info.adults}</b></div><div><label>${t("fChildren")}</label><b>${info.children}</b></div><div><label>${t("fBy")}</label><b>${info.preparedBy||"—"}</b></div><div><label>${t("pdfDate")}</label><b>${new Date().toLocaleDateString("vi-VN")}</b></div></div>${body}<div class="sm"><h2>${t("pdfFoot")}</h2>${totals.map(c=>`<div class="sr"><span>${c.icon} ${t(c.tKey)}</span><span>${fmtAmt(dv(c.subVND),DC)}</span></div>`).join("")}<div class="sr"><span>${t("sumBase")}</span><span>${fmtAmt(dv(baseVND),DC)}</span></div>${cfg.discount>0?`<div class="sr"><span>${t("sumDiscount")} (${cfg.discount}%)</span><span style="color:#6bbf8a">-${fmtAmt(dv(baseVND-aDiscVND),DC)}</span></div>`:""}<div class="sr"><span>${t("sumProfit")} (${cfg.markup}%)</span><span style="color:#c9962a">+${fmtAmt(dv(aMarkupVND-aDiscVND),DC)}</span></div>${cfg.vat>0?`<div class="sr"><span>${t("sumVAT")} (${cfg.vat}%)</span><span>+${fmtAmt(dv(aVatVND-aMarkupVND),DC)}</span></div>`:""}<div class="sr ac"><span>${t("sumFinal")}</span><span>${fmtAmt(dv(aVatVND),DC)}</span></div>${pax>0?`<div class="sr ac"><span>${t("sumPP")} (${pax} ${t("sumPax")})</span><span>${fmtAmt(dv(ppVND),DC)}</span></div>`:""}</div>${info.notes?`<div style="margin-top:14px;padding:10px;background:#fef9ed;border-left:4px solid #c9962a;border-radius:4px"><b>${t("fNotes")}:</b> ${info.notes}</div>`:""}</body></html>`;
    const w=window.open("","_blank");w.document.write(html);w.document.close();setTimeout(()=>w.print(),600);
  },[cats,totals,info,cfg,rates,DC,baseVND,aDiscVND,aMarkupVND,aVatVND,ppVND,pax,t]);

  /* Section Header */
  const Hdr=({label,badge,right,isOpen,onClick})=>(
    <div onClick={onClick} style={{padding:"13px 20px",background:isOpen?C.navy:"#2c4a5a",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",userSelect:"none",transition:"background .18s"}}>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700,color:C.goldL,display:"flex",alignItems:"center",gap:10}}>
        {label}
        {badge!==undefined&&<span style={{background:C.gold,color:"white",borderRadius:20,padding:"1px 8px",fontSize:11,fontWeight:700}}>{badge}</span>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>{right}<span style={{color:C.gold,fontSize:18}}>{isOpen?"▲":"▼"}</span></div>
    </div>
  );

  /* Currency select for each service row */
  const CurSelect=({value,onChange})=>(
    <select value={value||"VND"} onChange={e=>onChange(e.target.value)}
      style={{border:`1px solid ${C.border}`,borderRadius:5,padding:"5px 4px",fontSize:11,fontWeight:700,background:"#fafaf8",color:C.navy,outline:"none",cursor:"pointer",width:62,fontFamily:"inherit"}}>
      {CURR_KEYS.map(k=><option key={k} value={k}>{CURR[k].flag} {k}</option>)}
    </select>
  );

  return(
    <>
      <style>{G}</style>
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:fontFam}}>

        {/* ══ TOP BAR ══ */}
        <div style={{background:`linear-gradient(135deg,${C.navy},${C.dark})`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 24px rgba(0,0,0,.3)",position:"sticky",top:0,zIndex:890}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:C.goldL,letterSpacing:1}}>✈️ TourQuote Pro</div>
            <div style={{color:"#8ab4c4",fontSize:10,marginTop:1}}>{t("tagline")} · {new Date().toLocaleDateString("vi-VN")}</div>
          </div>

          {/* Controls row */}
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
            {/* Final price badge */}
            {baseVND>0&&<div style={{textAlign:"right",marginRight:4}}>
              <div style={{color:C.goldL,fontSize:9,textTransform:"uppercase",letterSpacing:1}}>{t("finalPrice")}</div>
              <div style={{color:C.gold,fontWeight:700,fontSize:16}}>{fmtAmt(dv(aVatVND),DC)}</div>
            </div>}

            {/* Language switcher */}
            <div style={{display:"flex",gap:3,padding:"3px",background:"rgba(0,0,0,.2)",borderRadius:9}}>
              {[["vi","🇻🇳"],["en","🇺🇸"],["zh","🇨🇳"]].map(([l,flag])=>(
                <button key={l} className={`lang-btn ${lang===l?"on":""}`} onClick={()=>setLang(l)}>{flag} {l.toUpperCase()}</button>
              ))}
            </div>

            {/* Display currency switcher */}
            <div style={{display:"flex",gap:3,padding:"3px",background:"rgba(0,0,0,.2)",borderRadius:9}}>
              {CURR_KEYS.map(k=>(
                <button key={k} className={`cur-btn ${DC===k?"on":""}`} onClick={()=>uc("displayCur",k)}>{CURR[k].flag} {k}</button>
              ))}
            </div>

            <button onClick={()=>setDrawer("template")} style={{padding:"8px 13px",borderRadius:8,border:"1px solid rgba(232,213,163,.4)",cursor:"pointer",background:"rgba(255,255,255,.1)",color:C.goldL,fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{t("btnTemplate")}</button>
            <button onClick={()=>setDrawer("saved")} style={{padding:"8px 13px",borderRadius:8,border:"1px solid rgba(232,213,163,.3)",cursor:"pointer",background:"rgba(255,255,255,.07)",color:C.goldL,fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{t("btnSaved")}</button>
            <button onClick={exportXlsx} style={{padding:"8px 13px",borderRadius:8,border:"none",cursor:"pointer",background:C.green,color:"white",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>📊 {t("btnExcel")?.replace("📊 ","")}</button>
            <button onClick={exportPDF} style={{padding:"8px 13px",borderRadius:8,border:"none",cursor:"pointer",background:C.gold,color:"white",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>📄 PDF</button>
            <button onClick={handleConfirmAndExport} style={{padding: "8px 13px", borderRadius: 8, border: "none", cursor: "pointer", background: "#c0392b", color: "white", fontSize: 12, fontWeight: 700, fontFamily: "inherit",}}> 🚀 Chốt & Điều hành</button>
          </div>
        </div>

        <div style={{maxWidth:1100,margin:"0 auto",padding:"16px 14px 60px"}}>

          {/* ══ TOUR INFO ══ */}
          <div style={{background:"white",borderRadius:12,boxShadow:"0 2px 14px rgba(0,0,0,.07)",marginBottom:11,overflow:"hidden"}}>
            <Hdr label={t("sectionInfo")} isOpen={panel.info} onClick={()=>setPanel(p=>({...p,info:!p.info}))}/>
            {panel.info&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:13,padding:18}}>
              {[{l:t("fTourName"),k:"tourName",ph:t("phTourName")},{l:t("fCode"),k:"tourCode",ph:t("phCode")},{l:t("fClient"),k:"clientName",ph:t("phClient")},{l:t("fBy"),k:"preparedBy",ph:t("phBy")},{l:t("fStart"),k:"startDate",tp:"date"},{l:t("fEnd"),k:"endDate",tp:"date"},{l:t("fAdults"),k:"adults",tp:"number"},{l:t("fChildren"),k:"children",tp:"number"},{l:t("fNotes"),k:"notes",ph:t("phNotes")}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:11,color:C.mut,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>{f.l}</div>
                  <input style={inp()} type={f.tp||"text"} value={info[f.k]} min={f.tp==="number"?0:undefined} onChange={e=>ui(f.k,e.target.value)} placeholder={f.ph||""}/>
                </div>
              ))}
            </div>}
          </div>

          {/* ══ PRICING SETTINGS ══ */}
          <div style={{background:"white",borderRadius:12,boxShadow:"0 2px 14px rgba(0,0,0,.07)",marginBottom:11,overflow:"hidden"}}>
            <Hdr label={t("sectionSettings")} isOpen={panel.cfg}
              right={<div style={{display:"flex",gap:6}}>
                <span style={{background:"#fef3d0",color:"#9a6a00",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>Markup {cfg.markup}%</span>
                {cfg.discount>0&&<span style={{background:"#d0ede0",color:"#1a6a40",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>CK {cfg.discount}%</span>}
                {cfg.vat>0&&<span style={{background:"#fef3d0",color:"#9a6a00",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>VAT {cfg.vat}%</span>}
              </div>}
              onClick={()=>setPanel(p=>({...p,cfg:!p.cfg}))}/>
            {panel.cfg&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,padding:18}}>
              {[{l:t("fMarkup"),k:"markup",h:t("hMarkup")},{l:t("fDiscount"),k:"discount",h:t("hDiscount")},{l:t("fVAT"),k:"vat",h:t("hVAT")}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:11,color:C.mut,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>{f.l}</div>
                  <input style={inp()} type="number" min={0} max={200} value={cfg[f.k]} onChange={e=>uc(f.k,e.target.value)}/>
                  <div style={{fontSize:11,color:"#aaa",marginTop:4}}>{f.h}</div>
                </div>
              ))}
            </div>}
          </div>

          {/* ══ CURRENCY SETTINGS ══ */}
          <div style={{background:"white",borderRadius:12,boxShadow:"0 2px 14px rgba(0,0,0,.07)",marginBottom:11,overflow:"hidden"}}>
            <Hdr label={t("sectionCurrency")} isOpen={panel.cur}
              right={<div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{background:"#e8f4fe",color:"#1a5a8a",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>🇺🇸 1 USD = {fmtAmt(rates.USD,"VND")}</span>
                <span style={{background:"#ffeee8",color:"#8a2a1a",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>🇨🇳 1 CNY = {fmtAmt(rates.CNY,"VND")}</span>
              </div>}
              onClick={()=>setPanel(p=>({...p,cur:!p.cur}))}/>
            {panel.cur&&<div style={{padding:18}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
                {/* USD rate */}
                <div>
                  <div style={{fontSize:11,color:C.mut,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>🇺🇸 {t("rateUSD")}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <input style={inp({flex:1})} type="number" min={1} value={cfg.rateUSD} onChange={e=>uc("rateUSD",e.target.value)}/>
                    <span style={{fontSize:13,color:C.mut,fontWeight:600,whiteSpace:"nowrap"}}>VND</span>
                  </div>
                  <div style={{fontSize:11,color:"#aaa",marginTop:4}}>{t("hRateUSD")}</div>
                </div>
                {/* CNY rate */}
                <div>
                  <div style={{fontSize:11,color:C.mut,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>🇨🇳 {t("rateCNY")}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <input style={inp({flex:1})} type="number" min={1} value={cfg.rateCNY} onChange={e=>uc("rateCNY",e.target.value)}/>
                    <span style={{fontSize:13,color:C.mut,fontWeight:600,whiteSpace:"nowrap"}}>VND</span>
                  </div>
                  <div style={{fontSize:11,color:"#aaa",marginTop:4}}>{t("hRateCNY")}</div>
                </div>
              </div>
              {/* Conversion cheat sheet */}
              <div style={{marginTop:16,padding:"12px 16px",background:"#f8f4ee",borderRadius:8,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,color:C.mut,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>💡 Bảng quy đổi nhanh</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8}}>
                  {[[1,100,500],[1,10,50]].map((amounts,ci)=>{
                    const cur=ci===0?"USD":"CNY";
                    return amounts.map(amt=>(
                      <div key={cur+amt} style={{background:"white",borderRadius:6,padding:"8px 12px",border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:12,color:C.navy,fontWeight:600}}>{CURR[cur].flag} {amt} {cur}</span>
                        <span style={{fontSize:12,color:C.gold,fontWeight:700}}>{fmtAmt(toVND(amt,cur,rates),"VND")}</span>
                      </div>
                    ));
                  })}
                </div>
              </div>
            </div>}
          </div>

          {/* ══ CATEGORIES ══ */}
          {cats.map(cat=>{
            const tot=totals.find(c=>c.id===cat.id);
            const subVND=tot?.subVND||0;
            return(
              <div key={cat.id} style={{background:"white",borderRadius:12,boxShadow:"0 2px 14px rgba(0,0,0,.07)",marginBottom:11,overflow:"hidden"}}>
                <Hdr label={<>{cat.icon} {t(cat.tKey)}</>} badge={cat.services.length}
                  right={subVND>0&&<span style={{color:C.gold,fontWeight:700,fontSize:14}}>{fmtAmt(dv(subVND),DC)}</span>}
                  isOpen={cat.open} onClick={()=>tog(cat.id)}/>
                {cat.open&&<>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <thead><tr>
                        <th style={thS({width:36,textAlign:"center"})}>#</th>
                        <th style={thS()}>{t("colService")}</th>
                        <th style={thS({width:66,textAlign:"center"})}>{t("colQty")}</th>
                        <th style={thS({width:130,textAlign:"right"})}>{t("colUnit")}</th>
                        <th style={thS({width:68,textAlign:"center"})}>{t("colCur")}</th>
                        <th style={thS({width:68,textAlign:"center"})}>{t("colTimes")}</th>
                        <th style={thS({width:130,textAlign:"right"})}>{t("colTotal")} ({DC})</th>
                        <th style={thS()}>{t("colNote")}</th>
                        <th style={thS({width:44})}></th>
                      </tr></thead>
                      <tbody>
                        {cat.services.length===0&&<tr><td colSpan={9} style={{padding:"22px",textAlign:"center",color:"#bbb",fontStyle:"italic"}}>{t("emptyRow")}</td></tr>}
                        {cat.services.map((s,i)=>{
                          const tVND=stotVND(s,rates); const tDC=fromVND(tVND,DC,rates);
                          const sCur=s.currency||"VND";
                          return(
                            <tr key={s.id} className="rh" style={{background:i%2===0?"#fff":"#faf8f4"}}>
                              <td style={tdS({textAlign:"center",color:"#bbb",fontSize:12})}>{i+1}</td>
                              <td style={tdS()}><input style={inp({border:"none",background:"transparent",padding:"4px 6px"})} value={s.name} onChange={e=>us(cat.id,s.id,"name",e.target.value)} placeholder={t("colService")+"..."}/></td>
                              <td style={tdS({textAlign:"center"})}><input style={inp({width:56,textAlign:"center",padding:"5px 4px"})} type="number" min={0} value={s.qty} onChange={e=>us(cat.id,s.id,"qty",e.target.value)}/></td>
                              <td style={tdS({textAlign:"right"})}>
                                <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4}}>
                                  <span style={{fontSize:11,color:C.mut,fontWeight:600}}>{CURR[sCur]?.symbol}</span>
                                  <input style={inp({width:100,textAlign:"right",padding:"5px 6px"})} type="number" min={0} value={s.unitPrice} onChange={e=>us(cat.id,s.id,"unitPrice",e.target.value)}/>
                                </div>
                              </td>
                              <td style={tdS({textAlign:"center"})}><CurSelect value={sCur} onChange={v=>us(cat.id,s.id,"currency",v)}/></td>
                              <td style={tdS({textAlign:"center"})}><input style={inp({width:52,textAlign:"center",padding:"5px 4px"})} type="number" min={1} value={s.times} onChange={e=>us(cat.id,s.id,"times",e.target.value)}/></td>
                              <td style={tdS({textAlign:"right",fontWeight:700,color:tDC>0?C.navy:"#ccc"})}>
                                {tDC>0?fmtAmt(tDC,DC):"—"}
                                {sCur!=="VND"&&tVND>0&&DC==="VND"&&<div style={{fontSize:10,color:C.mut,fontWeight:400}}>{CURR[sCur].flag} {fmtAmt(num(s.qty)*num(s.unitPrice)*num(s.times),sCur)}</div>}
                              </td>
                              <td style={tdS()}><input style={inp({border:"none",background:"transparent",padding:"4px 6px",fontSize:12})} value={s.note} onChange={e=>us(cat.id,s.id,"note",e.target.value)} placeholder="..."/></td>
                              <td style={tdS({textAlign:"center"})}><button onClick={()=>rm(cat.id,s.id)} style={{padding:"4px 7px",borderRadius:6,border:"1px solid #ffc0c0",cursor:"pointer",background:"#fff5f5",color:C.red,fontSize:12,fontWeight:700}}>✕</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {cat.services.length>0&&<tfoot>
                        <tr style={{background:C.creamD}}>
                          <td colSpan={6} style={{padding:"9px 12px",fontWeight:700,color:C.navy,textAlign:"right",fontSize:13}}>Tổng {t(cat.tKey)}:</td>
                          <td style={{padding:"9px 12px",fontWeight:800,color:C.gold,fontSize:15,textAlign:"right"}}>{fmtAmt(dv(subVND),DC)}</td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>}
                    </table>
                  </div>
                  <div style={{padding:"10px 16px",background:C.cream,borderTop:`1px dashed ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
                    <button onClick={()=>add(cat.id)} style={{padding:"7px 16px",borderRadius:8,border:`1px dashed ${C.navy}`,cursor:"pointer",background:"white",color:C.navy,fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{t("btnAdd")}</button>
                    <span style={{fontSize:11,color:"#aaa"}}>{t("formula")}</span>
                  </div>
                </>}
              </div>
            );
          })}

          {/* ══ SUMMARY ══ */}
          <div style={{background:`linear-gradient(135deg,${C.navy},${C.dark})`,borderRadius:14,padding:"22px 26px",marginTop:6,boxShadow:"0 8px 32px rgba(26,58,74,.4)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:18,borderBottom:"1px solid rgba(232,213,163,.2)",paddingBottom:14}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:700,color:C.goldL}}>
                {t("sumTitle")}
                {info.tourName&&<span style={{fontSize:14,fontWeight:400,color:"#8ab4c4",marginLeft:10}}>— {info.tourName}</span>}
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {/* Currency display switcher in summary too */}
                <div style={{display:"flex",gap:3,padding:"3px",background:"rgba(0,0,0,.3)",borderRadius:8}}>
                  {CURR_KEYS.map(k=><button key={k} className={`cur-btn ${DC===k?"on":""}`} onClick={()=>uc("displayCur",k)} style={{fontSize:11,padding:"4px 9px"}}>{CURR[k].flag} {k}</button>)}
                </div>
                <button onClick={()=>setDrawer("template")} style={{padding:"7px 14px",borderRadius:8,border:"1px solid rgba(232,213,163,.3)",cursor:"pointer",background:"rgba(255,255,255,.08)",color:C.goldL,fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{t("btnUseTpl")}</button>
                <button onClick={()=>setDrawer("saved")} style={{padding:"7px 14px",borderRadius:8,border:"1px solid rgba(232,213,163,.4)",cursor:"pointer",background:"rgba(255,255,255,.1)",color:C.goldL,fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{t("btnSaveQ")}</button>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:28}}>
              <div>
                <div style={{fontSize:11,color:"#8ab4c4",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("sumBycat")}</div>
                {totals.map(c=>(
                  <div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.07)",fontSize:14}}>
                    <span style={{color:"rgba(255,255,255,.8)"}}>{c.icon} {t(c.tKey)}</span>
                    <span style={{color:c.subVND>0?C.goldL:"rgba(255,255,255,.25)",fontWeight:c.subVND>0?600:400}}>{c.subVND>0?fmtAmt(dv(c.subVND),DC):"—"}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontSize:11,color:"#8ab4c4",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{t("sumPricing")}</div>
                {[
                  {l:t("sumBase"),v:fmtAmt(dv(baseVND),DC),c:"rgba(255,255,255,.85)"},
                  ...(cfg.discount>0?[{l:`${t("sumDiscount")} (${cfg.discount}%)`,v:`-${fmtAmt(dv(baseVND-aDiscVND),DC)}`,c:"#6bbf8a"}]:[]),
                  ...(cfg.markup>0?[{l:`${t("sumProfit")} (${cfg.markup}%)`,v:`+${fmtAmt(dv(aMarkupVND-aDiscVND),DC)}`,c:C.gold}]:[]),
                  ...(cfg.vat>0?[{l:`${t("sumVAT")} (${cfg.vat}%)`,v:`+${fmtAmt(dv(aVatVND-aMarkupVND),DC)}`,c:"rgba(255,255,255,.85)"}]:[]),
                ].map((row,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.07)",fontSize:14,color:row.c}}>
                    <span>{row.l}</span><span>{row.v}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderTop:"2px solid rgba(201,150,42,.35)",marginTop:4,fontSize:17,fontWeight:700,color:C.gold}}>
                  <span>{t("sumFinal")}</span><span>{fmtAmt(dv(aVatVND),DC)}</span>
                </div>
                {pax>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:15,fontWeight:700,color:C.gold}}>
                  <span>{t("sumPP")} ({pax} {t("sumPax")})</span><span>{fmtAmt(dv(ppVND),DC)}</span>
                </div>}
                {/* Currency equivalence row */}
                {DC==="VND"&&baseVND>0&&<div style={{marginTop:12,padding:"10px 14px",background:"rgba(255,255,255,.07)",borderRadius:8,fontSize:12}}>
                  <div style={{color:"#8ab4c4",fontWeight:600,marginBottom:6,fontSize:11,textTransform:"uppercase",letterSpacing:.5}}>💱 Tương đương</div>
                  <div style={{display:"flex",gap:16}}>
                    <span style={{color:"rgba(255,255,255,.8)"}}>🇺🇸 {fmtAmt(dv_usd(aVatVND),"USD")}</span>
                    <span style={{color:"rgba(255,255,255,.8)"}}>🇨🇳 {fmtAmt(dv_cny(aVatVND),"CNY")}</span>
                  </div>
                </div>}
                {info.notes&&<div style={{marginTop:12,padding:"10px 14px",background:"rgba(201,150,42,.12)",borderLeft:`3px solid ${C.gold}`,borderRadius:"0 6px 6px 0",fontSize:12,color:C.goldL}}>📝 {info.notes}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* ══ DRAWERS ══ */}
        {drawer==="template"&&<TemplateDrawer onClose={()=>setDrawer(null)} onApply={applyTemplate} curCats={cats} curCfg={cfg} rates={rates} toast={showToast} t={t}/>}
        {drawer==="saved"&&<SavedDrawer onClose={()=>setDrawer(null)} onLoad={loadData} curInfo={info} curCats={cats} curCfg={cfg} rates={rates} toast={showToast} t={t}/>}

        {/* ══ TOAST ══ */}
        {toast&&<div key={toastKey} className="toast">{toast}</div>}
      </div>
    </>
  );

  function dv_usd(vnd){return fromVND(vnd,"USD",rates);}
  function dv_cny(vnd){return fromVND(vnd,"CNY",rates);}
}
