const { createClient } = require('@supabase/supabase-js');

function makeOrderNumber(){
  const now=new Date();
  const ymd=[
    now.getUTCFullYear(),
    String(now.getUTCMonth()+1).padStart(2,'0'),
    String(now.getUTCDate()).padStart(2,'0')
  ].join('');
  return `MW-${ymd}-${Math.floor(100+Math.random()*900)}`;
}

function validEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports=async function handler(req,res){
  if(req.method!=='POST'){
    return res.status(405).json({error:'Method Not Allowed'});
  }

  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;

  if(!url||!key){
    return res.status(500).json({error:'注文受付サーバーの設定がまだ完了していません。'});
  }

  try{
    const body=req.body||{};
    const c=body.customer||{};
    const items=Array.isArray(body.items)?body.items:[];
    const total=Number(body.total);

    if(!c.name||!validEmail(c.email)||!c.tel||!c.postal||!c.prefecture||!c.address){
      return res.status(400).json({error:'必須項目を入力してください。'});
    }

    if(!items.length){
      return res.status(400).json({error:'カートに商品がありません。'});
    }

    const cleanItems=items.map(item=>({
      name:String(item.name||'').slice(0,200),
      price:Number(item.price),
      color:String(item.color||'').slice(0,80),
      size:String(item.size||'').slice(0,20),
      quantity:Math.max(1,Number(item.quantity)||1)
    }));

    const calculatedTotal=cleanItems.reduce(
      (sum,item)=>sum+item.price*item.quantity,0
    );

    if(!Number.isFinite(total)||calculatedTotal!==total){
      return res.status(400).json({error:'注文金額を確認できませんでした。'});
    }

    const orderNumber=makeOrderNumber();
    const supabase=createClient(url,key,{auth:{persistSession:false}});

    const {error}=await supabase.from('orders').insert({
      order_number:orderNumber,
      customer_name:c.name,
      email:c.email,
      phone:c.tel,
      postal_code:c.postal,
      prefecture:c.prefecture,
      address:c.address,
      building:c.building||null,
      note:c.note||null,
      items:cleanItems,
      total:calculatedTotal,
      status:'received'
    });

    if(error){
      console.error(error);
      return res.status(500).json({error:'注文の保存に失敗しました。'});
    }

    return res.status(200).json({ok:true,orderNumber});

  }catch(error){
    console.error(error);
    return res.status(500).json({error:'注文受付中にエラーが発生しました。'});
  }
};
