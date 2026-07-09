import{a as e}from"./chunk-CDM42IXS.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"A **Unit of Work** tracks changes to multiple objects during a business transaction and **commits them atomically** (or rolls them all back). ORMs like Hibernate implement this via a persistence context / session."},{type:"callout",variant:"info",title:"Pairs with Repository",body:"Repositories load/save aggregates; the Unit of Work decides **when** INSERT/UPDATE/DELETE statements flush as one transaction."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **shopping basket checkout**: you add items, change quantities, remove one \u2014 nothing is charged until you hit \u201CPay.\u201D That final commit is the unit of work; abandoning the cart is rollback."},{type:"mermaid",caption:"Track then commit once.",definition:`sequenceDiagram
  participant S as Service
  participant U as UnitOfWork
  participant DB as Database
  S->>U: register new/dirty/removed
  S->>U: commit()
  U->>DB: BEGIN
  U->>DB: flush all changes
  U->>DB: COMMIT`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["JPA / Hibernate","EntityManager / Session persistence context"],["Entity Framework","DbContext as unit of work"],["Business transactions","Place order: stock + payment + order rows"],["Batch jobs","Accumulate changes then flush in chunks"],["DDD apps","One UoW per use-case / request"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Conceptual unit of work (ORM does this for you in real apps):"},{type:"code",language:"java",filename:"UnitOfWork.java",code:`import java.util.ArrayList;
import java.util.List;

public class UnitOfWork {
  private final List<Object> newObjects = new ArrayList<>();
  private final List<Object> dirtyObjects = new ArrayList<>();
  private final List<Object> removedObjects = new ArrayList<>();
  private final Database db;

  public UnitOfWork(Database db) { this.db = db; }

  public void registerNew(Object entity) { newObjects.add(entity); }
  public void registerDirty(Object entity) { dirtyObjects.add(entity); }
  public void registerRemoved(Object entity) { removedObjects.add(entity); }

  public void commit() {
    db.begin();
    try {
      for (Object o : newObjects) db.insert(o);
      for (Object o : dirtyObjects) db.update(o);
      for (Object o : removedObjects) db.delete(o);
      db.commit();
      clear();
    } catch (RuntimeException ex) {
      db.rollback();
      throw ex;
    }
  }

  private void clear() {
    newObjects.clear();
    dirtyObjects.clear();
    removedObjects.clear();
  }
}

// Spring/JPA equivalent: @Transactional on the use case method.
// Hibernate tracks dirty entities and flushes on commit.`},{type:"prosCons",title:"Trade-offs",pros:["Atomic business operations across multiple objects.","Fewer chatty writes \u2014 flush once per transaction.","Identity map avoids duplicate instances of the same row."],cons:["Long-lived units of work hold memory and DB connections.","Hidden flush timing can surprise developers.","Must keep transaction boundaries aligned with use cases."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is a Unit of Work?",answer:"An object that **tracks changes** during a business transaction and **commits or rolls back** all of them together as one atomic unit."},{question:"How does Hibernate relate?",answer:"The persistence context **is** a unit of work: it tracks loaded entities, detects dirty state, and flushes SQL on transaction commit."},{question:"Unit of Work vs Repository?",answer:"Repository: API to retrieve/persist aggregates. Unit of Work: **transactional change tracker** coordinating when those persists hit the database."},{question:"Where should @Transactional live?",answer:"Usually on the **application service / use case**, not on repositories \u2014 so one business operation = one unit of work."},{question:"What goes wrong with a huge UoW?",answer:"Memory bloat, long locks, and surprising flush costs. Keep units of work short and scoped to one use case."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. UoW = **track changes \u2192 commit atomically**.
2. ORMs implement this via sessions / \`@Transactional\`.
3. Real uses: **multi-entity business transactions**.
4. Pair with Repository; keep boundaries per use case.`}]}]},s=t;export{s as default};
