const cart=[], cartEl=document.getElementById('cart'), overlay=document.getElementById('overlay'), toast=document.getElementById('toast');
const openCart=()=>{cartEl.classList.add('open');overlay.classList.add('show')};
const closeCart=()=>{cartEl.classList.remove('open');overlay.classList.remove('show')};
document.getElementById('cartOpen').onclick=openCart;document.getElementById('cartClose').onclick=closeCart;overlay.onclick=closeCart;

let currentDetailProduct=null;
let currentDetailColor='GREEN';
let currentDetailSize='M';
let currentDetailView='front';
let detailGalleryImages=[];
const detailModal=document.getElementById('productDetailModal');
const detailImage=document.getElementById('detailImage');
const detailCategory=document.getElementById('detailCategory');
const detailTitle=document.getElementById('detailTitle');
const detailPrice=document.getElementById('detailPrice');
const detailDescription=document.getElementById('detailDescription');
const detailFeatures=document.getElementById('detailFeatures');
const detailSelectedColor=document.getElementById('detailSelectedColor');
const detailColorOptions=document.getElementById('detailColorOptions');
const detailSelectedSize=document.getElementById('detailSelectedSize');
const detailSizeOptions=document.getElementById('detailSizeOptions');
const detailViewLabel=document.getElementById('detailViewLabel');
const detailGalleryTabs=document.getElementById('detailGalleryTabs');

const getVariantProduct=(product,color)=>{
  const name=product.dataset.name;
  const base=name.replace(/\s*-\s*(GREEN|WHITE|PINK|NAVY|WHITE × GREEN|NAVY × PINK)\s*$/i,'').trim();
  return [...document.querySelectorAll('.product')].find(p=>{
    const pBase=p.dataset.name.replace(/\s*-\s*(GREEN|WHITE|PINK|NAVY|WHITE × GREEN|NAVY × PINK)\s*$/i,'').trim();
    const pColor=p.dataset.variant || (p.dataset.name.match(/(GREEN|WHITE|PINK|NAVY)\s*$/i)||[])[1]?.toUpperCase();
    return pBase===base && pColor===color;
  }) || product;
};

const getColorVariant=(color, type)=>{
  const names = type==='front'
    ? [`MW POLO SHIRT - ${color}`]
    : [`MW LOGO POLO - ${color}`];
  return [...document.querySelectorAll('.product')].find(p=>names.includes(p.dataset.name));
};

const DETAIL_GREEN_FRONT="images/detail-green-front.jpg";
const DETAIL_GREEN_BACK="images/detail-green-back.jpg";
const DETAIL_WHITE_FRONT="images/detail-white-front.jpg";
const DETAIL_WHITE_BACK="images/detail-white-back.jpg";

