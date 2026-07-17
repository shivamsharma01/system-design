import{a as e}from"./chunk-ZKTIIHFE.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"A deduplicated Java interview question bank ordered from fundamentals to production scenarios. Answers will be added after the smaller technology sections are complete."},{type:"callout",variant:"tip",title:"How to practise",body:"Give a **30-second definition**, explain the **trade-off**, then add a **production example**. For troubleshooting questions, structure the answer as: observe \u2192 isolate \u2192 verify \u2192 fix."}]},{id:"jvm-internals",title:"JVM Internals",blocks:[{type:"markdown",value:`1. What is the difference between Heap and Stack memory?
2. How does the JVM memory model work?
3. Explain the class-loading lifecycle.
4. What are Bootstrap, Platform, and Application ClassLoaders?
5. How does Garbage Collection work internally?
6. G1 GC vs ZGC vs Serial GC?
7. What triggers a Full GC?
8. How do you identify memory leaks in production?
9. What is a heap dump and when would you analyze it?
10. How does the JIT compiler improve performance?
11. What is Escape Analysis?
12. What is Metaspace and how is it different from PermGen?
13. How do you troubleshoot OutOfMemoryError?
14. How do you troubleshoot high CPU usage in JVM applications?
15. What tools do you use for JVM performance analysis?`}]},{id:"design-patterns",title:"Java Design Patterns",blocks:[{type:"markdown",value:`1. What problem does the Factory Pattern solve?
2. Factory Pattern vs Abstract Factory Pattern?
3. When should you use the Builder Pattern?
4. Why is Builder preferred for immutable objects?
5. How do you implement a thread-safe Singleton?
6. What are the drawbacks of Singleton?
7. Explain the Strategy Pattern with a real-world example.
8. When would you use the Observer Pattern?
9. How is Observer used in event-driven systems?
10. Adapter Pattern vs Decorator Pattern?
11. How is Template Method different from Strategy?
12. What is Dependency Injection and which pattern does it use?
13. Which design patterns are commonly used in Spring Framework?
14. Which design patterns are most commonly used in microservices?`}]},{id:"core-java",title:"Core Java",blocks:[{type:"markdown",value:`1. What is the Java Memory Model (JMM)?
2. Difference between final, finally, and finalize()?
3. How do you prevent OutOfMemoryError?
4. What is polymorphism?
5. What is inheritance?
6. Method overloading vs method overriding?
7. Difference between == and equals()?
8. HashMap vs ConcurrentHashMap?
9. What are checked and unchecked exceptions?
10. What does volatile guarantee?
11. Explain the synchronized keyword.
12. ArrayList vs LinkedList?
13. Create a Singleton class.
14. Implement a stack using queues.
15. Which Java 8 features matter most?
16. Which Java 17 features matter most?
17. Java 8 vs Java 17?
18. What is the Stream API?
19. What are lambda expressions?
20. What is Optional and when should it be avoided?`}]},{id:"production-scenarios",title:"Concurrency and Production Scenarios",blocks:[{type:"markdown",value:`1. An API works for 100 users but times out at 10K while CPU is 40%. Why?
2. HashMap.get() returns null for an inserted object. Why?
3. Heap keeps growing even after Full GC. How do you debug it?
4. Two threads corrupt inventory count. How do you fix it?
5. Long GC pauses hit production. What do you investigate?
6. Java 21 virtual threads reduce performance. Why?
7. A CompletableFuture chain fails midway. How do you recover?
8. ConcurrentHashMap is thread-safe, yet race conditions exist. Why?
9. Spring @Transactional self-invocation does not roll back. Why?
10. JPA executes 1 + 500 queries. How do you fix it?
11. DB connections are exhausted, but DB CPU is normal. Why?
12. How does a retry storm make an outage worse?
13. Payment succeeds, but Order Service crashes. How do you recover safely?
14. Redis returns stale data. How do you handle cache invalidation?
15. One microservice succeeds and another fails. How do you maintain consistency?
16. Production throws OutOfMemoryError: Metaspace. What could cause it?
17. synchronized fixes correctness but kills throughput. What alternatives exist?
18. Average latency is 200 ms, but p99 is 8 seconds. What is the real problem?
19. How do you process a 5 GB CSV without an OutOfMemoryError?
20. The application becomes slow after hours. Which JVM metrics do you analyze?
21. A ThreadPoolExecutor queue keeps growing. What does it indicate?
22. One downstream API becomes slow. How do you prevent thread exhaustion?`}]}]},a=t;export{a as default};
