import{a as e}from"./chunk-GDGFKMXJ.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Interpreter** defines a representation for a simple language\u2019s grammar and an interpreter that evaluates sentences. Each grammar rule becomes a class; expressions form a tree that `interpret(context)` walks."},{type:"callout",variant:"info",title:"Scope",body:"Use for small DSLs and rule languages. For real programming languages, use a proper parser generator / compiler pipeline \u2014 Interpreter alone does not scale."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **music conductor** reading sheet music: notes and rests are the grammar; the orchestra interprets the score into sound. Each symbol has a known meaning in context (tempo, key)."}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Rule engines","\u201Camount > 1000 AND country = IN\u201D"],["Search filters","Query DSLs for product catalogs"],["Config","Feature eligibility expressions"],["SQL-like toys","Teaching interpreters / calculators"],["Regex engines","Conceptual relative \u2014 pattern as language"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"code",language:"java",filename:"RuleInterpreter.java",code:`public interface Expression {
  boolean interpret(OrderContext ctx);
}

public class GreaterThan implements Expression {
  private final String field;
  private final long value;
  public GreaterThan(String field, long value) {
    this.field = field;
    this.value = value;
  }
  public boolean interpret(OrderContext ctx) {
    return ctx.getLong(field) > value;
  }
}

public class And implements Expression {
  private final Expression left, right;
  public And(Expression left, Expression right) {
    this.left = left;
    this.right = right;
  }
  public boolean interpret(OrderContext ctx) {
    return left.interpret(ctx) && right.interpret(ctx);
  }
}

// "total > 1000 AND country == IN"
Expression rule = new And(
    new GreaterThan("totalCents", 1000_00),
    new Equals("country", "IN")
);
boolean eligible = rule.interpret(orderCtx);`},{type:"prosCons",title:"Trade-offs",pros:["Easy to extend grammar with new expression classes.","Maps cleanly to composite expression trees.","Good for configurable business rules."],cons:["Class explosion for rich grammars.","Can be slow without optimization.","Parsing input into the tree is a separate hard problem."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is the Interpreter pattern?",answer:"Represent grammar rules as classes and evaluate sentences by interpreting an expression tree against a context."},{question:"Interpreter vs Visitor?",answer:"Interpreter embeds evaluation in expression nodes (`interpret`). Visitor externalizes operations over a structure. You can evaluate an AST with either approach."},{question:"When is it a bad fit?",answer:"Complex languages, performance-critical parsers, or when a general-purpose scripting engine already exists \u2014 do not reinvent JavaScript."},{question:"LLD example?",answer:"Promo eligibility rules; search filter builder; a calculator for \u201C2 + 3 * 4\u201D as an expression tree."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Grammar as classes; evaluate expression trees.
2. Real uses: **small DSLs, rules, filters**.
3. Not a substitute for full compilers.
4. Often combined with Composite for the tree.`}]}]},a=t;export{a as default};
