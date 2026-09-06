import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div>
      <div className="border-b hairline">
        <div className="container-bleed px-5 lg:px-10 py-12 lg:py-20">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-semibold mb-4">About</p>
          <h1 className="display-text text-5xl lg:text-7xl">A curated marketplace, built for modern commerce.</h1>
        </div>
      </div>

      <div className="container-bleed px-5 lg:px-10 py-12 lg:py-20 max-w-3xl">
        <div className="serif-text text-lg lg:text-xl text-muted-foreground leading-relaxed space-y-6">
          <p>
            ApexMarket is a high-fidelity, multi-vendor marketplace designed to make discovery and commerce feel effortless. We bring together a curated catalog of electronics, fashion, furniture, and lifestyle goods under a single, editorially-driven storefront — combining the breadth of a large marketplace with the taste and care of a specialty boutique.
          </p>
          <p>
            Our platform is built for shoppers who value design, transparency, and speed. Whether you are searching for a specific product, comparing options, or exploring new arrivals, ApexMarket offers smart filtering, honest customer reviews, real-time stock, and secure Stripe-powered checkout. Every listing is enriched with rich descriptions, variant imagery, and SEO metadata so you can make confident, informed decisions.
          </p>
          <p>
            For sellers and creators, ApexMarket provides a powerful admin command center for managing inventory, orders, categories, reviews, banners, and media — with bulk editing, AI-assisted product copy, and integrated payments. It is equally suited to independent makers launching their first catalog and established brands scaling operations.
          </p>
          <p>
            ApexMarket is designed and built by the ApexMarket team — a group of engineers, designers, and commerce specialists committed to building retail tools that are as beautiful as they are functional. We are headquartered in San Francisco and serve customers worldwide.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t hairline">
          <Link to="/shop" className="btn-mono-solid">
            Explore the Shop <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}