import{a as e}from"./chunk-YPUR77R4.js";import"./chunk-IFGU66OU.js";var r={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Model-View-Controller (MVC)** splits an interactive application into three roles: the **Model** holds data and business rules, the **View** renders state to the user, and the **Controller** handles input and coordinates updates. The goal is **separation of concerns** so UI and domain logic can evolve independently."},{type:"callout",variant:"info",title:"Web MVC note",body:"In classic Smalltalk MVC the view observes the model. In **Spring MVC / Rails**, the controller is request-centric: receive HTTP \u2192 update model/services \u2192 choose a view (or return JSON). Same three names, slightly different wiring."},{type:"table",caption:"Roles.",headers:["Role","Responsibility"],rows:[["Model","Domain state, validation, business rules"],["View","Presentation (HTML, JSON templates, UI widgets)"],["Controller","Interpret input, invoke model, select view"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **restaurant**: the kitchen (model) prepares food, the dining room presentation (view) shows the plate, and the waiter (controller) takes your order and coordinates kitchen \u2194 table."},{type:"mermaid",caption:"Typical web request flow.",definition:`sequenceDiagram
  participant U as User
  participant C as Controller
  participant M as Model/Service
  participant V as View
  U->>C: HTTP request
  C->>M: placeOrder(...)
  M-->>C: Order
  C->>V: render / return DTO
  V-->>U: HTML or JSON`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Server-rendered web","Spring MVC, ASP.NET MVC, Rails, Django"],["Desktop / early UI","Classic GUI frameworks with controllers"],["API + templates","Controller returns Thymeleaf/JSP views"],["Learning LLD","Baseline for comparing MVP and MVVM"],["CMS / admin panels","CRUD controllers over domain models"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Food-delivery style Spring MVC sketch (controller thin; domain in services):"},{type:"code",language:"java",filename:"OrderController.java",code:`@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final OrderService orders; // model/application layer

  public OrderController(OrderService orders) {
    this.orders = orders;
  }

  @PostMapping
  public OrderResponse place(@RequestBody PlaceOrderRequest req) {
    Order order = orders.place(req.userId(), req.items());
    return OrderResponse.from(order); // view = JSON DTO
  }

  @GetMapping("/{id}")
  public OrderResponse get(@PathVariable String id) {
    return OrderResponse.from(orders.get(id));
  }
}`},{type:"prosCons",title:"Trade-offs",pros:["Clear split of UI input, presentation, and domain.","Widely understood \u2014 easy onboarding and interviews.","Works well for request/response web apps."],cons:["\u201CFat controllers\u201D if business logic leaks upward.","Ambiguous variants (web MVC vs classic observer MVC).","Less ideal alone for rich client UIs (see MVP/MVVM)."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is MVC?",answer:"An architecture that separates **Model** (data/rules), **View** (presentation), and **Controller** (input/coordination) so UI and business logic are not tangled."},{question:"Where should business logic live?",answer:"In the **model / domain / application services**, not in controllers or views. Controllers should be thin adapters from HTTP (or UI events) to use cases."},{question:"MVC vs MVP vs MVVM?",answer:"**MVC**: controller handles input. **MVP**: presenter drives a passive view (great for unit tests). **MVVM**: view-model exposes bindable state; view binds declaratively (Angular, WPF, Android)."},{question:"Is Spring @RestController MVC?",answer:"Yes in the web sense: controller + model/services + \u201Cview\u201D as JSON serialization. There is often no HTML view, but the separation still applies."},{question:"What is a fat controller smell?",answer:"Controllers that validate complex rules, talk to repositories directly with transaction logic, and format responses all in one place. Extract application services and DTOs."},{question:"LLD tip?",answer:"For a parking-lot or food-app LLD, show `OrderController` \u2192 `OrderService` \u2192 repositories. Name the layers explicitly when asked about MVC."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. MVC = **Model + View + Controller** separation.
2. Keep controllers thin; domain logic in the model/services.
3. Real uses: **Spring MVC, Rails, server-rendered apps**.
4. Compare clearly with MVP and MVVM in interviews.`}]}]},o=r;export{o as default};
