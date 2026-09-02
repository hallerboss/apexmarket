// Self-contained static HTML snapshot of the ApexMarket storefront.
// Visual reproduction only — no live backend, cart, checkout or admin.
export function getStaticSiteHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ApexMarket — Premium Marketplace</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',system-ui,sans-serif;background:#fff;color:#0a0a0a;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  img{display:block;max-width:100%}
  .wrap{max-width:1600px;margin:0 auto;padding:0 20px}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.2em;transition:.3s;cursor:pointer;border:0}
  .btn-solid{background:#0a0a0a;color:#fff}
  .btn-accent{background:#3b82f6;color:#fff}
  .btn:hover{opacity:.85}
  header{position:sticky;top:0;background:#fff;border-bottom:1px solid #eee;z-index:30}
  .top{display:flex;align-items:center;justify-content:space-between;gap:16px;height:72px}
  .logo{display:flex;align-items:center;gap:8px;font-size:22px;font-weight:700}
  .logo span{width:28px;height:28px;background:#3b82f6;color:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700}
  .search{flex:1;max-width:560px;display:flex;align-items:center;border:1px solid #e5e7eb;border-radius:6px;padding:10px 14px}
  .search input{border:0;outline:0;flex:1;font-size:14px;background:transparent}
  .actions{display:flex;align-items:center;gap:18px;font-size:18px}
  .cart{position:relative}
  .cart .badge{position:absolute;top:-6px;right:-6px;background:#3b82f6;color:#fff;font-size:10px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700}
  .catnav{display:flex;gap:24px;border-top:1px solid #f0f0f0;padding:12px 0;overflow-x:auto}
  .catnav a{font-size:13px;color:#444;white-space:nowrap}
  .catnav a:hover{color:#3b82f6}
  .hero{padding:48px 0 24px}
  .hero h1{font-size:48px;font-weight:800;letter-spacing:-.02em;line-height:1.05;margin-bottom:16px}
  .hero p{font-size:16px;color:#555;max-width:520px;margin-bottom:24px}
  .hero-grid{display:grid;grid-template-columns:1fr;gap:24px}
  @media(min-width:768px){.hero-grid{grid-template-columns:2fr 1fr}}
  .hero-main{height:360px;border-radius:8px;overflow:hidden;background:#f3f4f6}
  .hero-main img{width:100%;height:100%;object-fit:cover}
  .hero-side{display:grid;grid-template-rows:1fr 1fr;gap:24px}
  .hero-card{height:168px;border-radius:8px;overflow:hidden;background:#f3f4f6}
  .hero-card img{width:100%;height:100%;object-fit:cover}
  section{padding:40px 0}
  .sec-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
  .sec-title h2{font-size:28px;font-weight:800;letter-spacing:-.02em}
  .sec-title a{font-size:12px;text-transform:uppercase;letter-spacing:.15em;color:#3b82f6;font-weight:600}
  .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
  @media(min-width:768px){.grid{grid-template-columns:repeat(4,1fr)}}
  .card{background:#fff;border:1px solid #eee;border-radius:8px;overflow:hidden;transition:.3s}
  .card:hover{box-shadow:0 8px 30px rgba(0,0,0,.08)}
  .card .img{aspect-ratio:3/4;background:#f3f4f6;overflow:hidden;position:relative}
  .card .img img{width:100%;height:100%;object-fit:cover;transition:.5s}
  .card:hover .img img{transform:scale(1.04)}
  .card .body{padding:14px}
  .card .brand{font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:#3b82f6;font-weight:600;margin-bottom:4px}
  .card .name{font-size:14px;font-weight:600;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .card .price{font-size:16px;font-weight:700}
  .card .price del{color:#999;font-weight:400;font-size:13px;margin-left:6px}
  .card .add{margin-top:10px;width:100%;background:#facc15;color:#0a0a0a;border:0;padding:10px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;text-transform:uppercase;letter-spacing:.1em}
  .badge{position:absolute;top:10px;left:10px;font-size:10px;font-weight:700;text-transform:uppercase;padding:4px 8px;border-radius:4px;color:#fff}
  .sale{background:#ef4444}.new{background:#10b981}
  .promo{background:#f3f4f6;border-radius:12px;padding:48px;text-align:center;margin:40px 0}
  .promo h2{font-size:32px;font-weight:800;margin-bottom:12px}
  .promo p{color:#555;margin-bottom:20px}
  footer{background:#0a0a0a;color:#fff;padding:60px 0 30px;margin-top:40px}
  .foot-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
  @media(max-width:768px){.foot-grid{grid-template-columns:1fr 1fr}}
  footer h4{font-size:13px;text-transform:uppercase;letter-spacing:.15em;margin-bottom:16px;color:#888}
  footer a{display:block;font-size:14px;color:#ccc;margin-bottom:10px}
  footer a:hover{color:#fff}
  .foot-bottom{border-top:1px solid #222;margin-top:40px;padding-top:20px;font-size:12px;color:#666;text-align:center}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="top">
      <a class="logo" href="#"><span>w</span>wolmart</a>
      <div class="search"><input placeholder="Search products…" /></div>
      <div class="actions">
        <a href="#">Profile</a>
        <a class="cart" href="#">Cart<span class="badge">2</span></a>
      </div>
    </div>
    <nav class="catnav">
      <a href="#">Home</a><a href="#">Shop</a><a href="#">Electronics</a><a href="#">Fashion</a><a href="#">Furniture</a><a href="#">About</a><a href="#">Track Order</a><a href="#">My Orders</a>
    </nav>
  </div>
</header>

<div class="wrap">
  <div class="hero">
    <div class="hero-grid">
      <div class="hero-main"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200" alt="Hero" /></div>
      <div class="hero-side">
        <div class="hero-card"><img src="https://images.unsplash.com/photo-1556905055-8f358a7f472f?w=600" alt="Promo" /></div>
        <div class="hero-card"><img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600" alt="Promo" /></div>
      </div>
    </div>
  </div>

  <section>
    <div class="sec-title"><h2>Featured Products</h2><a href="#">View All</a></div>
    <div class="grid">
      <div class="card"><div class="img"><span class="badge sale">Sale</span><img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" alt="" /></div><div class="body"><div class="brand">Audio</div><div class="name">Wireless Headphones</div><div class="price">$129.99 <del>$199.99</del></div><button class="add">Add to cart</button></div></div>
      <div class="card"><div class="img"><span class="badge new">New</span><img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600" alt="" /></div><div class="body"><div class="brand">Watches</div><div class="name">Smart Watch Pro</div><div class="price">$249.00</div><button class="add">Add to cart</button></div></div>
      <div class="card"><div class="img"><img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600" alt="" /></div><div class="body"><div class="brand">Footwear</div><div class="name">Running Sneakers</div><div class="price">$89.50</div><button class="add">Add to cart</button></div></div>
      <div class="card"><div class="img"><img src="https://images.unsplash.com/photo-1546868871-7041f09a5373?w=600" alt="" /></div><div class="body"><div class="brand">Cameras</div><div class="name">Mirrorless Camera</div><div class="price">$899.00</div><button class="add">Add to cart</button></div></div>
    </div>
  </section>

  <div class="promo">
    <h2>Mid-Season Sale — Up to 50% Off</h2>
    <p>Premium objects, curated for the modern home. Limited time only.</p>
    <a class="btn btn-accent" href="#">Shop the Sale</a>
  </div>

  <section>
    <div class="sec-title"><h2>New Arrivals</h2><a href="#">View All</a></div>
    <div class="grid">
      <div class="card"><div class="img"><img src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600" alt="" /></div><div class="body"><div class="brand">Tech</div><div class="name">Laptop Stand</div><div class="price">$59.00</div><button class="add">Add to cart</button></div></div>
      <div class="card"><div class="img"><img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600" alt="" /></div><div class="body"><div class="brand">Eyewear</div><div class="name">Classic Sunglasses</div><div class="price">$45.00</div><button class="add">Add to cart</button></div></div>
      <div class="card"><div class="img"><img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600" alt="" /></div><div class="body"><div class="brand">Bags</div><div class="name">Leather Backpack</div><div class="price">$120.00</div><button class="add">Add to cart</button></div></div>
      <div class="card"><div class="img"><img src="https://images.unsplash.com/photo-1585386959984-a415522460b7?w=600" alt="" /></div><div class="body"><div class="brand">Home</div><div class="name">Ceramic Vase</div><div class="price">$38.00</div><button class="add">Add to cart</button></div></div>
    </div>
  </section>

  <section>
    <div class="sec-title"><h2>Best Sellers</h2><a href="#">View All</a></div>
    <div class="grid">
      <div class="card"><div class="img"><img src="https://images.unsplash.com/photo-1583394838336-acd977371d6c?w=600" alt="" /></div><div class="body"><div class="brand">Skincare</div><div class="name">Daily Serum</div><div class="price">$32.00</div><button class="add">Add to cart</button></div></div>
      <div class="card"><div class="img"><img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600" alt="" /></div><div class="body"><div class="brand">Audio</div><div class="name">Bluetooth Speaker</div><div class="price">$79.00</div><button class="add">Add to cart</button></div></div>
      <div class="card"><div class="img"><img src="https://images.unsplash.com/photo-1491553895911-0055eca64082?w=600" alt="" /></div><div class="body"><div class="brand">Footwear</div><div class="name">Classic Trainers</div><div class="price">$99.00</div><button class="add">Add to cart</button></div></div>
      <div class="card"><div class="img"><img src="https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600" alt="" /></div><div class="body"><div class="brand">Home</div><div class="name">Desk Lamp</div><div class="price">$65.00</div><button class="add">Add to cart</button></div></div>
    </div>
  </section>
</div>

<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div><h4>Company</h4><a href="#">About Us</a><a href="#">Contact</a><a href="#">Careers</a></div>
      <div><h4>Shop</h4><a href="#">All Products</a><a href="#">Electronics</a><a href="#">Fashion</a><a href="#">Furniture</a></div>
      <div><h4>Support</h4><a href="#">Track Order</a><a href="#">My Orders</a><a href="#">Returns</a><a href="#">FAQ</a></div>
      <div><h4>Legal</h4><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Admin Panel</a></div>
    </div>
    <div class="foot-bottom">© 2026 ApexMarket. All rights reserved.</div>
  </div>
</footer>
</body>
</html>`;
}