const buildDetailGallery=(color, preferredView='front')=>{
  const variant=getVariantProduct(currentDetailProduct,color);
  detailGalleryImages=[];

  if(variant?.dataset.gender==='WOMEN'){
  const imgs=variant.querySelectorAll('.product-img img');

  // レディースの商品画像
  if(imgs[0]){
    detailGalleryImages.push({
      view:'front',
      src:imgs[0].src,
      alt:imgs[0].alt||variant.dataset.name
    });
  }

  if(imgs[1]){
    detailGalleryImages.push({
      view:'back',
      src:imgs[1].src,
      alt:imgs[1].alt||variant.dataset.name
    });
  }

  // レディースのモデル画像
  const isWhiteGreen = color === 'WHITE × GREEN';

  const modelFront = isWhiteGreen
    ? 'images/model-women-white-green-front.jpg'
    : 'images/model-women-navy-pink-front.jpg';

  const modelBack = isWhiteGreen
    ? 'images/model-women-white-green-back.jpg'
    : 'images/model-women-navy-pink-back.jpg';

  detailGalleryImages.push({
    view:'model-front',
    src:modelFront,
    alt:`${variant.dataset.name} model front`
  });

  detailGalleryImages.push({
    view:'model-back',
    src:modelBack,
    alt:`${variant.dataset.name} model back`
  });
  }else{
    const front=getColorVariant(color,'front');
    const back=getColorVariant(color,'back');
    if(front){
      const img=front.querySelector('.product-img img');
      if(img) detailGalleryImages.push({view:'front',src: color==='GREEN' ? DETAIL_GREEN_FRONT : DETAIL_WHITE_FRONT,alt:img.alt||front.dataset.name});
    }
    if(back){
      const img=back.querySelector('.product-img img');
      if(img) detailGalleryImages.push({view:'back',src: color==='GREEN' ? DETAIL_GREEN_BACK : DETAIL_WHITE_BACK,alt:img.alt||back.dataset.name});
    }
    const modelFront = color === 'GREEN' ? 'images/model-green-front.png' : 'images/model-white-front.png';
    const modelBack  = color === 'GREEN' ? 'images/model-green-back.png'  : 'images/model-white-back.png';
    detailGalleryImages.push({view:'model-front',src:modelFront,alt:`${color} model front`});
    detailGalleryImages.push({view:'model-back',src:modelBack,alt:`${color} model back`});
  }

  currentDetailView=detailGalleryImages.some(x=>x.view===preferredView) ? preferredView : (detailGalleryImages[0]?.view||'front');
  renderDetailGallery();
};

const renderDetailGallery=()=>{
  const item=detailGalleryImages.find(x=>x.view===currentDetailView) || detailGalleryImages[0];
  if(!item)return;
  detailImage.src=item.src;
  detailImage.alt=item.alt;
  detailViewLabel.textContent =
    item.view==='front' ? 'FRONT / 表' :
    item.view==='back' ? 'BACK / 裏' :
    item.view==='model-front' ? 'MODEL / FRONT' : 'MODEL / BACK';
  detailGalleryTabs.querySelectorAll('button').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.view===item.view);
  });
};

const setDetailColor=(color)=>{
  if(!currentDetailProduct)return;
  currentDetailColor=color;
  const variant=getVariantProduct(currentDetailProduct,color);
  currentDetailProduct=variant;
  detailCategory.textContent=variant.dataset.category||'POLO SHIRT / '+color;
  detailTitle.textContent=variant.dataset.name;
  detailPrice.innerHTML='¥'+Number(variant.dataset.price).toLocaleString()+' <small>(税込)</small>';
  detailDescription.textContent=variant.dataset.description||'Mulligan Waggleのプロダクト詳細をご覧ください。';
  detailFeatures.textContent=variant.dataset.features||'上質な素材感・快適な着心地';
  detailSelectedColor.textContent=color;
  detailColorOptions.querySelectorAll('.detail-color').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.color===color);
  });
  buildDetailGallery(color,currentDetailView);
};

const setDetailSize=(size)=>{
  currentDetailSize=size;
  detailSelectedSize.textContent=size;
  detailSizeOptions.querySelectorAll('.detail-size').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.size===size);
  });
};

const openDetail=(product)=>{
  currentDetailProduct=product;
  const initialColor=product.dataset.variant || (product.dataset.name.match(/(GREEN|WHITE)\s*$/i)||[])[1]?.toUpperCase() || 'GREEN';
  const initialView=product.dataset.name.startsWith('MW LOGO POLO')?'back':'front';
  detailColorOptions.querySelectorAll('.detail-color').forEach(btn=>{btn.style.display='none';});
  const variantButtons=product.dataset.gender==='WOMEN' ? ['WHITE × GREEN','NAVY × PINK'] : ['GREEN','WHITE'];
  if(product.dataset.gender==='WOMEN'){
    detailColorOptions.innerHTML=variantButtons.map((c,i)=>`<button class="detail-color${i===0?' active':''}" data-color="${c}" type="button">${c}</button>`).join('');
    detailColorOptions.querySelectorAll('.detail-color').forEach(btn=>btn.addEventListener('click',()=>setDetailColor(btn.dataset.color)));
  }else{
    detailColorOptions.innerHTML='<button class="detail-color active" data-color="GREEN" type="button">GREEN</button><button class="detail-color" data-color="WHITE" type="button">WHITE</button>';
    detailColorOptions.querySelectorAll('.detail-color').forEach(btn=>btn.addEventListener('click',()=>setDetailColor(btn.dataset.color)));
  }
  detailColorOptions.querySelectorAll('.detail-color').forEach(btn=>{
    if(variantButtons.includes(btn.dataset.color)){ btn.style.display=''; btn.textContent=btn.dataset.color; }
  });
  currentDetailView=initialView;
  setDetailColor(initialColor);
  setDetailSize('M');
  detailModal.classList.add('show');
  detailModal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
};

