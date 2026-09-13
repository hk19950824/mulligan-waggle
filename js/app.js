const cart=[], cartEl=document.getElementById('cart'), overlay=document.getElementById('overlay'), toast=document.getElementById('toast');

const openCart=()=>{
  cartEl.classList.add('open');
  overlay.classList.add('show');
};

const closeCart=()=>{
  cartEl.classList.remove('open');
  overlay.classList.remove('show');
};

document.getElementById('cartOpen').onclick=openCart;
document.getElementById('cartClose').onclick=closeCart;
overlay.onclick=closeCart;

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


/* ==============================
   商品カラー切り替え
================================ */

const getVariantProduct=(product,color)=>{
  const isWomen=product?.dataset?.gender==='WOMEN';

  /* レディース */
  if(isWomen){
    return [...document.querySelectorAll('.product[data-gender="WOMEN"]')]
      .find(p=>p.dataset.variant===color) || product;
  }

  /* メンズ */
  const name=product.dataset.name;

  const base=name
    .replace(/\s*[-×/]\s*(GREEN|WHITE)\s*$/i,'')
    .trim();

  return [...document.querySelectorAll('.product')].find(p=>{
    const pBase=p.dataset.name
      .replace(/\s*[-×/]\s*(GREEN|WHITE)\s*$/i,'')
      .trim();

    const pColor=
      (p.dataset.name.match(/(GREEN|WHITE)\s*$/i)||[])[1]
        ?.toUpperCase();

    return pBase===base && pColor===color;
  }) || product;
};


/* ==============================
   カラーに対応する商品取得
================================ */

const getColorVariant=(color,type,product=null)=>{

  /* レディース */
  if(product?.dataset?.gender==='WOMEN'){
    return [...document.querySelectorAll('.product[data-gender="WOMEN"]')]
      .find(p=>p.dataset.variant===color) || product;
  }

  /* メンズ */
  const names=
    type==='front'
      ? [`MW POLO SHIRT - ${color}`]
      : [`MW LOGO POLO - ${color}`];

  return [...document.querySelectorAll('.product')]
    .find(p=>names.includes(p.dataset.name));
};


/* ==============================
   メンズ詳細画像
================================ */

const DETAIL_GREEN_FRONT="images/detail-green-front.jpg";
const DETAIL_GREEN_BACK="images/detail-green-back.jpg";
const DETAIL_WHITE_FRONT="images/detail-white-front.jpg";
const DETAIL_WHITE_BACK="images/detail-white-back.jpg";


/* ==============================
   詳細ギャラリー作成
================================ */

const buildDetailGallery=(color,preferredView='front')=>{

  const women=currentDetailProduct?.dataset?.gender==='WOMEN';

  const variant=getColorVariant(
    color,
    'front',
    currentDetailProduct
  );

  detailGalleryImages=[];


  if(women){

    if(color === 'WHITE × GREEN'){
      detailGalleryImages.push({
        view:'front',
        src:'images/ladies-white-green-front.jpg',
        alt:'レディース ホワイト×グリーン ポロシャツ 表'
      });

      detailGalleryImages.push({
        view:'back',
        src:'images/ladies-white-green-back.jpg',
        alt:'レディース ホワイト×グリーン ポロシャツ 裏'
      });

    }else if(color === 'NAVY × PINK'){
      detailGalleryImages.push({
        view:'front',
        src:'images/ladies-navy-pink-front.jpg',
        alt:'レディース ネイビー×ピンク ポロシャツ 表'
      });

      detailGalleryImages.push({
        view:'back',
        src:'images/ladies-navy-pink-back.jpg',
        alt:'レディース ネイビー×ピンク ポロシャツ 裏'
      });
    }

  }


  /* レディースモデル */
  if(women){

    detailGalleryImages.push({
      view:'model-front',
      src:'images/model-women-front.png',
      alt:`${color} model front`
    });

    detailGalleryImages.push({
      view:'model-back',
      src:'images/model-women-back.png',
      alt:`${color} model back`
    });

  }

  /* メンズモデル */
  else{

    const modelFront=
      color==='GREEN'
        ? 'images/model-green-front.png'
        : 'images/model-white-front.png';

    const modelBack=
      color==='GREEN'
        ? 'images/model-green-back.png'
        : 'images/model-white-back.png';

    detailGalleryImages.push({
      view:'model-front',
      src:modelFront,
      alt:`${color} model front`
    });

    detailGalleryImages.push({
      view:'model-back',
      src:modelBack,
      alt:`${color} model back`
    });
  }


  currentDetailView=
    detailGalleryImages.some(x=>x.view===preferredView)
      ? preferredView
      : (detailGalleryImages[0]?.view || 'front');

  renderDetailGallery();
};


