var cv = $("<canvas>").attr({
    width: 16,
    height: 16
}).appendTo("body");
var ctx = cv.get(0).getContext('2d');
function draw(id){
    var img = new Image();
    img.src = `../sprites/${id}/sprite.png`;
    ctx.drawImage(img,0,0);
}
function getColor(yuka,mono){
    ctx.clearRect(0, 0, 16, 16);
    draw(yuka);
    if(mono) draw(mono);
    var ImgData = ctx.getImageData(0,0,16,16);
    var d = ImgData.data;
    return [ d[0], d[1], d[2] ];
}
var kuro = new Array(9).fill().map((v,i)=>11849+i);
var siro = new Array(9).fill().map((v,i)=>11945-i);
function check(color){
    console.log(getColor(color));
    [kuro,siro].forEach((v,i)=>console.log(v.map((v,i)=>getColor(color,v))));
}
function getKuro(r,g,b){
    return new Array(9).fill().map((v,i)=>(i+1)/10).reverse().map(v=>[r,g,b].map(v2=>v2*v));
}
function getSiro(r,g,b){
    return new Array(9).fill().map((v,i)=>(i+1)/10).map(v=>[r,g,b].map(v2=>v2+(255-v2)*v));
}
function getTrendCode(r,g,b){
    var _ = 10; // 許容誤差
    var s = '';
    if(Math.abs(r - g) <= _) s += 'a';
    if(Math.abs(r - b) <= _) s += 'b';
    if(Math.abs(g - b) <= _) s += 'c';
    if(r + _ < b) s += 'd';
    if(r > b + _) s += 'e';
    if(r + _ < g) s += 'f';
    if(r > g + _) s += 'g';
    if(g + _ < b) s += 'h';
    if(g > b + _) s += 'i';
    return s;
}
var str="";
$("#idTheArea").find("img").each((i,e)=>{
    if(i>37){
        var id = $(e).attr("src").match(/[0-9]+/)[0];
        var rgb = getColor(id);
        str += id+" : ["+rgb.join(', ')+"],\n";
    }
});
var dic = { // 色辞典
    85 : [255, 255, 255],
    86 : [255, 0, 0],
    87 : [0, 0, 255],
    88 : [255, 255, 0],
    89 : [153, 0, 255],
    90 : [255, 0, 255],
    91 : [255, 153, 0],
    92 : [0, 255, 0],
    93 : [0, 255, 255],
    2408 : [0, 0, 0],
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
    getKuro(r,g,b).forEach((v,i)=>{
        add(v[0],v[1],v[2],k,kuro[i]);
    });
    getSiro(r,g,b).forEach((v,i)=>{
        add(v[0],v[1],v[2],k,siro[i]);
    });
});
