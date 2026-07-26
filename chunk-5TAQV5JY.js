import{a as e}from"./chunk-SQCOSIJN.js";import"./chunk-IFGU66OU.js";var s={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:`**REST** organizes APIs around **resources** and HTTP verbs on fixed endpoints. **GraphQL** exposes a **schema** and a single endpoint where clients request exactly the fields they need.

Related: [API Gateway](/designs/api-gateway), [Backend for Frontend](/designs/backend-for-frontend).`}]},{id:"rest",title:"What is REST?",blocks:[{type:"markdown",value:"REST is an architectural style (not a wire protocol): resources identified by URLs, manipulated with GET/POST/PUT/PATCH/DELETE, typically JSON + HTTP status codes. Stateless servers enable easy horizontal scale and CDN caching of GETs."},{type:"image",src:"assets/article-images/rest-vs-graphql/01-rest-resources.png",alt:"REST API with multiple resource endpoints for users and posts",caption:"Fixed resource endpoints. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"prosCons",title:"REST",pros:["Simple mental model and mature tooling","Excellent HTTP caching / CDN fit","Easy load balancing and third-party integration"],cons:["Over-fetching \u2014 endpoints return more than needed","Under-fetching \u2014 multiple round trips for related data","Versioning often via /v1, /v2 URLs"]}]},{id:"graphql",title:"What is GraphQL?",blocks:[{type:"markdown",value:"GraphQL (Facebook, 2015) lets clients declare the shape of the response. One `/graphql` endpoint + typed schema replaces many REST routes. Server resolvers assemble data from services/DBs."},{type:"image",src:"assets/article-images/rest-vs-graphql/02-graphql-query.png",alt:"GraphQL client sending a query to a single endpoint and getting precisely shaped data",caption:"Client-driven queries via one endpoint. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`**Three operations:**
- **Queries** \u2014 read (like GET)
- **Mutations** \u2014 write (like POST/PUT/DELETE)
- **Subscriptions** \u2014 real-time push (vs REST polling/WebSockets bolted on)`},{type:"prosCons",title:"GraphQL",pros:["Precise fetching \u2014 less over/under-fetch","One request for nested/related data","Strong schema; evolve fields without /v2","Native subscriptions for live updates"],cons:["More setup (schema, resolvers, tooling)","HTTP caching harder (often POST)","Arbitrary queries can overload the server","Need depth/cost limits against DoS"]}]},{id:"comparison",title:"How They Differ",blocks:[{type:"image",src:"assets/article-images/rest-vs-graphql/03-comparison.png",alt:"Side-by-side comparison of REST resource URLs versus GraphQL schema queries",caption:"Resources vs schema; server-shaped vs client-shaped responses. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"featureComparison",caption:"REST vs GraphQL.",columns:["REST","GraphQL"],rows:[{feature:"Contract",values:["URL + method","Typed schema"]},{feature:"Endpoints",values:["Many","Usually one"]},{feature:"Payload shape",values:["Server decides","Client decides"]},{feature:"Caching",values:["HTTP/CDN natural","Needs custom strategy"]},{feature:"Real-time",values:["Poll / WS custom","Subscriptions"]}]}]},{id:"when-to-pick",title:"Which Should You Pick?",blocks:[{type:"markdown",value:`**Prefer REST** when the API is simple, HTTP caching matters, you integrate third parties, or the team needs a fast standard approach.

**Prefer GraphQL** when many clients need different shapes, nested data is common, you want to avoid version churn, or subscriptions help.

**Use both:** GraphQL for product UIs; REST for admin, webhooks, and partner integrations.`}]},{id:"java-spring",title:"Java / Spring Notes",blocks:[{type:"code",language:"java",filename:"RestAndGraphql.java",code:`// REST \u2014 Spring MVC
@RestController
@RequestMapping("/api/users")
class UserController {
  @GetMapping("/{id}")
  UserDto get(@PathVariable long id) { return users.find(id); }

  @GetMapping("/{id}/posts")
  List<PostDto> posts(@PathVariable long id) { return posts.byUser(id); }
}

// GraphQL \u2014 Spring GraphQL @QueryMapping / @SchemaMapping
@Controller
class UserGraphql {
  @QueryMapping
  User user(@Argument long id) { return users.find(id); }

  @SchemaMapping
  List<Post> posts(User user) { return posts.byUser(user.id()); }
}
// Add query depth/complexity limits + DataLoader to avoid N+1 / DoS.`},{type:"callout",variant:"warning",title:"GraphQL performance guardrails",body:"Clients can craft expensive nested queries. Enforce **depth limits**, **cost analysis**, **timeouts**, and **DataLoader** batching \u2014 REST\u2019s fixed endpoints make accidental full-table scans less likely."}]},{id:"source",title:"Source",blocks:[{type:"callout",variant:"note",title:"Source",body:"Summarized from Ashish Pratap Singh\u2019s AlgoMaster article \u201CREST vs GraphQL,\u201D with Spring MVC / Spring GraphQL notes for this platform."}]}]},t=s;export{t as default};
