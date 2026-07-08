import{a as e}from"./chunk-3KV6W673.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Flyweight** pattern shares **fine-grained objects** efficiently by splitting state into **intrinsic** (shared, immutable) and **extrinsic** (context-specific, passed in). Thousands of logical objects reuse a small set of shared flyweights."},{type:"callout",variant:"info",title:"Memory win",body:"If 100,000 map pins share 20 icon bitmaps, store the bitmaps once and keep only position/label per pin \u2014 not 100,000 full icon copies."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **book printing press**: the letter \u201CA\u201D glyph (shape, font metrics) is shared; each printed occurrence has its own position on the page. Glyph = intrinsic; coordinates = extrinsic."},{type:"table",headers:["State type","Meaning","Example"],rows:[["Intrinsic","Shareable, independent of context","Tree type texture, species name"],["Extrinsic","Unique per use, passed by client","Tree x/y on the map"]]},{type:"mermaid",caption:"Factory vends shared flyweights.",definition:`flowchart LR
  Client --> Factory[TreeTypeFactory]
  Factory --> Oak[(TreeType: Oak)]
  Factory --> Pine[(TreeType: Pine)]
  Client --> T1[Tree @ 10,20]
  Client --> T2[Tree @ 30,40]
  T1 --> Oak
  T2 --> Oak`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Text editors","Character / glyph flyweights in a document"],["Games","Particle types, bullet sprites, terrain tiles"],["Maps","Shared POI icons; per-marker lat/lng"],["String interning","JVM string pool (related sharing idea)"],["UI","Style objects shared across many widgets"],["CAD","Shared line styles / hatch patterns across shapes"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Forest of trees: share `TreeType` (texture + color); each `Tree` only stores coordinates."},{type:"code",language:"java",filename:"TreeFlyweight.java",code:`import java.util.HashMap;
import java.util.Map;

/** Intrinsic state \u2014 shared. */
public final class TreeType {
  private final String name;
  private final String color;
  private final String textureKey;

  public TreeType(String name, String color, String textureKey) {
    this.name = name;
    this.color = color;
    this.textureKey = textureKey;
  }

  public void draw(int x, int y) {
    System.out.printf("Draw %s (%s) at (%d,%d) using %s%n",
        name, color, x, y, textureKey);
  }
}

public class TreeTypeFactory {
  private final Map<String, TreeType> cache = new HashMap<>();

  public TreeType get(String name, String color, String textureKey) {
    String key = name + ":" + color + ":" + textureKey;
    return cache.computeIfAbsent(key, k -> new TreeType(name, color, textureKey));
  }

  public int sharedCount() { return cache.size(); }
}

/** Extrinsic state lives on the context object. */
public class Tree {
  private final int x;
  private final int y;
  private final TreeType type;

  public Tree(int x, int y, TreeType type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  public void draw() { type.draw(x, y); }
}

// 1M oak trees share one TreeType
TreeTypeFactory factory = new TreeTypeFactory();
TreeType oak = factory.get("Oak", "green", "oak.png");
Tree a = new Tree(10, 20, oak);
Tree b = new Tree(30, 40, oak);
a.draw();
b.draw();
System.out.println(factory.sharedCount()); // 1`},{type:"prosCons",title:"Trade-offs",pros:["Huge memory savings when many objects share data.","Encourages immutable shared state (thread-friendlier).","Natural with factories / caches of shared types."],cons:["Code complexity: must carefully split intrinsic/extrinsic.","Runtime cost of looking up shared flyweights.","Useless if objects do not share meaningful state."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is Flyweight?",answer:"A pattern that minimizes memory by **sharing intrinsic state** across many fine-grained objects while keeping **extrinsic state** outside the shared object."},{question:"Intrinsic vs extrinsic state?",answer:"**Intrinsic** is shareable and context-free (font glyph, tree texture). **Extrinsic** depends on context and is supplied by the client (position, selected flag)."},{question:"How does a flyweight factory help?",answer:"It **caches** flyweights by key so clients reuse the same instance instead of allocating duplicates. Often a map from type key \u2192 flyweight."},{question:"Flyweight vs Singleton?",answer:"Singleton is one instance of a type for the app. Flyweight is **many shared instances of fine-grained types** (one per distinct intrinsic key), used by many contexts."},{question:"Flyweight vs Object Pool?",answer:"Pool **reuses mutable instances** via borrow/return for expensive lifecycle. Flyweight **shares immutable intrinsic data**; contexts are usually cheap wrappers, not borrowed exclusives."},{question:"When would you use it in an interview LLD?",answer:"Game map with millions of similar tiles/trees; text editor characters; ride-hailing map markers sharing vehicle-type icons. Emphasize memory math in the answer."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Share **intrinsic** state; pass **extrinsic** state in.
2. Real uses: **glyphs, game sprites, map icons, styles**.
3. Factory/cache is almost always part of the design.
4. Contrast with Singleton (one object) and Object Pool (borrow/return).`}]}]},a=t;export{a as default};
