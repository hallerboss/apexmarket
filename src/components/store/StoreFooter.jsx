import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook } from "lucide-react";

export default function StoreFooter() {
  return (
    <footer className="border-t hairline mt-24">
      <div className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-2 lg:col-span-4">
            <h2 className="display-text text-3xl mb-4">WOLMART</h2>
            <p className="serif-text text-muted-foreground max-w-xs leading-relaxed">
              A high-fidelity retail ecosystem. Curated discovery, frictionless commerce.
            </p>
            <div className="flex gap-4 mt-6">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 border hairline flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 lg:col-start-7">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-5">Shop</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/shop" className="hover:text-foreground">All Products</Link></li>
              <li><Link to="/shop?category=Electronics" className="hover:text-foreground">Electronics</Link></li>
              <li><Link to="/shop?category=Fashion" className="hover:text-foreground">Fashion</Link></li>
              <li><Link to="/shop?category=Furniture" className="hover:text-foreground">Furniture</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-5">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
              <li><Link to="/page/shipping" className="hover:text-foreground">Shipping</Link></li>
              <li><Link to="/page/returns" className="hover:text-foreground">Returns</Link></li>
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-5">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">Join the list. No noise.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex border-b hairline">
              <input type="email" placeholder="Email" className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/50" />
              <button className="text-[11px] uppercase tracking-[0.2em] font-semibold hover:text-accent">→</button>
            </form>
          </div>
        </div>
        <div className="border-t hairline mt-16 pt-8 flex flex-col md:flex-row justify-between gap-4 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          <p>© 2024 Wolmart. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/page/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/page/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/admin" className="hover:text-foreground">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}