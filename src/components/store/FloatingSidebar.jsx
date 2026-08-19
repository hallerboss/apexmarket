import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, Info, MessageCircle, Star, ShoppingBag, ArrowUp } from "lucide-react";
import { useCart } from "@/lib/cartContext";

export default function FloatingSidebar() {
  const [show, setShow] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { Icon: Home, to: "/" },
    { Icon: Info, to: "/page/about" },
    { Icon: MessageCircle, to: "/page/contact" },
    { Icon: Star, to: "/shop" },
  ];

  return (
    <div className="fixed right-4 bottom-6 z-40 flex flex-col items-center gap-3">
      <div className="flex flex-col items-center gap-2 bg-[#333] rounded-full py-3 px-1.5 shadow-lg">
        {nav.map(({ Icon, to }, i) => (
          <Link key={i} to={to} className="w-9 h-9 flex items-center justify-center text-white hover:text-accent transition-colors">
            <Icon className="w-[18px] h-[18px]" />
          </Link>
        ))}
        <Link to="/cart" className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white relative">
          <ShoppingBag className="w-[18px] h-[18px]" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-accent text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>
      {show && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="w-10 h-10 rounded-full bg-[#333] text-white flex items-center justify-center shadow-lg hover:bg-accent transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}