import{a as e}from"./chunk-UXHQ7J5R.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Visitor** separates algorithms from the object structure they operate on. Elements accept a visitor; the visitor implements `visitConcreteA`, `visitConcreteB`, \u2026 \u2014 **double dispatch** picks the right method based on both the element type and the visitor type."},{type:"callout",variant:"warning",title:"Stable structure, growing operations",body:"Visitor shines when the element hierarchy is stable but you keep adding operations (export, validate, metrics). Adding a new element type forces updating all visitors."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **tax auditor** visiting different business types: shop, warehouse, freelancers. Each business \u201Caccepts\u201D the auditor; the auditor\u2019s checklist differs by type \u2014 without rewriting the businesses for every new audit kind."}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Compilers","AST type-check, codegen, pretty-print visitors"],["Documents","Export DOCX structure to PDF/HTML"],["Graphics","Scene graph operations (hit-test, render, serialize)"],["Insurance / billing","Pricing visitors over policy object graphs"],["Static analysis","Lint rules walking a code model"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"code",language:"java",filename:"ShapeVisitor.java",code:`public interface Shape {
  void accept(ShapeVisitor visitor);
}

public class Circle implements Shape {
  final double radius;
  public Circle(double radius) { this.radius = radius; }
  public void accept(ShapeVisitor v) { v.visitCircle(this); }
}

public class Rectangle implements Shape {
  final double w, h;
  public Rectangle(double w, double h) { this.w = w; this.h = h; }
  public void accept(ShapeVisitor v) { v.visitRectangle(this); }
}

public interface ShapeVisitor {
  void visitCircle(Circle c);
  void visitRectangle(Rectangle r);
}

public class AreaVisitor implements ShapeVisitor {
  private double total;
  public void visitCircle(Circle c) { total += Math.PI * c.radius * c.radius; }
  public void visitRectangle(Rectangle r) { total += r.w * r.h; }
  public double total() { return total; }
}

// usage
AreaVisitor area = new AreaVisitor();
for (Shape s : shapes) s.accept(area);`},{type:"prosCons",title:"Trade-offs",pros:["Add operations without modifying element classes.","Related behavior for all types lives in one visitor.","Classic fit for ASTs and document object models."],cons:["Adding a new element type breaks all visitors.","Breaks encapsulation if visitors need private data.","Verbose; overkill for simple hierarchies."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is double dispatch in Visitor?",answer:"The call `element.accept(visitor)` dispatches on the **element** type; inside, `visitor.visitX(this)` dispatches on the **visitor** type \u2014 selecting the method based on both."},{question:"When should you avoid Visitor?",answer:"When the object structure changes often, or when operations fit naturally as methods on the types (and you do not need many external algorithms)."},{question:"Visitor vs Iterator?",answer:"Iterator provides traversal; the client operates on elements. Visitor packages type-specific operations and usually controls traversal via `accept` recursion."},{question:"LLD example?",answer:"Shopping cart pricing/tax visitors over item types; compiler AST passes; export a composite document tree to multiple formats."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Move operations into **visitors**; elements \`accept\` them.
2. Best when structure is stable, operations grow.
3. Real uses: **compilers, exporters, scene graphs**.
4. Know the new-element-type pain point.`}]}]},s=t;export{s as default};