const closeDetail=()=>{
  detailModal.classList.remove('show');
  detailModal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  currentDetailProduct=null;
};

document.querySelectorAll('.detail-trigger').forEach(btn=>{
  btn.addEventListener('click',()=>openDetail(btn.closest('.product')));
});
detailColorOptions.querySelectorAll('.detail-color').forEach(btn=>{
  btn.addEventListener('click',()=>setDetailColor(btn.dataset.color));
});
detailSizeOptions.querySelectorAll('.detail-size').forEach(btn=>{
  btn.addEventListener('click',()=>setDetailSize(btn.dataset.size));
});
detailGalleryTabs.querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    currentDetailView=btn.dataset.view;
    renderDetailGallery();
  });
});
document.getElementById('detailPrev').onclick=()=>{
  if(detailGalleryImages.length<2)return;
  const i=detailGalleryImages.findIndex(x=>x.view===currentDetailView);
  currentDetailView=detailGalleryImages[(i-1+detailGalleryImages.length)%detailGalleryImages.length].view;
  renderDetailGallery();
};
document.getElementById('detailNext').onclick=()=>{
  if(detailGalleryImages.length<2)return;
  const i=detailGalleryImages.findIndex(x=>x.view===currentDetailView);
  currentDetailView=detailGalleryImages[(i+1)%detailGalleryImages.length].view;
  renderDetailGallery();
};
document.getElementById('detailClose').onclick=closeDetail;
document.getElementById('detailBackdrop').onclick=closeDetail;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&detailModal.classList.contains('show'))closeDetail();});

document.getElementById('detailAdd').onclick=()=>{
  if(!currentDetailProduct)return;
  const p=currentDetailProduct;
  cart.push({name:p.dataset.name,price:+p.dataset.price,color:currentDetailColor,size:currentDetailSize});
  renderCart();
  closeDetail();
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),1400);
};

document.querySelectorAll('.add').forEach(btn=>btn.addEventListener('click',()=>{
  const p=btn.closest('.product'); cart.push({name:p.dataset.name,price:+p.dataset.price,color:p.dataset.variant || (p.dataset.name.match(/(GREEN|WHITE)\s*$/i)||[])[1]?.toUpperCase()||'',size:'M'}); renderCart();
  toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1400);
}));
function renderCart(){
 const box=document.getElementById('cartItems'), total=cart.reduce((s,x)=>s+x.price,0);
 box.innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-row"><span>${x.name}<br>COLOR ${x.color||'-'}　SIZE ${x.size||'M'}<br>数量 1</span><span>¥${x.price.toLocaleString()}　<button onclick="removeItem(${i})" style="border:0;background:none;cursor:pointer">×</button></span></div>`).join(''):'<p class="empty">カートは空です。</p>';
 document.getElementById('total').textContent='¥'+total.toLocaleString();
}
window.removeItem=i=>{cart.splice(i,1);renderCart()};
document.getElementById('checkout').onclick=()=>alert('EC決済を接続すると、ここから購入手続きへ進めます。');
document.querySelectorAll('form').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();alert('登録ありがとうございます。');form.reset()}));
document.getElementById('menuBtn').onclick=()=>document.querySelector('.nav').classList.toggle('mobile-open');
