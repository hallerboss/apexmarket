import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_DATA = [
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "How long does shipping take?",
        a: "Standard shipping takes 5-10 business days within the US and 10-21 business days for international orders. Express shipping (2-4 business days) is available at checkout for an additional fee. You'll receive a tracking number via email once your order ships.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free standard shipping on all orders over $50 within the United States. Orders under $50 ship for a flat rate of $9.99. International shipping costs are calculated at checkout based on destination and weight.",
      },
      {
        q: "Which countries do you ship to?",
        a: "We ship to over 80 countries worldwide. If your country is available in the checkout dropdown, we can ship to you. Delivery times and costs vary by destination. Customs duties and import taxes are the responsibility of the buyer.",
      },
      {
        q: "Can I track my order?",
        a: "Absolutely. Once your order ships, you'll receive an email with a tracking number. You can also track your order anytime by visiting our Track Order page and entering your order number or email address.",
      },
      {
        q: "What if my package is lost or damaged?",
        a: "If your package arrives damaged or gets lost in transit, contact us within 7 days of the expected delivery date. We'll work with the carrier to file a claim and send you a replacement or issue a full refund.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 30-day return policy on all unused items in their original packaging. If you're not completely satisfied with your purchase, you can return it for a full refund or exchange within 30 days of delivery.",
      },
      {
        q: "How do I start a return?",
        a: "To initiate a return, go to our Contact page and send us your order number and the reason for the return. We'll email you a return shipping label and instructions within 24 hours.",
      },
      {
        q: "Who pays for return shipping?",
        a: "If the return is due to a defect or our error, we cover the full return shipping cost. For all other returns (change of mind, wrong size, etc.), the customer is responsible for return shipping unless the item was damaged upon arrival.",
      },
      {
        q: "When will I get my refund?",
        a: "Refunds are processed within 3-5 business days after we receive and inspect the returned item. The refund will be credited to your original payment method. Depending on your bank, it may take an additional 3-5 days to appear on your statement.",
      },
      {
        q: "Can I exchange an item instead of returning it?",
        a: "Yes! Exchanges are free within 30 days. Contact us with your order number and the item you'd like instead, and we'll arrange the exchange with no additional shipping fees.",
      },
    ],
  },
  {
    category: "Store Policies",
    questions: [
      {
        q: "Is it safe to shop on your website?",
        a: "Yes. Our checkout is powered by Stripe, a PCI-compliant payment processor. Your payment information is encrypted and never stored on our servers. We use SSL encryption across the entire site to protect your data.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover), as well as Apple Pay and Google Pay through our Stripe-powered checkout. All transactions are secure and encrypted.",
      },
      {
        q: "Do you offer a warranty?",
        a: "Most products come with a 2-year manufacturer warranty covering defects in materials and workmanship. Warranty details vary by product and are listed on each product page. Contact us if you need to file a warranty claim.",
      },
      {
        q: "Can I cancel or modify my order?",
        a: "Orders can be cancelled or modified within 1 hour of placement. After that, the order enters our fulfillment process and changes may not be possible. Contact us immediately if you need to cancel — we'll do our best to accommodate.",
      },
      {
        q: "Do you offer discounts or promotions?",
        a: "Yes! Sign up for our newsletter to receive exclusive offers and early access to sales. We also run seasonal promotions and holiday sales. Check the Seasonal Picks section on our homepage for current deals.",
      },
      {
        q: "How do I contact customer support?",
        a: "You can reach us through our Contact page, or email us directly. Our support team is available Monday-Friday, 9am-6pm. We typically respond within 24 hours on business days.",
      },
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <section className="border-b hairline">
        <div className="container-bleed px-5 lg:px-10 py-16 lg:py-24 text-center">
          <div className="w-14 h-14 border hairline rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-6 h-6 text-accent" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-4">Help Center</p>
          <h1 className="display-text text-4xl lg:text-6xl">Frequently Asked Questions</h1>
          <p className="serif-text text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
            Find quick answers about shipping, returns, and our store policies.
          </p>
        </div>
      </section>

      <section className="container-bleed px-5 lg:px-10 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto space-y-12">
          {FAQ_DATA.map((section, si) => (
            <div key={si}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-foreground" />
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.questions.map((item, qi) => {
                  const id = `${si}-${qi}`;
                  const isOpen = open === id;
                  return (
                    <div key={id} className="border hairline bg-card">
                      <button
                        onClick={() => setOpen(isOpen ? null : id)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <span className="text-sm font-medium pr-4">{item.q}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
                        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 text-center border hairline bg-card p-8 lg:p-12">
          <h3 className="text-lg font-bold mb-2">Still have questions?</h3>
          <p className="text-sm text-muted-foreground mb-6">Our support team is here to help.</p>
          <Link to="/contact" className="btn-mono-solid">Contact Us</Link>
        </div>
      </section>
    </div>
  );
}