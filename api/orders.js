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

function escapeHtml(value){
  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

module.exports=async function handler(req,res){

  if(req.method!=='POST'){
    return res.status(405).json({error:'Method Not Allowed'});
  }

  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;

  if(!url||!key){
    return res.status(500).json({
      error:'注文受付サーバーの設定がまだ完了していません。'
    });
  }

  try{

    const body=req.body||{};
    const c=body.customer||{};
    const items=Array.isArray(body.items)?body.items:[];
    const total=Number(body.total);

    if(
      !c.name||
      !validEmail(c.email)||
      !c.tel||
      !c.postal||
      !c.prefecture||
      !c.address
    ){
      return res.status(400).json({
        error:'必須項目を入力してください。'
      });
    }

    if(!items.length){
      return res.status(400).json({
        error:'カートに商品がありません。'
      });
    }

    const cleanItems=items.map(item=>({
      name:String(item.name||'').slice(0,200),
      price:Number(item.price),
      color:String(item.color||'').slice(0,80),
      size:String(item.size||'').slice(0,20),
      quantity:Math.max(1,Number(item.quantity)||1)
    }));

    const calculatedTotal=cleanItems.reduce(
      (sum,item)=>sum+item.price*item.quantity,
      0
    );

    if(!Number.isFinite(total)||calculatedTotal!==total){
      return res.status(400).json({
        error:'注文金額を確認できませんでした。'
      });
    }

    const orderNumber=makeOrderNumber();

    const supabase=createClient(
      url,
      key,
      {auth:{persistSession:false}}
    );

    // 注文をSupabaseへ保存
    const {error}=await supabase
      .from('orders')
      .insert({
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

      return res.status(500).json({
        error:'注文の保存に失敗しました。'
      });
    }

    // 注文通知メール
    const resendApiKey=process.env.RESEND_API_KEY;
    const notificationTo=process.env.ORDER_NOTIFICATION_TO;

    if(resendApiKey && notificationTo){

      const itemHtml=cleanItems.map(item=>`
        <tr>
          <td style="padding:8px;border-bottom:1px solid #ddd;">
            ${escapeHtml(item.name)}
          </td>
          <td style="padding:8px;border-bottom:1px solid #ddd;">
            ${escapeHtml(item.color)}
          </td>
          <td style="padding:8px;border-bottom:1px solid #ddd;">
            ${escapeHtml(item.size)}
          </td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">
            ¥${item.price.toLocaleString()}
          </td>
        </tr>
      `).join('');

      const emailHtml=`
        <div style="font-family:Arial,'Noto Sans JP',sans-serif;line-height:1.7;color:#222;">
          <h2 style="margin-bottom:4px;">
            Mulligan Waggle 新しい注文
          </h2>

          <p>
            新しい注文を受け付けました。
          </p>

          <div style="background:#f5f5f5;padding:16px;margin:20px 0;">
            <strong>注文番号</strong><br>
            <span style="font-size:20px;">
              ${escapeHtml(orderNumber)}
            </span>
          </div>

          <h3>お客様情報</h3>

          <p>
            <strong>お名前：</strong>
            ${escapeHtml(c.name)}<br>

            <strong>メール：</strong>
            ${escapeHtml(c.email)}<br>

            <strong>電話番号：</strong>
            ${escapeHtml(c.tel)}<br>

            <strong>郵便番号：</strong>
            ${escapeHtml(c.postal)}<br>

            <strong>住所：</strong>
            ${escapeHtml(c.prefecture)}
            ${escapeHtml(c.address)}
            ${escapeHtml(c.building || '')}
          </p>

          <h3>注文内容</h3>

          <table style="border-collapse:collapse;width:100%;max-width:800px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:8px;text-align:left;">商品</th>
                <th style="padding:8px;text-align:left;">カラー</th>
                <th style="padding:8px;text-align:left;">サイズ</th>
                <th style="padding:8px;">数量</th>
                <th style="padding:8px;text-align:right;">価格</th>
              </tr>
            </thead>
            <tbody>
              ${itemHtml}
            </tbody>
          </table>

          <div style="margin-top:20px;font-size:20px;">
            <strong>
              合計：¥${calculatedTotal.toLocaleString()}
            </strong>
          </div>

          ${
            c.note
              ? `
                <h3>備考</h3>
                <p>${escapeHtml(c.note)}</p>
              `
              : ''
          }

          <hr style="margin:30px 0;border:none;border-top:1px solid #ddd;">

          <p style="font-size:12px;color:#777;">
            Mulligan Waggle
          </p>
        </div>
      `;

      try{

        const emailResponse=await fetch(
          'https://api.resend.com/emails',
          {
            method:'POST',
            headers:{
              'Content-Type':'application/json',
              'Authorization':`Bearer ${resendApiKey}`
            },
            body:JSON.stringify({
              from:'Mulligan Waggle <orders@mulliganwaggle.com>',
              to:[notificationTo],
              subject:`【Mulligan Waggle】新しい注文 ${orderNumber}`,
              html:emailHtml
            })
          }
        );

        const emailResult=await emailResponse.json();

        if(!emailResponse.ok){
          console.error('Resend error:',emailResult);
        }

      }catch(emailError){
        console.error('Email notification error:',emailError);
      }
    }

    // メール送信に失敗しても注文自体は成功扱い
    return res.status(200).json({
      ok:true,
      orderNumber
    });

  }catch(error){

    console.error(error);

    return res.status(500).json({
      error:'注文受付中にエラーが発生しました。'
    });
  }
};