/* ==============================
   ギャラリー表示
================================ */

const renderDetailGallery=()=>{

  const item=
    detailGalleryImages.find(
      x=>x.view===currentDetailView
    ) || detailGalleryImages[0];

  if(!item)return;

  detailImage.src=item.src;
  detailImage.alt=item.alt;

  detailViewLabel.textContent=
    item.view==='front'
      ? 'FRONT / 表'
      : item.view==='back'
        ? 'BACK / 裏'
        : item.view==='model-front'
          ? 'MODEL / FRONT'
          : 'MODEL / BACK';

  detailGalleryTabs
    .querySelectorAll('button')
    .forEach(btn=>{
      btn.classList.toggle(
        'active',
        btn.dataset.view===item.view
      );
    });
};


/* ==============================
   カラー選択肢
================================ */

const configureColorOptions=()=>{

  const women=
    currentDetailProduct?.dataset?.gender==='WOMEN';

  const buttons=[
    ...detailColorOptions.querySelectorAll('.detail-color')
  ];

  if(women){

    buttons[0].style.display='';
    buttons[0].dataset.color='WHITE × GREEN';
    buttons[0].textContent='WHITE × GREEN';

    buttons[1].style.display='';
    buttons[1].dataset.color='NAVY × PINK';
    buttons[1].textContent='NAVY × PINK';

  }else{

    buttons[0].style.display='';
    buttons[0].dataset.color='GREEN';
    buttons[0].textContent='GREEN';

    buttons[1].style.display='';
    buttons[1].dataset.color='WHITE';
    buttons[1].textContent='WHITE';
  }
};


/* ==============================
   カラー変更
================================ */

const setDetailColor=(color)=>{

  if(!currentDetailProduct)return;

  currentDetailColor=color;

  const variant=
    getVariantProduct(
      currentDetailProduct,
      color
    );

  currentDetailProduct=variant;

  configureColorOptions();

  detailCategory.textContent=
    variant.dataset.category ||
    'POLO SHIRT / '+color;

  detailTitle.textContent=
    variant.dataset.name;

  detailPrice.innerHTML=
    '¥'+
    Number(variant.dataset.price).toLocaleString()+
    ' <small>(税込)</small>';

  detailDescription.textContent=
    variant.dataset.description ||
    'Mulligan Waggleのプロダクト詳細をご覧ください。';

  detailFeatures.textContent=
    variant.dataset.features ||
    '上質な素材感・快適な着心地';

  detailSelectedColor.textContent=color;

  detailColorOptions
    .querySelectorAll('.detail-color')
    .forEach(btn=>{
      btn.classList.toggle(
        'active',
        btn.dataset.color===color
      );
    });

  buildDetailGallery(
    color,
    currentDetailView
  );
};


/* ==============================
   商品詳細を開く
================================ */

const openDetail=(product)=>{

  currentDetailProduct=product;

  configureColorOptions();

  const initialColor=
    product.dataset.gender==='WOMEN'
      ? (
          product.dataset.variant ||
          'WHITE × GREEN'
        )
      : (
          (
            product.dataset.name
              .match(/(GREEN|WHITE)\s*$/i)||[]
          )[1]?.toUpperCase() || 'GREEN'
        );

  currentDetailView='front';

  setDetailColor(initialColor);

  setDetailSize('M');

  detailModal.classList.add('show');

  detailModal.setAttribute(
    'aria-hidden',
    'false'
  );

  document.body.style.overflow='hidden';
};


/* ==============================
   サイズ変更
================================ */

const setDetailSize=(size)=>{

  currentDetailSize=size;

  detailSelectedSize.textContent=size;

  detailSizeOptions
    .querySelectorAll('.detail-size')
    .forEach(btn=>{
      btn.classList.toggle(
        'active',
        btn.dataset.size===size
      );
    });
};


/* ==============================
   商品詳細を閉じる
================================ */

const closeDetail=()=>{

  detailModal.classList.remove('show');

  detailModal.setAttribute(
    'aria-hidden',
    'true'
  );

  document.body.style.overflow='';

  currentDetailProduct=null;
};


/* ==============================
   商品詳細ボタン
================================ */

document
  .querySelectorAll('.detail-trigger')
  .forEach(btn=>{

    btn.addEventListener(
      'click',
      ()=>{
        openDetail(
          btn.closest('.product')
        );
      }
    );

  });


/* ==============================
   カラーボタン
================================ */

detailColorOptions
  .querySelectorAll('.detail-color')
  .forEach(btn=>{

    btn.addEventListener(
      'click',
      ()=>{
        setDetailColor(
          btn.dataset.color
        );
      }
    );

  });


