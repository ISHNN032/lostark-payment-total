// 로그인 후, 해당 페이지에서 실행
// https://bill.onstove.com/History/UserPurchaseList.aspx

const CNLFLAG = 'N' //??
const TYPE = 'userinoutpurchaselist';
const SUBTYPE = '2'; // [ 1:충전, 2:구매, 3:선물, 4:전체 ]**동작안함
const GAMECODE = '45'; //일괄 조회를 원하면 'ALL' 로 바꿔 넣으면 된다.
// [ ALL, 8:크로스파이어, 11:소울워커, 2:테런, 45:로아, KARDS, CAOA:센추리, GETAMPED:겟앰, STOVE:스토브 ]

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}
Number.prototype.price = function() {
    return String(this).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function getDateFormat(datetime) {
    var year = datetime.getFullYear();
    var month = datetime.getMonth()+1;
    var date = datetime.getDate();
    return `${year}${month.pad()}${date.pad()}`;
}
function clearTable(){
    $("#tr-purchase-list-subject").siblings("tr").remove();
    $("#tr-purchase-cnl-list-subject").siblings("tr").remove();
    $("#tr-game-purchase-list-subject").siblings("tr").remove();
    $("#tr-bonuscash-list-subject").siblings("tr").remove();
}
function printItem(objJson){
    var tranNo = objJson.list[i].tran_no;
    var desc_lang = objJson.list[i].description_lang;
    var freeFlag = objJson.list[i].free_prod_flag;
    var typeCode = objJson.list[i].type;
    var currencyCode = objJson.list[i].currency_code;
    var detailType = objJson.list[i].detail_type;
    var presnetYn = objJson.list[i].present_flag;
    var payAmt = objJson.list[i].pay_amt;                                
    var ymd = objJson.list[i].reg_datem;
    var receipt_state = objJson.list[i].receipt_state;
    var use_stovecash = objJson.list[i].use_stove_cash;
    var title = objJson.list[i].title;
    var game_cash_amt = objJson.list[i].game_cash_amt;
    var event_cash = objJson.list[i].event_cash;                                
    var type = (typeCode == "1" || (typeCode == "2" && detailType == "CASH")) ? 1 : 2;
    var cash_real = objJson.list[i].total_real_cash;
    var cash_bonus = objJson.list[i].total_bonus_cash;
    var paytoolname = objJson.list[i].pay_tool_name;
    var pgp_code = objJson.list[i].pgp_code;
    var tid = objJson.list[i].tid;        

    var currencyPer = "원";                                
    //상품명
    var displayName = desc_lang;
    if (presnetYn == "Y") {
        displayName = MoneyFormat(payAmt) + " STOVE" + " 캐시" + " " + "선물"; 
    }
    
    var strListHtml = "";
    strListHtml = strListHtml + "<tr>";
    strListHtml = strListHtml + "    <td class=\"table__td\">" + ymd + "</td>"; //구매일
    strListHtml = strListHtml + "    <td class=\"table__td\"><a href=\"#\" onclick=\"fnPurchaseDtl(" + tranNo + ", '" + typeCode + "', '" + displayName + "', '" + freeFlag + "','" + detailType + "','" + title + "','" + cash_real + "','" + cash_bonus + "')\">" + tranNo + "</a></td>"; //구매번호
    strListHtml = strListHtml + "    <td class=\"table__td\" style=display:none>" + fnGetPurchaseTypeText(typeCode) + "</td>"; //구매종류

    if (use_stovecash == "Y") {
        strListHtml = strListHtml + "    <td class=\"table__td\">" + displayName + "<br/>(유료캐시 " + MoneyFormat(cash_real) + " + 무료캐시 " + MoneyFormat(cash_bonus) + ")</td>"; //구매상품
    }
    else {
        strListHtml = strListHtml + "    <td class=\"table__td\">" + displayName + "</td>"; //구매상품
    }

    if (currencyCode == "KRW" || $.trim(currencyCode) == "") {
        strListHtml = strListHtml + "    <td class=\"table__td\">" + fnPriceDisplay(payAmt, currencyPer) + "</td>"; //금액(원)
    }
    else {
        
        strListHtml = strListHtml + "    <td class=\"table__td\">" + currencyCode + " " + parseFloat(payAmt).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        if ( title != null && title.indexOf("USD") < 0 && title.length > 0 ) {
            strListHtml = strListHtml + " (" + title + ")"
        }
        strListHtml = strListHtml + "</td>"; //금액
    }

    //현금영수증(1:발급하기 2:발급불가 3:발급완료->안내 4:발급하기(신용카드, 휴대폰 포함) 5:안내)
    if (receipt_state == 1 && use_stovecash != 'Y') {
        strListHtml = strListHtml + "<td class=\"table__td\">";
        strListHtml = strListHtml + "    <button class=\"button button--base-m button--shape-a\" name=\"btnIssueReceipt\" data-tranno=\"" + tranNo + "\" data-detailtype=\"" + detailType + "\" data-typecode=\"" + typeCode + "\">";
        strListHtml = strListHtml + "        <span class=\"button__text\">발급하기</span>"; //발급하기
        strListHtml = strListHtml + "    </button>";
        strListHtml = strListHtml + "</td>";
    } else if (receipt_state == 4 && use_stovecash != 'Y') {  
        strListHtml = strListHtml + "<td class=\"table__td\">";
        strListHtml = strListHtml + "    <button class=\"button button--base-m button--shape-a\" name=\"btnIssueReceipt\" data-tranno=\"" + tranNo + "\" data-detailtype=\"" + detailType + "\" data-typecode=\"" + typeCode + "\">";
        strListHtml = strListHtml + "        <span class=\"button__text\">발급하기</span>"; //발급하기
        strListHtml = strListHtml + "    </button>";
        strListHtml = strListHtml + "</td>";
    } else if (receipt_state == 5 && use_stovecash != 'Y') {  
        strListHtml = strListHtml + "<td class=\"table__td\">";
        strListHtml = strListHtml + "    <button class=\"button button--base-m button--shape-a\" name=\"btnGuideReceipt\" data-pgpcode=\"" + pgp_code + "\" data-paytoolname=\"" + paytoolname + "\" data-tid=\"" + tid + "\" data-payamt=\""+ payAmt+"\">";
        strListHtml = strListHtml + "        <span class=\"button__text\">안내</span>"; //안내
        strListHtml = strListHtml + "    </button>";
        strListHtml = strListHtml + "</td>";
    } else {
        if (use_stovecash == 'Y') {
            strListHtml = strListHtml + "    <td class=\"table__td\">대상 아님</td>";
        } else {
            strListHtml = strListHtml + "    <td class=\"table__td\">" + fnGetReceiptStateText(receipt_state) + "</td>";
        }
    }
    strListHtml = strListHtml + "</tr>";
    $("#tbl-purchase-list").append(strListHtml);
}


var today = new Date();
var thisYear = today.getFullYear();
var sum = 0;
var receipt = "\n\n";

clearTable();
for(const year of [...Array(thisYear+1).keys()].slice(thisYear-7)){

    var y_sum = 0;
    for(const month of Array(12).keys()){

        const firstDateOfMonth = new Date(year, month, 1);
        const lastDateOfMonth = new Date(year, month+1, 0);

        const strFromYmd = getDateFormat(firstDateOfMonth);
        const strToYmd = getDateFormat(lastDateOfMonth);

        if(today < firstDateOfMonth){ //범위가 당월을 초과한 경우 종료
            break;
        }
        $.post("/Handler/GetUserInOutHistoryListHandler.ashx",
            {
            "cnlflag": CNLFLAG,
            "type": TYPE,
            "value": SUBTYPE,
            "fromymd": strFromYmd,
            "toymd": strToYmd,
            "gamecode": GAMECODE,
            pagesize:999, pageno: 1 }).done(function (objJson) {
                if(objJson.list.length == 0) return;
                for (var i = 0; i < objJson.list.length; i++) {
                    var ymd = objJson.list[i].reg_datem;
                    var desc_lang = objJson.list[i].description_lang;
                    var paytoolname = objJson.list[i].pay_tool_name;
                    var payAmt = objJson.list[i].pay_amt;
                    var cash_real = objJson.list[i].total_real_cash;

                    var displaylog = `${ymd} ${desc_lang} ${paytoolname} ${cash_real.price()}원`;
                    console.log(displaylog);

                    receipt += displaylog+'\n';
                    y_sum += cash_real;

                    printItem(objJson);
                }
            }
        );
    }
    console.log(`~${year}: ${y_sum}`);
    sum += y_sum;
}
alert(`현질 금액 합계: ${sum.price()}원${receipt}`);
$("#tbl-purchase-list").append(`<tr><td></td><td></td><td></td><td style="display:none"></td><td class="table__td">합계: ${sum.price()}원</td><td></td></tr>`);
