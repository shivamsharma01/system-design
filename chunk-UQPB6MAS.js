import{a as e}from"./chunk-GQ5K4OFC.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Strategy** defines a family of interchangeable algorithms, encapsulates each one, and makes them swappable at runtime. The context depends on a strategy interface \u2014 not on concrete `if/else` branches for every variant."},{type:"callout",variant:"info",title:"OCP poster child",body:"Add a new pricing or payment algorithm by shipping a new class. The checkout context stays closed for modification \u2014 a classic Open/Closed answer in LLD interviews."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"Choosing a **route to work**: bike, metro, or cab. The goal (get to office) is fixed; the algorithm (how you travel) is swapped based on weather, cost, or time."},{type:"mermaid",caption:"Context delegates to a strategy.",definition:`classDiagram
  class Checkout {
    -pricing: PricingStrategy
    +setStrategy(s)
    +total(cart)
  }
  class PricingStrategy {
    <<interface>>
    +price(cart) Money
  }
  class RegularPricing
  class MemberPricing
  class FlashSalePricing
  Checkout --> PricingStrategy
  PricingStrategy <|.. RegularPricing
  PricingStrategy <|.. MemberPricing
  PricingStrategy <|.. FlashSalePricing`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Payments","Card / UPI / wallet charge strategies"],["E-commerce","Shipping cost or discount policies"],["Compression","Gzip vs Snappy vs none"],["Games","AI difficulty or pathfinding algorithms"],["Sorting / ranking","Pluggable comparators and rankers"],["Auth","Password vs OTP vs SSO verification"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"code",language:"java",filename:"PricingStrategy.java",code:`public interface PricingStrategy {
  Money quote(Cart cart);
}

public class RegularPricing implements PricingStrategy {
  public Money quote(Cart cart) { return cart.subtotal(); }
}

public class MemberPricing implements PricingStrategy {
  public Money quote(Cart cart) {
    return cart.subtotal().percentOff(10);
  }
}

public class Checkout {
  private PricingStrategy pricing;

  public Checkout(PricingStrategy pricing) {
    this.pricing = pricing;
  }

  public void setPricing(PricingStrategy pricing) {
    this.pricing = pricing;
  }

  public Money total(Cart cart) {
    return pricing.quote(cart);
  }
}

// usage
Checkout checkout = new Checkout(new RegularPricing());
checkout.setPricing(new MemberPricing()); // swap at runtime`},{type:"prosCons",title:"Trade-offs",pros:["Eliminates type switches; open for extension.","Each algorithm is independently testable.","Runtime selection via config, flags, or user type."],cons:["More classes for simple one-off branches.","Client must know which strategy to pick (or use a factory)."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain Strategy in one minute.",answer:"Encapsulate interchangeable algorithms behind an interface. A context holds a strategy reference and delegates. You swap strategies without changing the context."},{question:"Strategy vs State?",answer:"Strategy: client/context **chooses** an algorithm. State: the object\u2019s **internal state** decides behavior and often transitions itself. Similar structure; different intent."},{question:"Strategy vs Template Method?",answer:"Template Method uses **inheritance** to fill algorithm steps. Strategy uses **composition** to swap the whole algorithm. Prefer Strategy for runtime flexibility."},{question:"How does it support OCP?",answer:"New behavior = new strategy class. Existing context and other strategies remain unmodified."},{question:"LLD example?",answer:"Parking lot pricing (hourly/daily/airport), ride-hail surge pricing, or payment method processors selected at checkout."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Strategy = **swappable algorithms** via composition.
2. Real uses: **pricing, payments, shipping, compression**.
3. Top LLD pattern for OCP discussions.
4. Contrast with State and Template Method.`}]}]},a=t;export{a as default};
