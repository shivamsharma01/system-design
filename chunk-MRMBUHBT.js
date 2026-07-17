import{a as o}from"./chunk-WZBNKACY.js";import"./chunk-IFGU66OU.js";var e={meta:o,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"A deduplicated Spring Boot question bank covering request flow, IoC, persistence, transactions, security, observability, and production architecture. Questions progress from framework fundamentals to architect-level scenarios."},{type:"callout",variant:"tip",title:"Strong answer structure",body:"Explain the **Spring abstraction**, the **internal mechanism** (proxy, filter chain, bean lifecycle, or auto-configuration), one **failure mode**, and how you would **observe it in production**."}]},{id:"spring-core",title:"Spring and Web Fundamentals",blocks:[{type:"markdown",value:`1. What happens internally when a REST API request reaches Spring Boot?
2. Explain the DispatcherServlet flow.
3. What is the difference between @Component, @Service, and @Repository?
4. @Autowired vs constructor injection?
5. What is bean scope? Explain Singleton vs Prototype.
6. What is Spring AOP? Where have you used it?
7. How does @Transactional work internally?
8. What causes LazyInitializationException?
9. How do you implement pagination and sorting?
10. How do you validate request payloads?`}]},{id:"data-production",title:"Data Access and Production",blocks:[{type:"markdown",value:`1. How would you trace a request across multiple Spring Boot microservices?
2. What are the most common causes of connection-pool exhaustion?
3. @PathVariable vs @RequestParam?
4. How would you handle duplicate API requests in a payment service?
5. What is the N+1 query problem, and how do you fix it?
6. What is Spring Boot Actuator for, and which endpoints do you use most?
7. What happens if two users update the same record simultaneously?
8. How would you upload large files without causing memory issues?
9. Why might @Transactional not roll back a transaction?
10. How does Spring Boot manage database connections using HikariCP?
11. How would you secure REST APIs using Spring Security and JWT?
12. A production issue has no exceptions in logs. What is your debugging approach?
13. How would you improve a slow Spring Data JPA query?
14. Synchronous vs asynchronous processing in Spring Boot?
15. How does Spring Boot auto-configuration work internally?
16. What steps would you take before scaling a Spring Boot application?
17. BeanFactory vs ApplicationContext?
18. How would you debug an application that is slow only in production?`}]},{id:"transactions",title:"Spring Transactions",blocks:[{type:"markdown",value:`1. Why does @Transactional sometimes not work?
2. What exceptions trigger transaction rollback?
3. REQUIRED vs REQUIRES_NEW?
4. Explain all transaction propagation types.
5. What is transaction isolation?
6. Explain all isolation levels.
7. What causes dirty reads?
8. What causes phantom reads?
9. Why should API calls be avoided inside transactions?
10. What happens during nested transactions?
11. What is transaction synchronization?
12. How do you debug transaction issues?
13. What is the self-invocation problem?
14. How does Spring use proxies for transaction management?`}]},{id:"architecture",title:"Architecture Scenarios",blocks:[{type:"markdown",value:`1. An IoC-based production system fails intermittently under peak traffic. How do you investigate and redesign it?
2. Traffic grows 10\xD7 and the current IoC design becomes a bottleneck. What changes first?
3. A dependency outage cascades through the application. How do you contain it?
4. Concurrent requests interact with IoC-managed state and produce inconsistent results. How do you correct it?
5. How do you prove a redesign solved the production problem?
6. Auto-configuration causes intermittent failures. How do you investigate?
7. How would you isolate failures caused by misconfigured auto-configuration?
8. How do you handle concurrency issues introduced by shared bean state?
9. How would you validate the solution before production?
10. How would you design authentication for millions of users with Spring Security?
11. How do you prevent cascading failures across Spring Cloud microservices?
12. When would you choose WebFlux over Spring MVC?
13. How do you optimize Hibernate under heavy load?
14. How do you troubleshoot transaction deadlocks?
15. How do you design resilient distributed transactions with Saga?
16. How do you design a highly available Spring Boot architecture?
17. What trade-offs do you make when performance, consistency, and scalability conflict?
18. How do you deploy a new Spring Boot version with zero downtime?`}]},{id:"internals",title:"Boot Internals and Auto-Configuration",blocks:[{type:"markdown",value:`1. How does Spring Boot decide which auto-configuration to apply?
2. What happens internally when you add spring-boot-starter-web?
3. Why does Spring Boot prefer convention over configuration?
4. How does Spring Boot load application.properties internally?
5. What is the exact startup flow of a Spring Boot application?
6. @ComponentScan vs @SpringBootApplication?
7. How does Spring Boot detect and configure embedded Tomcat?
8. What happens if two beans of the same type exist without @Qualifier?
9. How does Spring Boot handle profile-specific configuration?
10. What is SpringFactoriesLoader's role?
11. @RestController vs @Controller internally?
12. How does Spring Boot manage dependency versions?
13. What is the lifecycle of a Spring bean?
14. Fat jar vs normal jar?
15. How does Spring Boot decide server-port priority?
16. What happens internally when you hit a REST endpoint?
17. How does Spring Boot integrate Actuator?
18. How does exception translation work?
19. What are common Spring Boot performance mistakes?`}]},{id:"security-basics",title:"Dependency Injection, Security, and Errors",blocks:[{type:"markdown",value:`1. What is Dependency Injection?
2. What are the types of Dependency Injection?
3. Explain the Spring Boot application flow.
4. How does Spring Security work?
5. Explain the JWT authentication flow.
6. How do you handle exceptions globally?
7. @Qualifier vs @Primary?
8. How do you perform graceful shutdown for in-flight requests?`}]}]},n=e;export{n as default};
