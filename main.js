var kuro = new Array(9).fill().map((v,i)=>11849+i);
var siro = new Array(9).fill().map((v,i)=>11945-i);
function getKuro(r,g,b){
    return new Array(9).fill().map((v,i)=>(i+1)/10).reverse().map(v=>[r,g,b].map(v2=>v2*v).map(v=>Math.round(v)));
}
function getSiro(r,g,b){
    return new Array(9).fill().map((v,i)=>(i+1)/10).map(v=>[r,g,b].map(v2=>v2+(255-v2)*v).map(v=>Math.round(v)));
}
function getTrendCode(r,g,b){
    var margin = 10; // 許容誤差
    var s = '';
    if(Math.abs(r - g) <= margin) s += 'a';
    if(Math.abs(r - b) <= margin) s += 'b';
    if(Math.abs(g - b) <= margin) s += 'c';
    var half = margin / 2;
    if(r + half < b) s += 'd';
    if(r > b + half) s += 'e';
    if(r + half < g) s += 'f';
    if(r > g + half) s += 'g';
    if(g + half < b) s += 'h';
    if(g > b + half) s += 'i';
    return s;
}
var dic = { // 色辞典
    85 : [255, 255, 255],
    86 : [255, 0, 0],
    92 : [0, 255, 0],
    87 : [0, 0, 255],
    88 : [255, 255, 0],
    90 : [255, 0, 255],
    93 : [0, 255, 255],
    2408 : [0, 0, 0],
    28477 : [128, 255, 0],
    28478 : [128, 0, 255],
    28479 : [0, 128, 255],
    28480 : [255, 128, 0],
    28481 : [255, 0, 128],
    28482 : [0, 255, 128],
};
var obj = {};
function add(r,g,b,yuka,mono){
    var code = getTrendCode(r,g,b);
    if(!obj[code]) obj[code] = [];
    obj[code].push([r,g,b,yuka,mono]);
}
Object.keys(dic).forEach(k=>{
    var r = dic[k][0],
        g = dic[k][1],
        b = dic[k][2];
    add(r,g,b,k);
    if(k==="2408") return;
    getKuro(r,g,b).forEach((v,i)=>{
        add(v[0],v[1],v[2],k,kuro[i]);
    });
    if(k==="85") return;
    getSiro(r,g,b).forEach((v,i)=>{
        add(v[0],v[1],v[2],k,siro[i]);
    });
});
function getSpriteRPGEN(r,g,b){
    var code = getTrendCode(r,g,b);
    if(!obj[code]) console.error("辞書が不十分です！");
    var min = 1, output = null;
    obj[code].forEach((v,i)=>{
        var dif = diffColor([r,g,b],[v[0],v[1],v[2]],inputDiffType());
        if(min < dif) return;
        min = dif;
        output = [v[3],v[4]];
    });
    if(!output) return console.error("起こるはずの無いエラー");
    return output;
}
//--------------------------------------------------------
var h = $("<div>").appendTo($("body")).css({
    "text-align": "center",
    padding: "1em"
});
$("<h1>",{text:"RPGENのドット絵MAPメーカー"}).appendTo(h);
$("<div>",{text:"色を選択してください。"}).appendTo(h);
var inputW = yaju1919.addInputNumber(h,{
    title : "幅",
    placeholder : "15 30 60",
    max : 60,
    min : 0,
    int : true,
    save : "w"
});
var inputDiffType = yaju1919.addSelect(h,{
    title: "色比較アルゴリズム",
    list: {
        "RGB表色系でのユークリッド距離による色差の計算" : 3,
        "XYZ表色系でのユークリッド距離による色差の計算" : 2,
        "L*a*b*表色系でのユークリッド距離による色差の計算" : 1,
        "CIEDE2000による色差の計算" : 0
    },
    value: '0',
    save: "diffType"
});
$("<button>").appendTo(h).text("画像選択").click(function(){
    $("<input>").attr({
        type: "file"
    }).on("change",function(e){
        var file = e.target.files[0];
        if(!file) return;
        var blobUrl = window.URL.createObjectURL(file);
        var img = new Image();
        img.onload = function(){ main(img); };
        img.src = blobUrl;
    }).click();
});
var h_output = $("<div>").appendTo(h);
function main(img){
    var _w = inputW();
    var _h = Math.floor(_w * (img.height/img.width));
    var yuka = new Array(_h).fill().map(v=>new Array(_w).fill().map(v=>''));
    var mono = yuka.map(v=>v.slice());
    var cv = $("<canvas>").attr({
        width: _w,
        height: _h
    });
    var ctx = cv.get(0).getContext('2d');
    // ドットを滑らかにしないおまじない
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img,0,0,img.width,img.height,0,0,_w,_h);
    var ImgData = ctx.getImageData(0,0,_w,_h);
    var d = ImgData.data;
    for(var i = 0; i < d.length; i+=4){
        var r = d[i],
            g = d[i+1],
            b = d[i+2];
        var output = getSpriteRPGEN(r,g,b);
        var x = (i / 4) % _w,
            y = Math.floor((i / 4) / _w);
        yuka[y][x] = output[0];
        if(output[1]) mono[y][x] = output[1];
    }
    (function(){
        var a = yuka.map(line=>line.join(' ')).join('\n');
        var b = mono.map(line=>line.join(' ')).join('\n');
        var ar = [];
        ar.push("#HERO\n3,7");
        ar.push("#BGM\n");
        ar.push("#BGIMG\nhttp://i.imgur.com/qiN1und.jpg");
        ar.push("#FLOOR\n" + a);
        ar.push("#MAP\n" + b);
        var file = LZString.compressToEncodedURIComponent(ar.map(v=>v + "#END").join("\n\n"));
        var str = 'avascript:(function(){var map="' + file + '";(' + toStr(write) + ')();})();';
        yaju1919.addInputText(h_output.empty(),{
            value: str,
            textarea: true,
            readonly: true
        });
    })();
}
function toStr(func){ // 関数を文字列化
    return String(func).replace(/\/\/.*\n/g,'');
}
function write(){
    $.post(dqSock.getRPGBase() + 'cons/writeMapText.php',{
        token: g_token,
        index: parseInt(dq.mapNum),
        mapText: (dq.bOpenScr ? '' : 'L1') + map,
    }).done(function(r){
        if ( r != 0 ) apprise("error");
    }).fail(function(){
        apprise("error");
    });
}