/* ==============================
   サイズボタン
================================ */

detailSizeOptions
  .querySelectorAll('.detail-size')
  .forEach(btn=>{

    btn.addEventListener(
      'click',
      ()=>{
        setDetailSize(
          btn.dataset.size
        );
      }
    );

  });


/* ==============================
   ギャラリータブ
================================ */

detailGalleryTabs
  .querySelectorAll('button')
  .forEach(btn=>{

    btn.addEventListener(
      'click',
      ()=>{
        currentDetailView=btn.dataset.view;
        renderDetailGallery();
      }
    );

  });


/* ==============================
   前の画像
================================ */

document.getElementById('detailPrev').onclick=()=>{

  if(detailGalleryImages.length<2)return;

  const i=
    detailGalleryImages.findIndex(
      x=>x.view===currentDetailView
    );

  currentDetailView=
    detailGalleryImages[
      (i-1+detailGalleryImages.length)
      % detailGalleryImages.length
    ].view;

  renderDetailGallery();
};


/* ==============================
   次の画像
================================ */

document.getElementById('detailNext').onclick=()=>{

  if(detailGalleryImages.length<2)return;

  const i=
    detailGalleryImages.findIndex(
      x=>x.view===currentDetailView
    );

  currentDetailView=
    detailGalleryImages[
      (i+1)%detailGalleryImages.length
    ].view;

  renderDetailGallery();
};


/* ==============================
   詳細閉じる
================================ */

document.getElementById('detailClose').onclick=
  closeDetail;

document.getElementById('detailBackdrop').onclick=
  closeDetail;

document.addEventListener(
  'keydown',
  e=>{
    if(
      e.key==='Escape' &&
      detailModal.classList.contains('show')
    ){
      closeDetail();
    }
  }
);


/* ==============================
   カートに追加
================================ */

document.getElementById('detailAdd').onclick=()=>{

  if(!currentDetailProduct)return;

  const p=currentDetailProduct;

  cart.push({
    name:p.dataset.name,
    price:+p.dataset.price,
    color:currentDetailColor,
    size:currentDetailSize
  });

  renderCart();

  closeDetail();

  toast.classList.add('show');

  setTimeout(
    ()=>toast.classList.remove('show'),
    1400
  );
};


/* ==============================
   商品カードから直接追加
================================ */

document
  .querySelectorAll('.add')
  .forEach(btn=>{

    btn.addEventListener(
      'click',
      ()=>{

        const p=btn.closest('.product');

        const isWomen=
          p.dataset.gender==='WOMEN';

        const color=
          isWomen
            ? (p.dataset.variant || '')
            : (
                (
                  p.dataset.name
                    .match(/(GREEN|WHITE)\s*$/i)||[]
                )[1]?.toUpperCase() || ''
              );

        cart.push({
          name:p.dataset.name,
          price:+p.dataset.price,
          color:color,
          size:'M'
        });

        renderCart();

        toast.classList.add('show');

        setTimeout(
          ()=>toast.classList.remove('show'),
          1400
        );
      }
    );

  });


/* ==============================
   カート表示
================================ */

function renderCart(){

  const box=
    document.getElementById('cartItems');

  const total=
    cart.reduce(
      (s,x)=>s+x.price,
      0
    );

  box.innerHTML=
    cart.length
      ? cart.map(
          (x,i)=>`
            <div class="cart-row">
              <span>
                ${x.name}<br>
                COLOR ${x.color||'-'}　SIZE ${x.size||'M'}<br>
                数量 1
              </span>

              <span>
                ¥${x.price.toLocaleString()}
                <button
                  onclick="removeItem(${i})"
                  style="border:0;background:none;cursor:pointer"
                >
                  ×
                </button>
              </span>
            </div>
          `
        ).join('')
      : '<p class="empty">カートは空です。</p>';

  document.getElementById('total').textContent=
    '¥'+total.toLocaleString();
}


/* ==============================
   カート商品削除
================================ */

window.removeItem=i=>{
  cart.splice(i,1);
  renderCart();
};


/* ==============================
   決済
================================ */

document.getElementById('checkout').onclick=()=>{
  alert(
    'EC決済を接続すると、ここから購入手続きへ進めます。'
  );
};


/* ==============================
   ニュースレター
================================ */

document
  .querySelectorAll('form')
  .forEach(form=>{

    form.addEventListener(
      'submit',
      e=>{
        e.preventDefault();

        alert('登録ありがとうございます。');

        form.reset();
      }
    );

  });


/* ==============================
   モバイルメニュー
================================ */

document.getElementById('menuBtn').onclick=()=>{
  document
    .querySelector('.nav')
    .classList.toggle('mobile-open');
};